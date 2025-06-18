const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const AutoIncrement = require('mongoose-sequence')(mongoose)
const { sortTable } = require('../../utils/queryHelper')

const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, maxLength: 600 },
        image: { 
            image_id: { type: String, required: true },
            url: { type: String, required: true },
         },
        level: { type: String, enum: ['Cơ bản', 'Trung bình', 'Nâng cao'], default: 'Cơ bản' },
        slug: { type: String, slug: 'name', unique: true },
        price: { type: Number, default: 0 },
        videoPreview: { 
            video_id: { type: String,},
            url: { type: String,}, 
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

mongoose.plugin(slug)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
CourseSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
CourseSchema.query.sortTable = sortTable

module.exports = mongoose.model('Course', CourseSchema) //Collection - Schema
