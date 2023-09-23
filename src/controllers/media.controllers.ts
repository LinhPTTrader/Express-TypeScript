import { NextFunction, Request, Response } from "express"
import path from "path";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/messages";
import { AccessTokenMediaValidator } from "~/middlewares/medias.middlewares";
import { TokenPayload } from "~/models/request/User.requests";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import mediaService from "~/services/medias.services";




export const UploadImageController = async (req: Request, res: Response, next: NextFunction) => {
    mediaService.UploadImage(req)
        .then(result => {
            res.status(200).json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result })
        })
        .catch((err) => next(err))
}

export const ServerImageController = (req: any, res: Response, next: NextFunction) => {
    const { name } = req.params;
    const user_id = req.id;
    console.log(user_id, name)
    return res.sendFile(path.resolve('uploads/images', name), (err) => {
        if (err) {
            next(new ErrorWithStatus({ message: 'Not Found', status: HTTP_STATUS.NOT_FOUND }))
        }

    })
}

export const UploadVideoController = (req: Request, res: Response, next: NextFunction) => {
    mediaService.UploadVideo(req)
        .then(result => {
            res.status(200).json({ message: USERS_MESSAGES.UPLOAD_SUCCESS, result })
        })
        .catch((err) => next(err))
}

export const ServerVideoController = (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params
    return res.sendFile(path.resolve('uploads/videos', name), (err) => {
        if (err) {
            next(new ErrorWithStatus({ message: 'Not Found', status: HTTP_STATUS.NOT_FOUND }))
        }
    })
}
