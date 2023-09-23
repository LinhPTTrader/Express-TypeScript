import { NextFunction, Request, Response } from "express";
import { result } from "lodash";
import { ObjectId } from "mongodb";
import bookmarkService from "~/services/bookmarks.services";



export const BookmarkController = (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { tweet_id } = req.body;
    bookmarkService.BookmarkTweet(id, tweet_id)
        .then(result => {
            res.status(200).json({ message: "Bookmark success", result })
        })
        .catch(err => next(err))
}

export const UnBookmarkController = (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { tweet_id } = req.body;
    bookmarkService.UnBookmarkTweet(id, tweet_id)
        .then(result => {
            res.status(200).json({ message: "UnBookmark success", result })
        })
        .catch(err => next(err))
}

