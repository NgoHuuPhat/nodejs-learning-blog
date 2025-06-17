const cloudinary = require('../../config/cloudinary')
const streamifier = require('streamifier')

module.exports =  function (req, res, next) {

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

    // Xử lí upload files
    const processUploads = async (req, res, next) => {
      try {
        const uploadPromises = []
        
        // Kiểm tra và upload từng file
        if(req.files){
          for(const fieldName in req.files) {
            const files = req.files[fieldName]
            for (const file of files) { 
              uploadPromises.push(uploadToCloudinary(file))
            }
          }
          
          // Chờ tất cả các upload hoàn thành
          const results = await Promise.all(uploadPromises)

          // Gắn kết quả vào req.file để sử dụng trong controller
          req.uploadResults = {}
          let resultIndex = 0

          for(const fieldName in req.files) {
            const files = req.files[fieldName]
            req.uploadResults[fieldName] = []
            for (const file of files) {
              req.uploadResults[fieldName].push(results[resultIndex])
              resultIndex++
            }
          }
        }

        next() 
      } catch (error) {
        console.error("Lỗi khi upload:", error)  
        res.status(500).send("Lỗi khi tải lên Cloudinary." + error.message)  
      }
    }

    processUploads(req, res, next)
}
