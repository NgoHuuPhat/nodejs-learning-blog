const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

// Hàm uppload một file lên Cloudinary
  const uploadToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        
        const uploadOptions = {
          folder: `${file.fieldname}s`
        }

        // Nếu là video, thêm tùy chọn resource_type
        if (file.mimetype.startsWith('video/')) {
          uploadOptions.resource_type = 'video'
          uploadOptions.chunk_size = 6000000 
        }

        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (result) {
              resolve(result)
            } else {
              reject(error)
            }
          }
        )
        streamifier.createReadStream(file.buffer).pipe(stream)
      })
  }

// Hàm xóa file khỏi Cloudinary
const deleteFromCloudinary = (publicId, resource_type = 'image') => {
    return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId,{resource_type: resource_type}, (error, result) => {
        if (result) {
        resolve(result)
        } else {
        reject(error)
        }
    })
    })
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
}

