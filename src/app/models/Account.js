const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { sortTable } = require('../../helpers/queryHelper'); 

const AccountSchema = new Schema(
    {
        fullName: { type: String, required: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String},
        avatar: { type: String},
        role_id: { type: String, required: true },
        status: { type: String, required: true }
    }, 
    { timestamps: true }
);

// Sử dụng query helper chung
AccountSchema.query.sortTable = sortTable;

module.exports = mongoose.model('Account', AccountSchema); // Collection - Schema
