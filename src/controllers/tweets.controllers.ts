import { result } from 'lodash';

import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { HTTP_STATUS } from "~/constants/httpStatus";
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

export const GetTweetcontroller = (req: any, res: Response, next: NextFunction) => {
    const user_id = req.id
    const tweet_id = req.params.tweet_id
    tweetService.GetTweet(tweet_id)
        .then(result => {
            tweetService.increaseView(tweet_id, user_id)
                .then(
                    result2 => {
                        // console.log(result2)
                        res.json({ ...result[0], guest_views: result2?.guest_views, user_views: result2?.user_views })
                    }
                )
                .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))

        })
        .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}


export const GetTweetChildrencontroller = (req: any, res: Response, next: NextFunction) => {
    const { tweet_id } = req.params;
    const { limit, page, tweet_type } = req.query;
    const user_id = req.id

    tweetService.GetTweetChildren(Number(limit), Number(page), Number(tweet_type), tweet_id)
        .then(result => {
            tweetService.increaseView(tweet_id, user_id)
                .then(
                    result2 => {
                        // console.log(result2)
                        res.json({ ...result[0], guest_views: result2?.guest_views, user_views: result2?.user_views })
                    }
                )
                .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
        })
        .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}


export const GetNewFeedController = (req: any, res: Response, next: NextFunction) => {
    const user_id = req.id;
    const { limit, page } = req.query;
    tweetService.GetNewFeed(user_id, Number(limit), Number(page))
        .then(result => {
            // const arrTweedId = result.map(tweet => tweet._id)
            // // console.log(result)
            // tweetService.increaseViewNewFeed(arrTweedId, user_id)
            //     .then(result2 => {
            //         console.log(result2)
            //         res.json(result2)
            //     })
            res.status(200).json({ data: result })
        })
        .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}


export const GetUserTweetController = (req: any, res: Response, next: NextFunction) => {
    const user_id = req.id;
    const { limit, page } = req.query;
    tweetService.GetUserTweet(user_id, Number(limit), Number(page))
        .then(result => {
            // const arrTweedId = result.map(tweet => tweet._id)
            // // console.log(result)
            // tweetService.increaseViewNewFeed(arrTweedId, user_id)
            //     .then(result2 => {
            //         console.log(result2)
            //         res.json(result2)
            //     })
            res.status(200).json({ data: result })
        })
        .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}
