const Course = require('../models/Course')

class CourseController {

    //[GET] /courses/:slug
    async details(req, res, next) {

        try {
            //Lấy khóa học trường slug = giá trị req.params.slug
            const course = await Course.findOne({slug: req.params.slug}).lean() 
            res.render('courses/details', { course })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/create
    create(req, res, next) {
        res.render()
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
            res.render('courses/edit', { course })
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /courses/:id
    async update(req, res, next) {
        try {
            await Course.updateOne({_id: req.params.id}, req.body)
            res.redirect('/me/stored/courses')
        } catch (error) {
            next(error)
        }
    }
    
    //[DELETE] /courses/:id Xóa giả
    async destroy(req, res, next) {
        try {
            await Course.delete({_id: req.params.id})
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /courses/:id/force
    async forceDestroy(req, res, next) {
        try {
            await Course.deleteOne({_id: req.params.id})
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
    async handleFormActions(req, res, next){
        switch(req.body.action){
            case 'delete':
                try {
                    await Course.delete({_id: req.body.courseIDs})
                    res.redirect('back') //'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({message: 'Action in valid'})
        }
    }

}

module.exports = new CourseController()
