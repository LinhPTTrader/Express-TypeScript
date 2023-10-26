import { TweetRequestBody } from "~/models/request/Tweet";
import databaseService from "./database.services";
import { Tweet } from "~/models/schemas/Tweet.schema";
import { ObjectId } from "mongodb";
import { ErrorWithStatus } from "~/models/schemas/Errors";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { Hashtag } from "~/models/schemas/Hashtag";
import { TweetType } from "~/constants/enum";


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
    async increaseViewNewFeed(tweet_id: ObjectId[], user_id: string) {
        const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
        await databaseService.Tweet.updateMany(
            {
                _id: {
                    $in: tweet_id
                }
            },
            { $inc: inc, $currentDate: { updated_at: true } }
        )
        // console.log(tweet_id)
        return await databaseService.Tweet.aggregate(
            [
                {
                    '$match': {
                        'user_id': {
                            '$in': [
                                tweet_id
                            ]
                        },
                        'type': 0
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'user_id',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$match': {
                        '$or': [
                            {
                                'audience': 0
                            }, {
                                '$and': [
                                    {
                                        'audience': 1
                                    }, {
                                        'user.twitter_article': {
                                            '$in': [
                                                new ObjectId(user_id)
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
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
                                'as': 'element',
                                'in': {
                                    '_id': '$$element._id',
                                    'name': '$$element.name',
                                    'username': '$$element.username'
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
                        'as': 'children_tweet'
                    }
                }, {
                    '$addFields': {
                        'retweet': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 1
                                        ]
                                    }
                                }
                            }
                        },
                        'comment': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 2
                                        ]
                                    }
                                }
                            }
                        },
                        'quote': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 3
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        'children_tweet': 0,
                        'user': {
                            'password': 0,
                            'forgot_password_token': 0,
                            'email_verify_token': 0,
                            'date_of_birth': 0
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                }
            ]
        ).toArray()
    }
    async GetTweetChildren(limit: number, page: number, tweet_type: TweetType, tweet_id: string) {
        console.log(limit, page, tweet_type, tweet_id)
        return await databaseService.Tweet.aggregate(
            [
                {
                    '$match': {
                        'parent_id': new ObjectId(tweet_id),
                    }
                },
                {
                    '$skip': limit * (page - 1)
                }, {
                    '$limit': limit
                },
                {
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
                },
                {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'user_id',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                },
                {
                    '$project': {
                        '_id': 1,
                        'content': 1,
                        'created_at': 1,
                        'updated_at': 1,
                        'user': {
                            'name': 1,
                            'avatar': 1
                        }
                    }
                }
            ]
        ).toArray()
    }

    async GetNewFeed(id: string, limit: number, page: number) {
        const temp = await databaseService.Follower.find(
            {
                user_id: new ObjectId(id)
            },
            {
                projection: {
                    follower_user_id: 1,
                    _id: 0
                }
            }).toArray()
        let arrFollower = temp.map(item => item.follower_user_id)
        arrFollower = [...arrFollower, new ObjectId(id)]
        return await databaseService.Tweet.aggregate(
            [
                {
                    '$match': {
                        'user_id': {
                            '$in': arrFollower
                        },
                        'type': 0
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'user_id',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$match': {
                        '$or': [
                            {
                                'audience': 0
                            }, {
                                '$and': [
                                    {
                                        'audience': 1
                                    }, {
                                        'user.twitter_article': {
                                            '$in': [
                                                new ObjectId(id)
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    '$sort': {
                        'created_at': -1
                    }
                },
                {
                    '$skip': (limit * (page - 1))
                }, {
                    '$limit': limit
                },
                {
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
                                'as': 'element',
                                'in': {
                                    '_id': '$$element._id',
                                    'name': '$$element.name',
                                    'username': '$$element.username'
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
                        'as': 'children_tweet'
                    }
                }, {
                    '$addFields': {
                        'retweet': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 1
                                        ]
                                    }
                                }
                            }
                        },
                        'comment': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 2
                                        ]
                                    }
                                }
                            }
                        },
                        'quote': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 3
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        'children_tweet': 0,
                        'user': {
                            'password': 0,
                            'forgot_password_token': 0,
                            'email_verify_token': 0,
                            'date_of_birth': 0
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                },

            ]
        ).toArray()
    }
    async GetUserTweet(id: string, limit: number, page: number) {
        return await databaseService.Tweet.aggregate(
            [
                {
                    '$match': {
                        'user_id': new ObjectId(id),
                        'type': 0
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'user_id',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$match': {
                        '$or': [
                            {
                                'audience': 0
                            }, {
                                '$and': [
                                    {
                                        'audience': 1
                                    }, {
                                        'user.twitter_article': {
                                            '$in': [
                                                new ObjectId(id)
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    '$sort': {
                        'created_at': -1
                    }
                },
                {
                    '$skip': (limit * (page - 1))
                }, {
                    '$limit': limit
                },
                {
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
                                'as': 'element',
                                'in': {
                                    '_id': '$$element._id',
                                    'name': '$$element.name',
                                    'username': '$$element.username'
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
                        'as': 'children_tweet'
                    }
                }, {
                    '$addFields': {
                        'retweet': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 1
                                        ]
                                    }
                                }
                            }
                        },
                        'comment': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 2
                                        ]
                                    }
                                }
                            }
                        },
                        'quote': {
                            '$size': {
                                '$filter': {
                                    'input': '$children_tweet',
                                    'as': 'element',
                                    'cond': {
                                        '$eq': [
                                            'element.type', 3
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        'children_tweet': 0,
                        'user': {
                            'password': 0,
                            'forgot_password_token': 0,
                            'email_verify_token': 0,
                            'date_of_birth': 0
                        }
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                },

            ]
        ).toArray()
    }
}

const tweetService = new TweetService();
export default tweetService;