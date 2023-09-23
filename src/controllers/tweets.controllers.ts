
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { TWEETS_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import tweetService from "~/services/tweets.services";


export const TweetController = (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    tweetService.CreateTweet(req.body, id)
        .then(result => {
            res.status(200).json({ message: 'Tweet success' })
        })
        .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const GetTweetcontroller = (req: Request, res: Response, next: NextFunction) => {

}