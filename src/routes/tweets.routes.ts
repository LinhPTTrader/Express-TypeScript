import { Router } from "express";
import { GetNewFeedController, GetTweetChildrencontroller, GetTweetcontroller, TweetController } from "~/controllers/tweets.controllers";
import { CreateTweetValidator, PanagationValidator } from "~/middlewares/tweets.middlewate";
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
 * Method: GET
 *  Header: { Authorization?: Bearer <access_token> }
 * Params: tweed_id 
*/
routerTweet.get('/gettweet/:tweet_id', GetTweetcontroller)

/**
 * Description:  GET Tweet Children (comment, retweet, quoteTweet)
 * Path: /get_tweet_children
 * Method: GET
 * query: {limit: number, page:number, tweet_type: TweetType (0,1,2,3)}
*/
routerTweet.get('/gettweet-children/:tweet_id/children', GetTweetChildrencontroller)


/**
 * Description:  GET New Feed (Tweed được hiện thị gồm của mình và người mình theo dõi)
 * Path: /newfeed
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * query: {limit: number, page: number}
*/
routerTweet.get('/newfeed', PanagationValidator, AccessTokenValidator, GetNewFeedController)

/**
 * Description:  Views Tweet
 * Path: /viewstweed
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * query: {limit: number, page: number}
*/
routerTweet.get('/viewstweed',)

export default routerTweet;