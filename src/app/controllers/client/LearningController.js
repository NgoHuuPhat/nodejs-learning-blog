const Course = require('../../models/Course')
const Chapter = require('../../models/Chapter')
const Lesson = require('../../models/Lesson')
const UserCourse = require('../../models/UserCourse')
const {formatDuration, formatCurrency} = require('../../../utils/format')

class LearningController {  

    //[GET] /learning/:slug
    async learning(req, res, next) {
        try {   

            let chapters = []
            let lessonList = []
            let countLessons = 0
            let totalDuration = 0

            const course = await Course.findOne({
                slug: req.params.slug
            }).lean()

            if(course.price > 0) {
                // Kiểm tra người dùng đã mua khóa học chưa
                const userCourse = await UserCourse.findOne({
                    user_id: res.locals.account.id,
                    course_id: course._id,
                    status: 'active'
                })

                if (!userCourse) {
                    req.flash('error', 'Bạn chưa mua khóa học này!')
                    return res.redirect(`/courses/${course.slug}`)
                } 
            }

            // Thêm người dùng đã học khóa học này
            await UserCourse.create({
                user_id: res.locals.account.id,
                course_id: course._id,
                status: 'active',
            })

            // Lấy bài học tương ứng với id từ query string
            const lesson = await Lesson.findOne({
                _id: req.query.id
            }).lean()
            
            // Lấy chương học và danh sách bài học trong khóa học
            chapters = await Chapter.find({
                course_id: course._id
            }).lean()

            lessonList = await Lesson.find({
                chapter_id: {
                    $in: chapters.map(chapter => chapter._id)
                }
            }).lean()

            // Gắn bài học vào từng chương và thêm trang đánh dấu đầu tiên
            const currentLessonId = req.query.id

            chapters = chapters.map(chapter => {
                // Lọc các bài học thuộc chapter hiện tại
                const chapterLessons = lessonList.filter(lesson => lesson.chapter_id.toString() === chapter._id.toString())
                const countLessonsInChapter = chapterLessons.length

                // Tính tổng thời gian của các bài học trong chương
                totalDuration = chapterLessons.reduce((total, lesson)=> {
                    return total + lesson.videoLesson.duration
                }, 0)

                return {
                    ...chapter,
                    countLessonsInChapter,
                    totalDuration: formatDuration(totalDuration),
                    lessonList: chapterLessons.map(lesson => ({
                        ...lesson,
                        duration: formatDuration(lesson.videoLesson.duration),
                        isActive: lesson._id.toString() === currentLessonId, 
                    }))
                }
            })

            // Đếm tổng bài học trong khóa học
            countLessons = lessonList.length

            // Prev và next bài học
            const currentLessonIndex = lessonList.findIndex(l => l._id.toString() === currentLessonId)
            const prevLesson = currentLessonIndex > 0 ? lessonList[currentLessonIndex - 1] : null
            const nextLesson = currentLessonIndex < lessonList.length - 1 ? lessonList[currentLessonIndex + 1] : null

            res.render('client/learning/index', {
                course,
                lesson,
                lessonList,
                countLessons,
                totalDuration: formatDuration(totalDuration),
                course,
                chapters,
                prevLesson,
                nextLesson,
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new LearningController()
