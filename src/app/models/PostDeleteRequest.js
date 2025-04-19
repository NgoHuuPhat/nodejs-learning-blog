const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostDeleteRequestSchema = new Schema(
    {
        post_id: { type: mongoose.Schema.ObjectId, required: true },
        user_id: { type: mongoose.Schema.ObjectId, required: true }, 
        reason: { type: String, required: true }, 
    },
    { timestamps: true },
)

module.exports = mongoose.model('PostDeleteRequest', PostDeleteRequestSchema) // Collection - Schema
