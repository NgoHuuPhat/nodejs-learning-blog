const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const PostSchema = new Schema(
    {
        title: { type: String, required: true, unique: true },
        content: { type: String, required: true },
        image: { type: String },
        author: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        slug: { type: String, slug: 'title', unique: true },
    },
    { timestamps: true }
);

mongoose.plugin(slug)

module.exports = mongoose.model('Post', PostSchema) //Collection - Schema
