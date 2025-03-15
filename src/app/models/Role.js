const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, maxLength: 600 },
        permissions: { type: [String], default: [] } // Đảm bảo phần tử phải là String
    }, 
    { timestamps: true }
)

module.exports = mongoose.model('Role', RoleSchema) //Collection - Schema
