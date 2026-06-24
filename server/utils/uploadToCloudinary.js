import cloudinary from '../config/cloudinary.js'

export const uploadBase64URLToCloudinary = url =>{
  return cloudinary.uploader.upload(url,{
    folder:'logos',
    resource_type:'image',
    allowed_formats:['jpg','jpeg','png','webp']
  })
}