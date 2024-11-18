const Course = require('../models/Course');

class CourseController {

    //[GET] /courses/:slug
    async details(req, res, next) {

        try {
            //Lấy khóa học trường slug = giá trị req.params.slug
            const course = await Course.findOne({slug: req.params.slug}).lean(); 
            res.render('courses/details', { course })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/create
    create(req, res, next) {
        res.render('courses/create')
    }

    //[POST] /courses/store
    async store(req, res, next) {

        try {
        //Gán giá trị image (Tương tự như default ở bên Schema)
        const formData = req.body
        formData.image = `https://i.ytimg.com/vi/${req.body.videoID}/hqdefault.jpg?s%E2%80%A6EIYAXABwAEG&rs=AOn4CLBwYwrOaKarfa87-f5y6U_UtM0Cfg`
        await Course.create(formData); //Lưu vào database (có thể dùng .save())

        //Điều hướng về trang home
        res.redirect('/')
    
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const course = await Course.findById(req.params.id).lean(); 
            res.render('courses/edit', { course })
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /courses/:id
    async update(req, res, next) {
        try {
            await Course.updateOne({_id: req.params.id}, req.body);
            res.redirect('/me/stored/courses')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /courses/:id
    async destroy(req, res, next) {
        try {
            await Course.deleteOne({_id: req.params.id});
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController();
