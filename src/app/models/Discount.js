const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')
const { sortTable } = require('../../utils/queryHelper')

const Schema = mongoose.Schema

const DiscountSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String },
        type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
        applyToAllCourses: { type: Boolean, default: true },
        courseIds: [{ type: mongoose.Schema.Types.ObjectId }],
        value: { type: Number, required: true }, // 10% hoặc 100000
        maxUses: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        
        //Thêm người tạo
        createdBy: {
            account_id: mongoose.Schema.ObjectId,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },

        //Thêm người xóa
        deletedBy: {
            account_id: mongoose.Schema.ObjectId,
            deletedAt: Date,
        },

        //Thêm người cập nhật
        updatedBy: [
            {
                account_id: mongoose.Schema.ObjectId,
                updatedAt: Date,
            },
        ],
    },
    {
        timestamps: false,
    },
)

mongoose.plugin(slug)

// { overrideMethods: 'all' } Thay thế các phương thức bằng phương thức xóa mềm
DiscountSchema.plugin(mongooseDelete, {
    deletedAt: false,
    overrideMethods: 'all',
})

// Sử dụng query helper chung
DiscountSchema.query.sortTable = sortTable

module.exports = mongoose.model('Discount', DiscountSchema) //Collection - Schema
