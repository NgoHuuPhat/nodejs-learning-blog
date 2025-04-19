const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const { sortTable } = require('../../helpers/queryHelper')

const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        description: { type: String, maxLength: 600 },
        image: { type: String },
        videoID: { type: String, required: true },
        level: { type: String },

        //Tạo slug (unique duy nhất)
        slug: { type: String, slug: 'name', unique: true },

        //Thêm người tạo
        createdBy: {
            account_id: mongoose.Schema.ObjectId,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },

        //Thêm người xóa
        deletedBy: {
            account_id: mongoose.Schema.ObjectId,
            deletedAt: Date,
        },

        //Thêm người cập nhật
        updatedBy: [
            {
                account_id: mongoose.Schema.ObjectId,
                updatedAt: Date,
            },
        ],
    },
    {
        _id: false,
        timestamps: false,
    },
)

mongoose.plugin(slug)
CourseSchema.plugin(AutoIncrement) 

//Tránh trùng lặp ID nếu có nhiều collection dùng tăng tự động
// CourseSchema.plugin(AutoIncrement, {
//     inc_field: '_id', // Tên trường tự động tăng
//     id: 'course_seq', // Tên ID cho bộ đếm
// }) 


// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
CourseSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
CourseSchema.query.sortTable = sortTable

module.exports = mongoose.model('Course', CourseSchema) //Collection - Schema
