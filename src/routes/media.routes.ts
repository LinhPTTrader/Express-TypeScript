import { Router } from 'express'
import { UploadImageController, UploadVideoController } from '~/controllers/media.controllers';


const mediaRouter = Router()

/**
 * Description:  Upload-File
 * Path: /upload-image
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: { file.img}
 */

mediaRouter.post('/upload-image', UploadImageController)


/**
 * Description:  Upload-File
 * Path: /upload-video
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: { file.mp4}
 */
mediaRouter.post('/upload-video', UploadVideoController)



export default mediaRouter;