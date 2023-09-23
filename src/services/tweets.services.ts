import { TweetRequestBody } from "~/models/request/Tweet";
import databaseService from "./database.services";
import { Tweet } from "~/models/schemas/Tweet.schema";
import { ObjectId } from "mongodb";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { Hashtag } from "~/models/schemas/Hashtag";
import { after } from "lodash";


class TweetService {
    async CreateTweet(tweet: TweetRequestBody, id: ObjectId) {
        const hashTag = await this.CheckAndCreateHastag(tweet.hashtags)

        const arrTemp = hashTag.map(value => {
            if (value !== null) {
                return value._id
            }
        })

        const newTweet = new Tweet({
            type: tweet.type,
            user_id: id,
            audience: tweet.audience,
            content: tweet.content,
            parent_id: tweet.parent_id,
            hashtags: arrTemp as ObjectId[],
            medias: tweet.medias,
            mentions: tweet.mentions,
        })
        return await databaseService.Tweet.insertOne(newTweet)
    }

    async CheckAndCreateHastag(hastag: string[]) {
        const hashtagDocument = Promise.all(hastag.map((value) => {
            return databaseService.Hashtag.findOneAndUpdate({
                name: value
            },
                {
                    $setOnInsert: new Hashtag({ name: value })
                },
                {
                    upsert: true,
                    returnDocument: 'after'
                }
            )
        }))
        return hashtagDocument;
    }

    async GetTweet(current_page: number, items_per_page: number) {
        const skip_count = (current_page - 1) * items_per_page;
        databaseService.Tweet.find().skip(skip_count).limit(items_per_page);
    }


    async IsCheckTweetId(_id: ObjectId) {
        return await databaseService.Tweet.findOne(_id)
    }

}


const tweetService = new TweetService();
export default tweetService;