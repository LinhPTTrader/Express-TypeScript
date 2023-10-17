import likeService from '~/services/likes.services';
import { LIKE_MESSAGES } from './../constants/messages';
import { NextFunction, Request, Response } from "express";
import { ErrorWithStatus } from '~/models/schemas/Errors';
import { HTTP_STATUS } from '~/constants/httpStatus';

export const LikeController = (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { tweet_id } = req.body;
    likeService.LikeTweet(id, tweet_id)
        .then(result => {
            console.log(result)
            res.status(200).json({ message: "Like success", result })
        })
        .catch(err => next(new ErrorWithStatus({ message: "ERROR", status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const UnLikeController = (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { tweet_id } = req.body;
    console.log(id, tweet_id)
    likeService.UnLikeTweet(id, tweet_id)
        .then(result => {
            res.status(200).json({ message: "UnLike success", result })
        })
        .catch(err => next(new ErrorWithStatus({ message: "ERROR", status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}
