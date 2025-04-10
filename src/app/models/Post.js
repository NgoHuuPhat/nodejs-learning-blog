const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const { sortTable } = require('../../helpers/queryHelper')

const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        title: { type: String, required: true, unique: true },
        content: { type: String, required: true },
        thumbnail: { type: String },
        author: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        slug: { type: String, slug: 'title', unique: true },
        tags: [{ type: String }],
        views: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        deletedBy: {
            account_id: String,
            deletedAt: Date
        }
    },
    { timestamps: true }
);

mongoose.plugin(slug)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
PostSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
PostSchema.query.sortTable = sortTable

module.exports = mongoose.model('Post', PostSchema) //Collection - Schema
