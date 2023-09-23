import { Router } from "express";
import { BookmarkController, UnBookmarkController } from "~/controllers/bookmark.controller";
import { BookmarkValidator } from "~/middlewares/bookmarks.middlewares";
import { AccessTokenValidator } from "~/middlewares/users.middlewares";


const routerBookmark = Router()

/**
 * Description: Bookmark
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {
            tweet_id: ObjectId
        }
 */
routerBookmark.post('/', AccessTokenValidator, BookmarkValidator, BookmarkController)

/**
 * Description: UnBookmark
 * Path: /bookmark/unbookmark
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {
            tweet_id: ObjectId
        }
 */

routerBookmark.post('/unbookmark', AccessTokenValidator, BookmarkValidator, UnBookmarkController)

export default routerBookmark;