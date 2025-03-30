const Course = require('../../models/Course')
const Account = require('../../models/Account')
const paginatitonHelper = require('../../../helpers/pagination')

class CourseController {

    //[GET] /admin/courses
    async index(req, res, next) {
        try {

            //Đếm số lượng khóa học
            const countCourses = await Course.countDocuments({ deleted: false }) 
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1
                },
                req.query,
                countCourses
            )

            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([
                Course.find({deleted: false}).sortTable(req).skip(objectPagination.skip).limit(objectPagination.limitItems).lean(), 
                Course.countDocumentsWithDeleted({deleted: true})
            ]) 

            //Lây ra tên người tạo
            for (let course of courses) {
                const user = await Account.findOne({_id: course.createdBy.account_id}).lean()
                
                if(user){
                    course.createdBy.name = user.fullName
                }
            }
            
            res.render('admin/courses/list', { courses, countDeleted, objectPagination, query: req.query })
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

            //Lưu người tạo khóa học
            req.body.createdBy = {
                account_id: res.locals.account.id,
            }

            //Gán giá trị image (Tương tự như default ở bên Schema)
            req.body.image = `https://i.ytimg.com/vi/${req.body.videoID}/hqdefault.jpg?s%E2%80%A6EIYAXABwAEG&rs=AOn4CLBwYwrOaKarfa87-f5y6U_UtM0Cfg`
            await Course.create(req.body) //Lưu vào database (có thể dùng .save())

            //Điều hướng về trang home
            res.redirect('/admin/courses')

        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/courses/trash
    async trashCourses(req, res, next){
        try {
            const courses = await Course.findWithDeleted({deleted: true}).lean()
            res.render('admin/courses/trash-courses', { courses })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/courses/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const course = await Course.findById(req.params.id).lean() 
            res.render('admin/courses/edit', { course })
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /admin/courses/:id
    async update(req, res, next) {
        try {

            //Thêm người cập nhật
            const updatedBy = {
                account_id: res.locals.account.id,
                updatedAt: new Date()
            }

            //Cập nhật khóa học
            await Course.updateOne({_id: req.params.id}, { ...req.body, $push: {updatedBy: updatedBy}})
            res.redirect('/admin/courses')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/courses/:id
    async destroy(req, res, next) {
        try {      

            //Xóa mềm lưu thông tin người xóa
            await Course.updateOne({_id: req.params.id},
                {
                    deletedBy: {
                        account_id: res.locals.account.id,
                        deletedAt: new Date()
                    }
                }
            )

            //Chính thức xóa mềm
            await Course.delete({_id: req.params.id})
            res.redirect(req.get('Referrer') || '/');//'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/courses/:id/restore
    async restore(req, res, next) {
        try {
            await Course.restore({ _id: req.params.id })
            res.redirect(req.get('Referrer') || '/');//'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/courses/handle-form-actions
    async handleFormActions(req, res, next){
         console.log(req.body);
        switch(req.body.action){
            case 'delete':
                try {
                    await Course.delete({_id: req.body.courseIDs})
                    res.redirect(req.get('Referrer') || '/');//'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({message: 'Action in valid'})
        }
    }

    //[DELETE] /admin/courses/:id/force
    async forceDestroy(req, res, next) {
        try {
            await Course.deleteOne({_id: req.params.id})
            res.redirect(req.get('Referrer') || '/');//'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new CourseController()
