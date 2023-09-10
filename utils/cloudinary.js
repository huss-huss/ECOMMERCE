const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

const cloudinaryUploadImage = async (image) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(image, (err, result) => {
      if (err) throw new Error(err)
      resolve(
        {
          url: result.secure_url,
        },
        {
          resource_type: 'auto',
        }
      )
    })
  })
}

module.exports = cloudinaryUploadImage
