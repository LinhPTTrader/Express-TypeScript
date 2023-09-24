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
            user_id: new ObjectId(id),
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

    async GetTweet(id: ObjectId) {
        return databaseService.Tweet.aggregate([
            {
                '$match': {
                    '_id': new ObjectId(id)
                }
            }, {
                '$lookup': {
                    'from': 'hashtag',
                    'localField': 'hashtags',
                    'foreignField': '_id',
                    'as': 'hashtags'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'mentions',
                    'foreignField': '_id',
                    'as': 'mentions'
                }
            }, {
                '$addFields': {
                    'mentions': {
                        '$map': {
                            'input': '$mentions',
                            'as': 'mentions',
                            'in': {
                                '_id': '$$mentions._id',
                                'name': '$$mentions.name',
                                'username': '$$mentions.username'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'bookmark',
                    'localField': '_id',
                    'foreignField': 'tweet_id',
                    'as': 'bookmark'
                }
            }, {
                '$lookup': {
                    'from': 'like',
                    'localField': '_id',
                    'foreignField': 'tweet_id',
                    'as': 'like'
                }
            }, {
                '$addFields': {
                    'like_count': {
                        '$size': '$like'
                    },
                    'bookmark_count': {
                        '$size': '$bookmark'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'tweet',
                    'localField': '_id',
                    'foreignField': 'parent_id',
                    'as': 'tweet_children'
                }
            }, {
                '$addFields': {
                    'retweet': {
                        '$size': {
                            '$filter': {
                                'input': '$tweet_children',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 1
                                    ]
                                }
                            }
                        }
                    },
                    'comment': {
                        '$size': {
                            '$filter': {
                                'input': '$tweet_children',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 2
                                    ]
                                }
                            }
                        }
                    },
                    'quoteTweet': {
                        '$size': {
                            '$filter': {
                                'input': '$tweet_children',
                                'as': 'item',
                                'cond': {
                                    '$eq': [
                                        '$$item.type', 3
                                    ]
                                }
                            }
                        }
                    },
                    'views': {
                        '$add': [
                            '$user_views', '$guest_views'
                        ]
                    }
                }
            }, {
                '$project': {
                    'tweet_children': 0
                }
            }
        ]).toArray()
    }


    async IsCheckTweetId(_id: ObjectId) {
        return await databaseService.Tweet.findOne(_id)
    }

    async increaseView(tweet_id: string, user_id: string) {
        const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

        return await databaseService.Tweet.findOneAndUpdate(
            { _id: new ObjectId(tweet_id) },
            { $inc: inc, $currentDate: { updated_at: true } },
            { returnDocument: 'after', projection: { user_views: 1, guest_views: 1 } })

    }

}


const tweetService = new TweetService();
export default tweetService;