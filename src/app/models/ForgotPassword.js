const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ForgotPasswordSchema = new Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expireAt: { type: Date, expires: 180 }, // Thời gian hết hạn là 3 phút
    },
    { timestamps: true },
)

module.exports = mongoose.model('ForgotPassword', ForgotPasswordSchema) // Collection - Schema
