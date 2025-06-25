const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Chapter = require('../../models/Chapter')
const Lesson = require('../../models/Lesson')
const paginatitonHelper = require('../../../utils/pagination')
const { formatDate } = require('../../../utils/format')
const { deleteFromCloudinary } = require('../../../utils/cloudinary')
const { default: mongoose } = require('mongoose')

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
            // Xử lý upload ảnh và video
            let courseImage = null
            let videoPreview = null
            
            // Kiểm tra xem có file ảnh mới không
            if (req.uploadResults && req.uploadResults.courseImage) {
                courseImage = {
                    image_id: req.uploadResults.courseImage[0].public_id,
                    url: req.uploadResults.courseImage[0].secure_url,
                }
            }

            // Kiểm tra xem có file video giới thiệu mới không
            if (req.uploadResults && req.uploadResults.courseVideoPreview) {
                videoPreview = {
                    video_id: req.uploadResults.courseVideoPreview[0].public_id,
                    url: req.uploadResults.courseVideoPreview[0].secure_url,
                    duration: req.uploadResults.courseVideoPreview[0].duration,
                }
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

    //[PATCH] /admin/courses/:id
    async update(req, res, next) {
        try {
           
            // Kiểm tra khóa học có tồn tại không
            const exittingCourse = await Course.findById(req.params.id)
            if (!exittingCourse) {
                req.flash('error', 'Khóa học không tồn tại')
                return res.redirect('/admin/courses')
            }

            // Xử lý upload ảnh và video
            let courseImage = exittingCourse.image || null
            let videoPreview = exittingCourse.videoPreview || null
            
            // Kiểm tra xem có file ảnh mới không
            if (req.uploadResults && req.uploadResults.courseImage) {
                courseImage = {
                    image_id: req.uploadResults.courseImage[0].public_id,
                    url: req.uploadResults.courseImage[0].secure_url,
                }

                if (exittingCourse.image && exittingCourse.image.image_id) {
                    deleteFromCloudinary(exittingCourse.image.image_id, 'image')
                }
            }

            // Kiểm tra xem có file video giới thiệu mới không
            if (req.uploadResults && req.uploadResults.courseVideoPreview) {
                videoPreview = {
                    video_id: req.uploadResults.courseVideoPreview[0].public_id,
                    url: req.uploadResults.courseVideoPreview[0].secure_url,
                    duration: req.uploadResults.courseVideoPreview[0].duration,
                }

                if (exittingCourse.videoPreview && exittingCourse.videoPreview.video_id) {
                    // Xóa video cũ khỏi Cloudinary nếu có
                    deleteFromCloudinary(exittingCourse.videoPreview.video_id, 'video')
                } 
            }

            // Tạo Object khóa học và cap nhật thông tin
            const course = await Course.findByIdAndUpdate(req.params.id, {
                name: req.body.courseName,
                description: req.body.courseDescription,
                level: req.body.courseLevel,
                price: req.body.coursePrice,
                updatedBy: {
                    account_id: res.locals.account.id,
                    updatedAt: new Date(),
                },
                image: courseImage,
                videoPreview: videoPreview,
            }, {new: true}) 

            // Kiểm tra xem có dữ liệu courseStructure không
            if (!req.body.courseStructure) {
                return res.redirect('/admin/courses')
            }
            const courseStructure = JSON.parse(req.body.courseStructure)
            if(courseStructure){
    
                // Xóa các chương không có trong courseStructure 
                const chapterIds = courseStructure.map(chapter => chapter._id)
                const chaptersToDelete = await Chapter.find({ course_id: course._id, _id: {$nin: chapterIds} }).lean()
                await Chapter.deleteMany({
                    _id: { $nin: chapterIds }, 
                    course_id: course._id,
                })
                // Xóa video bài học tương ứng trong Cloudinary
                for (const chapter of chaptersToDelete) {
                    const lessonsToDelete = await Lesson.find({ chapter_id: chapter._id })
                    for (const lesson of lessonsToDelete) {
                        if (lesson.videoLesson && lesson.videoLesson.video_id) {
                            await deleteFromCloudinary(lesson.videoLesson.video_id, 'video')
                        }
                    }
                }
                await Lesson.deleteMany({
                    chapter_id: { $in: chaptersToDelete.map(chapter => chapter._id) },
                })
             
                // Cập nhật và tạo chương hiện có
                for (const chapter of courseStructure) {
                    if(chapter.isExisting && chapter._id) {
                        // Cập nhật chương hiện có
                        await Chapter.updateOne(
                            { _id: chapter._id },
                            {
                                title: chapter.title,
                                updatedBy: {
                                    account_id: res.locals.account.id,
                                    updatedAt: new Date(),
                                },
                            },
                        )
                    } else {
                        // Tạo chương mới
                        const newChapter = await Chapter.create({
                            course_id: course._id,
                            title: chapter.title,
                            createdBy: {
                                account_id: res.locals.account.id,
                                createdAt: new Date(),
                            },
                        })
                        chapter._id = newChapter._id // Cập nhật ID của chương mới vào chapter
                    }

                    // Xử lí bài học
                    const existingLessonIds = chapter.lessons
                        .filter(lesson => lesson.isExisting && lesson._id)
                        .map(lesson => lesson._id)

                    // Xử lí xóa trong Cloudinary
                    const lessonsToDelete = await Lesson.find({
                        chapter_id: chapter._id,
                        _id: { $nin: existingLessonIds },
                    }).lean()

                    // Xóa bài học không có trong chapter.lessons
                    for (const lesson of lessonsToDelete) {
                        if (lesson.videoLesson && lesson.videoLesson.video_id) {
                            await deleteFromCloudinary(lesson.videoLesson.video_id, 'video')
                        }
                    }

                    await Lesson.deleteMany({
                        chapter_id: chapter._id,
                        _id: { $nin: existingLessonIds },
                    })

                    // Xử lý từng bài học
                    let videoLessonIndex = 0
                    for(const lesson of chapter.lessons) {
                        if(lesson.isExisting && lesson._id) {
                            // Cập nhật bài học hiện có
                            const existingLesson = await Lesson.findById(lesson._id)
                            if(req.uploadResults && req.uploadResults.courseVideoLesson && req.uploadResults.courseVideoLesson[videoLessonIndex]) {
                                if (existingLesson.videoLesson && existingLesson.videoLesson.video_id) {
                                    await deleteFromCloudinary(existingLesson.videoLesson.video_id, 'video')
                                }
                                
                                await Lesson.updateOne(
                                    { _id: lesson._id },
                                    {
                                        title: lesson.title,
                                        videoLesson: {
                                            video_id: req.uploadResults.courseVideoLesson[videoLessonIndex].public_id || '',
                                            url: req.uploadResults.courseVideoLesson[videoLessonIndex].url || '',
                                            duration: req.uploadResults.courseVideoLesson[videoLessonIndex].duration || 0,
                                        },
                                        updatedBy: {
                                            account_id: res.locals.account.id,
                                            updatedAt: new Date(),
                                        },
                                    },
                                )
                            } else {
                                await Lesson.updateOne(
                                    { _id: lesson._id },
                                    {
                                        title: lesson.title,
                                        updatedBy: {
                                            account_id: res.locals.account.id,
                                            updatedAt: new Date(),
                                        },
                                    },
                                )
                            }
                            videoLessonIndex++
                        } else {
                            // Tạo bài học mới
                            await Lesson.create({
                                chapter_id: chapter._id,
                                title: lesson.title,
                                videoLesson: {
                                    video_id: req.uploadResults.courseVideoLesson[videoLessonIndex].public_id || '',
                                    url: req.uploadResults.courseVideoLesson[videoLessonIndex].url || '',
                                    duration: req.uploadResults.courseVideoLesson[videoLessonIndex].duration || 0,
                                },
                                createdBy: {
                                    account_id: res.locals.account.id,
                                    createdAt: new Date(),
                                },
                            })
                            videoLessonIndex++
                        }
                    }
                }
            }
            
            res.redirect('/admin/courses')
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
            const course = await Course.findOneWithDeleted({ _id: req.params.id }).lean()
            const chapters = await Chapter.findWithDeleted({ course_id: req.params.id }).lean()
            const chapterIds = chapters.map(chapter => chapter._id)
            const lessons = await Lesson.findWithDeleted({ chapter_id: { $in: chapterIds } }).lean()

            // Kiểm tra xóa ở Cloudinary
            if (course && course.videoPreview && course.videoPreview.video_id) {
                await deleteFromCloudinary(course.videoPreview.video_id, 'video')
            } 
            else if (course && course.image && course.image.image_id) {
                await deleteFromCloudinary(course.image.image_id, 'image')
            }

            for (const lesson of lessons) {
                if (lesson.videoLesson && lesson.videoLesson.video_id) {
                    await deleteFromCloudinary(lesson.videoLesson.video_id, 'video')
                }
            }

            // Xóa vĩnh viễn khóa học, chương và bài học
            await Course.deleteOne({ _id: req.params.id })
            await Chapter.deleteMany({ course_id: req.params.id })
            await Lesson.deleteMany({ chapter_id: { $in: chapterIds } })

            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
