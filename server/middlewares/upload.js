import multer from 'multer'


export const uploadDepositScreenshot = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req,file,cb) =>{
      if(file.mimetype.startsWith('image/')) cb(null,true)
      else cb(new Error('Please upload only image files!'))
    }
})