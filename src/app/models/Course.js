const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const mongooseDelete = require('mongoose-delete');


const Schema = mongoose.Schema;

const Course = new Schema({
    name: { type: String, required: true },
    description: { type: String, maxLength: 600 },
    image: { type: String },
    videoID: { type: String, required: true },
    level: { type: String },
    //Tạo slug (unique duy nhất)
    slug: { type: String, slug: 'name', unique: true}
}, { timestamps: true });

mongoose.plugin(slug);
// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
Course.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Course', Course); //Collection - Schema
