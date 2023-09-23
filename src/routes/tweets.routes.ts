import { Router } from "express";
import { TweetController } from "~/controllers/tweets.controllers";
import { CreateTweetValidator } from "~/middlewares/tweets.middlewate";
import { AccessTokenValidator } from "~/middlewares/users.middlewares";


const routerTweet = Router();


/**
 * Description:  Create Tweet
 * Path: /
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {
            type: TweetType
            audience: TweetAudience
            content: string
            parent_id: null | ObjectId
            hashtags: ObjectId[]
            mentions: ObjectId[] // Đề cập đến ai đó   
            medias: Media[]
            guest_views: number
            user_views: number
        }
 */

routerTweet.post('/', AccessTokenValidator, CreateTweetValidator, TweetController)


/**
 * Description:  GET Tweet
 * Path: /get-tweet/:curent_page&
 * Method: GET
*/
routerTweet.get('/get-tweet', TweetController)

export default routerTweet;