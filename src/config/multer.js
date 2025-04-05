const multer = require('multer')
const path = require('path')

// Lưu file vào bộ nhớ tạm thời
const storage = multer.memoryStorage()

// Chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false)
    }
}

const upload = multer({ storage, fileFilter })

module.exports = upload
