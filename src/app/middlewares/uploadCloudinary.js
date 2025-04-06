const cloudinary = require('../../config/cloudinary')
const streamifier = require('streamifier')

module.exports =  function (req, res, next) {
      if(req.file) {
          let streamUpload = (req) => {
              return new Promise((resolve, reject) => {
                  let stream = cloudinary.uploader.upload_stream({folder: `${req.file.fieldname}s`},(error, result) => {
                      if (result) {
                        resolve(result)
                      } else {
                        reject(error)
                      }
                    }
                  )
                streamifier.createReadStream(req.file.buffer).pipe(stream)
              })
          }

          async function upload(req) {
            try {
                let result = await streamUpload(req)  
                req.file.cloudinary_url = result.secure_url //An toàn hơn url
                next()
            } catch (error) {
                console.error("Lỗi khi upload:", error)  
                res.status(500).send("Lỗi khi tải lên Cloudinary.")  
            }
          }
        upload(req) 
      } else {
          next()
      }
}
