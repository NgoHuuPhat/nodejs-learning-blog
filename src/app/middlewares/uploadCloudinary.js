const cloudinary = require('../../config/cloudinary')
const streamifier = require('streamifier')
const { uploadToCloudinary } = require('../../utils/cloudinary')

module.exports =  function (req, res, next) {

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
