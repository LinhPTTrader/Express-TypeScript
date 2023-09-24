import { Router } from "express";
import { GetTweetcontroller, TweetController } from "~/controllers/tweets.controllers";
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
 * Description:  GET Tweet (Khi người dùng nhấn vào 1 Tweet)
 * Path: /:tweet_id
 * Method: GET'
 *  Header: { Authorization?: Bearer <access_token> }
*/
routerTweet.get('/:tweet_id', GetTweetcontroller)

export default routerTweet;