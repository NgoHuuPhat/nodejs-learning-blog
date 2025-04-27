const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')
const { sortTable } = require('../../helpers/queryHelper')

const Schema = mongoose.Schema


const CommentSchema = new Schema(
    {
        user_id: {type: mongoose.Schema.ObjectId, required: true},
        post_id: {type: mongoose.Schema.ObjectId, required: true},
        content: {type: String, required: true},
        replies: [
            {
                user_id: {type: mongoose.Schema.ObjectId, required: true},
                content: {type: String, required: true},
                replyToUserId: {type: mongoose.Schema.ObjectId, required: true},
                createdAt: {type: Date},
                updatedAt: {type: Date},
                deleted: {type: Boolean, default: false},
                deletedBy: {
                    account_id: mongoose.Schema.ObjectId,
                    deletedAt: Date,
                },
                deletedbyParent: {type: Boolean, default: false},
            }
        ],

        // Thêm người xóa
        deletedBy: {
            account_id: mongoose.Schema.ObjectId,
            deletedAt: Date,
        },
    },
    { timestamps: true },
)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
CommentSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
CommentSchema.query.sortTable = sortTable

module.exports = mongoose.model('Comment', CommentSchema) // Collection - Schema
