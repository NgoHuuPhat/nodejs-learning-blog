const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const { sortTable } = require('../../helpers/queryHelper')

const Schema = mongoose.Schema

const ChapterSchema = new Schema(
    {
        course_id: { type: Number, required: true },
        title: { type: String, required: true },  

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
        timestamps: false,
    },
)

mongoose.plugin(slug)
//Tránh trùng lặp ID nếu có nhiều collection dùng tăng tự động
// ChapterSchema.plugin(AutoIncrement, {
//     inc_field: '_id', // Tên trường tự động tăng
//     id: 'course_seq', // Tên ID cho bộ đếm
// }) 

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
ChapterSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
ChapterSchema.query.sortTable = sortTable

module.exports = mongoose.model('Chapter', ChapterSchema) //Collection - Schema
