import { NextFunction, Request, Response } from "express"
import path from "path";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import mediaService from "~/services/medias.services";




export const UploadImageController = async (req: Request, res: Response, next: NextFunction) => {
    mediaService.uploadImage(req)
        .then(result => {
            res.status(200).json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result })
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const serverImageController = (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params
    return res.sendFile(path.resolve('uploads/images', name), (err) => {
        next(new ErrorWithStatus({ message: 'Not Found', status: HTTP_STATUS.NOT_FOUND }))
    })
}

export const UploadVideoController = (req: Request, res: Response, next: NextFunction) => {
    mediaService.UploadVideo(req)
        .then(result => {
            res.status(200).json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result })
        })
        .catch((err) => next(err))
}