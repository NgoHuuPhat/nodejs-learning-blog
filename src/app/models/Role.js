const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { sortTable } = require('../../utils/queryHelper')

const RoleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, maxLength: 600 },
        permissions: { type: [String], default: [] }, // Đảm bảo phần tử phải là String
    },
    { timestamps: true },
)

// Sử dụng query helper chung
RoleSchema.query.sortTable = sortTable

module.exports = mongoose.model('Role', RoleSchema) //Collection - Schema
