const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentSchema = new Schema(
    {
        user_id: { type: mongoose.Schema.ObjectId, required: true },
        course_id: { type: mongoose.Schema.ObjectId, required: true },
        amount: Number, // Số tiền thanh toán
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
        order_id: { type: String}, // mã đơn hàng sinh ra từ hệ thống thanh toán (tham số vnp_Txnref)
        bank_code: { type: String }, // mã ngân hàng thanh toán (tham số vnp_BankCode)
        vnp_ResponseCode: { type: String }, // mã phản hồi từ hệ thống thanh toán (tham số vnp_ResponseCode)
        payDate: { type: Date }, // Thời gian thanh toán (vnp_PayDate)
        expireAt: { type: Date, expires: 3600 },
        discount_code: { type: mongoose.Schema.ObjectId }, // Mã giảm giá nếu có
        discount_amount: { type: Number, default: 0 }, // Số tiền giảm giá nếu có
    }, 
    { 
      timestamps: true,
    }
)

module.exports = mongoose.model('Payment', PaymentSchema)  // Collection - Schema
