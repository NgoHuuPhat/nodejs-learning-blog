const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { sortTable } = require('../../utils/queryHelper')

const AccountSchema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { 
            type: String, 
            required: function() {
                // Chỉ yêu cầu password nếu loginType là 'local'
                return this.loginType === 'local';
            }
         },
        phone: { type: String },
        avatar: { type: String },
        role_id: { type: mongoose.Schema.ObjectId, required: true },
        status: { type: String, required: true },
        loginType: { type: String, enum:['local','google'], required: true, default: 'local' },
    },
    { timestamps: true },
)

// Sử dụng query helper chung
AccountSchema.query.sortTable = sortTable

module.exports = mongoose.model('Account', AccountSchema) // Collection - Schema
