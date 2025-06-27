const Course = require('../../models/Course')
const Chapter = require('../../models/Chapter')
const Lesson = require('../../models/Lesson')
const UserCourse = require('../../models/UserCourse')
const {formatDuration, formatCurrency} = require('../../../utils/format')

class CourseController {
    //[GET] /courses/:slug
    async details(req, res, next) {
        try {

            let countChapters = 0
            let countLessons = 0
            let totalDuration = 0 
            let chapters =  []
            let lessons = []

            // Lấy khóa học trường slug = giá trị req.params.slug
            const course = await Course.findOne({
                slug: req.params.slug,
            }).lean()
            
            if(course){
                // Kiểm tra người dùng đã mua khóa học chưa
                const userCourse = await UserCourse.findOne({
                    user_id: res.locals.account.id,
                    course_id: course._id,
                    status: 'active'
                })

                if(userCourse) {
                    const firstChapter = await Chapter.findOne({ course_id: course._id }).sort({ _id: 1 })
                    if( firstChapter) {
                        const lessonIdFirst = await Lesson.findOne({ chapter_id: firstChapter._id }).sort({ _id: 1 })
                        if(lessonIdFirst) {
                            res.redirect(`/learning/${course.slug}?id=${lessonIdFirst._id}`)
                        }      
                    }   
                }
                
                // Định dạng giá tiền
                course.price = formatCurrency(course.price) 

                // Đếm số chương của khóa học
                chapters = await Chapter.find({ course_id: course._id }).lean()
                countChapters = chapters.length

                const chapterIds = chapters.map(chapter => chapter._id)
                lessons = await Lesson.find({ chapter_id: { $in: chapterIds } }).lean()

                // Gắn bài học vào từng chương
                chapters = chapters.map(chapter => {
                    // Lọc các bài học thuộc chapter hiện tại
                    const chapterLessons = lessons.filter(lesson => lesson.chapter_id.toString() === chapter._id.toString())
                    const countLessonsInChapter = chapterLessons.length
                    return {
                        ...chapter,
                        countLessonsInChapter,
                        lessons: chapterLessons.map(lesson => ({
                            ...lesson,
                            duration: formatDuration(lesson.videoLesson.duration),
                        }))
                    }
                })

                // Tổng số lượng thời gian của bài học
                totalDuration = lessons.reduce((total, lesson)=> {
                    return total + lesson.videoLesson.duration
                }, 0)
                
                // Đếm số bài học  của khóa học
                countLessons = await Lesson.countDocuments({ chapter_id: { $in: chapterIds } })

            }
            res.render('client/courses/details', { 
                course, 
                chapters, 
                lessons, 
                countChapters, 
                countLessons, 
                totalDuration: formatDuration(totalDuration),
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/create
    create(req, res, next) {
        res.render('client/courses/create')
    }

    //[POST] /courses/store
    async store(req, res, next) {
        try {
            //Gán giá trị image (Tương tự như default ở bên Schema)
            req.body.image = `https://i.ytimg.com/vi/${req.body.videoID}/hqdefault.jpg?s%E2%80%A6EIYAXABwAEG&rs=AOn4CLBwYwrOaKarfa87-f5y6U_UtM0Cfg`
            await Course.create(req.body) //Lưu vào database (có thể dùng .save())
            //Điều hướng về trang home
            res.redirect('/me/stored/courses')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const course = await Course.findById(req.params.id).lean()
            res.render('client/courses/edit', { course })
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /courses/:id
    async update(req, res, next) {
        try {
            await Course.updateOne({ _id: req.params.id }, req.body)
            res.redirect('/me/stored/courses')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /courses/:id Xóa giả
    async destroy(req, res, next) {
        try {
            await Course.delete({ _id: req.params.id })
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /courses/:id/force
    async forceDestroy(req, res, next) {
        try {
            await Course.deleteOne({ _id: req.params.id })
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /courses/:id/restore
    async restore(req, res, next) {
        try {
            await Course.restore({ _id: req.params.id })
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[POST] /courses/handle-form-actions
    async handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                try {
                    await Course.delete({ _id: req.body.courseIDs })
                    res.redirect('back') //'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({ message: 'Action in valid' })
        }
    }
}

module.exports = new CourseController()
