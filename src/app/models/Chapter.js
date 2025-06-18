const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')
const { sortTable } = require('../../utils/queryHelper')

const Schema = mongoose.Schema

const ChapterSchema = new Schema(
    {
        course_id: { type: mongoose.Schema.ObjectId},
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

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
ChapterSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
ChapterSchema.query.sortTable = sortTable

module.exports = mongoose.model('Chapter', ChapterSchema) //Collection - Schema
