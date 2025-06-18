const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const { sortTable } = require('../../utils/queryHelper')

const Schema = mongoose.Schema

const LessonSchema = new Schema(
    {
        chapter_id: { type: mongoose.Schema.ObjectId, required: true },
        title: { type: String, required: true },
        videoLesson: { 
            video_id: { type: String, },
            url: { type: String,  }, 
            duration: { type: Number, default: 0 }, 
         }, 
        
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
LessonSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
LessonSchema.query.sortTable = sortTable

module.exports = mongoose.model('Lesson', LessonSchema) //Collection - Schema
