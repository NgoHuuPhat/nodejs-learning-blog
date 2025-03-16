const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, maxLength: 600 },
        permissions: { type: [String], default: [] } // Đảm bảo phần tử phải là String
    }, 
    { timestamps: true }
)

//Custom query helpers (Tối ưu hardcode => Xây dựng method sử dụng được nhiều lần)
RoleSchema.query.sortTable = function(req) {
    if(req.query.hasOwnProperty('_sort')){
        const isValidType = ['asc', 'desc'].includes(req.query.type)
        return this.sort({
            [req.query.column] : isValidType ? req.query.type : 'desc'
        })
    }
    return this
  };

module.exports = mongoose.model('Role', RoleSchema) //Collection - Schema
