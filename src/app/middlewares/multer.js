const multer = require('multer')
const path = require('path')

// Lưu file vào bộ nhớ tạm thời
const storage = multer.memoryStorage()

// Chấp nhận cả file ảnh và file video
const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true) 
    } else {
        cb(new Error('Chỉ cho phép tải lên ảnh hoặc video!'), false)
    }
}

const upload = multer({ storage, fileFilter })
module.exports = upload
