import { Router } from "express";
import { LikeController, UnLikeController } from "~/controllers/likes.controller";
import { LikeValidator } from "~/middlewares/likes.middlewares";
import { AccessTokenValidator } from "~/middlewares/users.middlewares";


const routerLike = Router()

/**
 * Description: Like
 * Path: /likes
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {
            tweet_id: ObjectId
        }
 */

routerLike.post('/', AccessTokenValidator, LikeValidator, LikeController)

/**
 * Description: UnLike
 * Path: /likes/unlike
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {
            tweet_id: ObjectId
        }
 */
routerLike.post('/unlike', AccessTokenValidator, LikeValidator, UnLikeController)


export default routerLike;