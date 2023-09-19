import { Router } from 'express'
import { UploadSingleImageController } from '~/controllers/media.controllers';


const mediaRouter = Router()

mediaRouter.post('/upload-image', UploadSingleImageController)

export default mediaRouter;