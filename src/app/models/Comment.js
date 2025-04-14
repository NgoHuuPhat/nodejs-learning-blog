const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema(
    {
        user_id: {type: String, required: true},
        post_id: {type: String, required: true},
        content: {type: String, required: true},
        replies: [
            {
                user_id: {type: String, required: true},
                content: {type: String, required: true},
                createdAt: {type: Date, default: Date.now()}
            }
        ]
    },
    { timestamps: true },
)

module.exports = mongoose.model('Comment', CommentSchema) // Collection - Schema
