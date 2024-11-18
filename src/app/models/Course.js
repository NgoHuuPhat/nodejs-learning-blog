const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

const Schema = mongoose.Schema;

mongoose.plugin(slug);

const Course = new Schema({
    name: { type: String, required: true },
    description: { type: String, maxLength: 600 },
    image: { type: String },
    videoID: { type: String, required: true },
    level: { type: String },
    //Tạo slug (unique duy nhất)
    slug: { type: String, slug: 'name', unique: true}
}, { timestamps: true });


module.exports = mongoose.model('Course', Course); //Collection - Schema
