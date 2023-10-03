import { Router } from "express";
import { SearchController, SearchHashtagController } from "~/controllers/search.controller";
import { PanagationValidator } from "~/middlewares/tweets.middlewate";


const searchRouter = Router()
/**
 * Description:  Search Tweet
 * Path: /search
 * Method: GET
 * Params: content : string, limit: number, page: number
*/

searchRouter.get('/', PanagationValidator, SearchController)

/**
 * Description: Search Hashtag
 * Path: /search/hashtag
 * Method: GET
 * Params: content : string, limit: number, page: number
*/
searchRouter.get('/hashtag', PanagationValidator, SearchHashtagController)

export default searchRouter

