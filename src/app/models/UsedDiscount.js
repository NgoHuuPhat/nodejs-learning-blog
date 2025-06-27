const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UsedDiscountSchema = new Schema({
    user_id: { type: mongoose.Schema.ObjectId, required: true },
    discountCode: { type: mongoose.Schema.ObjectId, required: true },
    usedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('UsedDiscount', UsedDiscountSchema)
