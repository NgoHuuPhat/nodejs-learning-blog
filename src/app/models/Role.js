const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')
const Schema = mongoose.Schema

const RoleSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, maxLength: 600 },
    }, 
    { 
        timestamps: true 
    }
)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
RoleSchema.plugin(mongooseDelete, { 
    deletedAt : true,
    overrideMethods: 'all',
})

module.exports = mongoose.model('Role', RoleSchema ) //Collection - Schema
