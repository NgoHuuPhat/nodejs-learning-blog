const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Chapter = require('../../models/Chapter')
const Lesson = require('../../models/Lesson')
const paginatitonHelper = require('../../../helpers/pagination')
const { formatDate } = require('../../../helpers/format')
const { uploadCloudinary } = require('../../middlewares/uploadCloudinary')
const { image } = require('../../../config/cloudinary')

class CourseController {
    //[GET] /admin/courses
    async index(req, res, next) {
        try {
            //Đếm số lượng khóa học
            const countCourses = await Course.countDocuments({ deleted: false })
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countCourses,
            )

            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([
                Course.find({ deleted: false })
                    .sortTable(req)
                    .skip(objectPagination.skip)
                    .limit(objectPagination.limitItems)
                    .lean(),
                Course.countDocumentsWithDeleted({ deleted: true }),
            ])

            //Lây ra tên người tạo
            for (let course of courses) {
                const user = await Account.findOne({
                    _id: course.createdBy.account_id,
                }).lean()

                if (user) {
                    course.createdBy.name = user.fullName
                }

                course.createdAt = formatDate(course.createdBy.createdAt)
                console.log(course.createdAt)
            }

            res.render('admin/courses/list', {
                courses,
                countDeleted,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/create
    create(req, res, next) {
        res.render('admin/courses/create')
    }

    //[POST] /courses/store
    async store(req, res, next) {
        try {
            console.log(req.uploadResults)
            // Xử lý upload ảnh và video
            let courseImage = ''
            let videoPreview = null
            
            // Kiểm tra xem có file ảnh mới không
            if (req.uploadResults && req.uploadResults.courseImage) {
                courseImage = req.uploadResults.courseImage[0].secure_url
            }

            // Kiểm tra xem có file video giới thiệu mới không
            if (req.uploadResults && req.uploadResults.courseVideoPreview) {
                videoPreview = {
                    video_id: req.uploadResults.courseVideoPreview[0].public_id,
                    url: req.uploadResults.courseVideoPreview[0].secure_url,
                    duration: req.uploadResults.courseVideoPreview[0].duration,
                }
                console.log('videoPreview:', videoPreview)
            }
            
            const courseStructure = JSON.parse(req.body.courseStructure)

            // Tạo Object khóa học
            const course = await Course.create({
                name: req.body.courseName,
                description: req.body.courseDescription,
                level: req.body.courseLevel,
                price: req.body.coursePrice,
                createdBy: {
                    account_id: res.locals.account.id,
                    createdAt: new Date(),
                },
                image: courseImage,
                videoPreview: videoPreview,
            })

            // Tạo Object lưu chương trình học
            const chaptersData = courseStructure.map((chapter) => {
                return {
                    course_id: course._id,
                    title: chapter.title,
                    createdBy: {
                        account_id: res.locals.account.id,
                        createdAt: new Date(),
                    },
                }
            })
            const savedChapters = await Chapter.insertMany(chaptersData) // Dùng insertMany để lưu nhiều chương cùng lúc thay vì create từng cái

            // Tạo Object lưu bài học
            let courseVideoLesson = []
            let indexLesson = 0
            const lessons = []

            // Kiểm tra xem có file video bài học mới không
            if( req.uploadResults && req.uploadResults.courseVideoLesson) {
                courseVideoLesson = req.uploadResults.courseVideoLesson
            }

            courseStructure.forEach((chapter, index) => {
                const chapterId = savedChapters[index]._id 

                chapter.lessons.forEach((lesson) => {
                    // Kiểm tra videoLesson có dữ liệu không, nếu không thì để rỗng
                    const videoLesson = courseVideoLesson[indexLesson] || {}
                
                    lessons.push({
                        chapter_id: chapterId,
                        title: lesson.title,
                        videoLesson: {
                            video_id: videoLesson.public_id || '',
                            url: videoLesson.secure_url || '',
                            duration: videoLesson.duration || 0,
                        },
                        createdBy: {
                            account_id: res.locals.account.id,
                            createdAt: new Date(),
                        },
                    })  
                    indexLesson++
                })
            })
            await Lesson.insertMany(lessons)

            //Điều hướng về trang home
            res.redirect('/admin/courses')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/courses/trash
    async trashCourses(req, res, next) {
        try {
            const courses = await Course.findWithDeleted({
                deleted: true,
            }).lean()
            res.render('admin/courses/trash-courses', { courses })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/courses/:id/edit
    async edit(req, res, next) {
        try {

            //Lấy khóa học theo ID
            const course = await Course.findOne({ _id: req.params.id }).lean()
            if (!course) {
                return res.status(404).send('Course not found')
            }
            course.price = course.price.toString()
            
            //Lấy danh sách chương học
            const chapters = await Chapter.find({ course_id: course._id }).lean()
            if (!chapters) {
                return res.status(404).send('Chapters not found')
            }
            
            //Lấy danh sách bài học
            const lessons = await Lesson.find({ chapter_id: {$in: chapters.map(chapter => chapter._id)} }).lean()
            
            res.render('admin/courses/edit', {
                course,
                chapters,
                lessons,
            })

        } catch (error) {
            next(error)
        }
    }


    //[DELETE] /admin/courses/:id
    async destroy(req, res, next) {
        try {
            //Xóa mềm lưu thông tin người xóa khóa học
            await Course.updateOne(
                { _id: req.params.id },
                {
                    deletedBy: {
                        account_id: res.locals.account.id,
                        deletedAt: new Date(),
                    },
                },
            )

            // Xóa mềm lưu thông tin người xóa chương học
            await Chapter.updateMany(
                { course_id: req.params.id },
                {
                    deletedBy: {
                        account_id: res.locals.account.id,
                        deletedAt: new Date(),
                    },
                },
            )
            
            // Xóa mềm lưu thông tin người xóa bài học
            const chapters = await Chapter.find({ course_id: req.params.id }).lean()
            const chapterIds = chapters.map(chapter => chapter._id)
            await Lesson.updateMany(
                { chapter_id: { $in: chapterIds } },
                {
                    deletedBy: {
                        account_id: res.locals.account.id,
                        deletedAt: new Date(),
                    },
                },
            )

            //Chính thức xóa mềm 
            await Course.delete({ _id: req.params.id })
            await Chapter.delete({ course_id: req.params.id })
            await Lesson.delete({ chapter_id: { $in: chapterIds } })
            
            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/courses/:id/restore
    async restore(req, res, next) {
        try {

            await Course.restore({ _id: req.params.id })
            await Chapter.restore({ course_id: req.params.id })

            const chapters = await Chapter.find({ course_id: req.params.id }).lean()
            const chapterIds = chapters.map(chapter => chapter._id)
            await Lesson.restore({ chapter_id: { $in: chapterIds } })

            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/courses/handle-form-actions
    async handleFormActions(req, res, next) {
        console.log(req.body)
        switch (req.body.action) {
            case 'delete':
                try {
                    await Course.delete({ _id: req.body.courseIDs })
                    res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({ message: 'Action in valid' })
        }
    }

    //[DELETE] /admin/courses/:id/force
    async forceDestroy(req, res, next)  {
        try {
            const chapters = await Chapter.find({ course_id: req.params.id }).lean()
            const chapterIds = chapters.map(chapter => chapter._id)

            await Lesson.deleteMany({ chapter_id: { $in: chapterIds } })
            await Course.deleteOne({ _id: req.params.id })
            await Chapter.deleteMany({ course_id: req.params.id })

            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
