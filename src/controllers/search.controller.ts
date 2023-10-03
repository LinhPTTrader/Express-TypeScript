import { ParamsDictionary } from 'express-serve-static-core';
import { NextFunction, Request, Response } from "express";
import { SearchQuery } from '~/models/request/Search.request';
import searchSerives from '~/services/search.services';
import { ErrorWithStatus } from '~/models/schemas/Errors';
import { HTTP_STATUS } from '~/constants/httpStatus';


export const SearchController = (req: any, res: Response, next: NextFunction) => {
    searchSerives.SearchAdvances(req.query)
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            console.log(err)
            next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
        })
}

export const SearchHashtagController = (req: any, res: Response, next: NextFunction) => {
    searchSerives.SearchHashtag(req.query)
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            console.log(err)
            next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
        })
}