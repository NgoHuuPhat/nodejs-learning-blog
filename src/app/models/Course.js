const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const AutoIncrement = require('mongoose-sequence')(mongoose);


const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        description: { type: String, maxLength: 600 },
        image: { type: String },
        videoID: { type: String, required: true },
        level: { type: String },
        //Tạo slug (unique duy nhất)
        slug: { type: String, slug: 'name', unique: true}
    }, 
    { 
        _id: false,
        timestamps: true 
    }
)

mongoose.plugin(slug)
CourseSchema.plugin(AutoIncrement)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
CourseSchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all',
})

//Custom query helpers (Tối ưu hardcode => Xây dựng method sử dụng được nhiều lần)
CourseSchema.query.sortTable = function(req) {
    if(req.query.hasOwnProperty('_sort')){
        const isValidType = ['asc', 'desc'].includes(req.query.type)
        return this.sort({
            [req.query.column] : isValidType ? req.query.type : 'desc'
        })
    }
    return this
  };

module.exports = mongoose.model('Course', CourseSchema) //Collection - Schema
