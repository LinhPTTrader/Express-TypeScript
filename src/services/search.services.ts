import { SearchQuery } from "~/models/request/Search.request";
import databaseService from "./database.services";


class SearchServices {
    async SearchAdvances(query: SearchQuery) {
        const { content, limit, page } = query
        return await databaseService.Tweet.aggregate([
            {
                '$match': {
                    '$text': {
                        '$search': content
                    }
                }
            },
            {
                '$skip': Number(limit) * (Number(page) - 1)
            }, {
                '$limit': Number(limit)
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
            }
        ]).toArray()
    }


    async SearchHashtag(query: SearchQuery) {
        const { content, limit, page } = query
        return await databaseService.Hashtag.aggregate([
            {
                '$match': {
                    '$text': {
                        '$search': content
                    }
                }
            }, {
                '$lookup': {
                    'from': 'tweet',
                    'localField': '_id',
                    'foreignField': 'hashtags',
                    'as': 'tweets'
                }
            }, {
                '$unwind': {
                    'path': '$tweets'
                }
            }, {
                '$replaceRoot': {
                    'newRoot': '$tweets'
                }
            },
            {
                '$skip': Number(limit) * (Number(page) - 1)
            }, {
                '$limit': Number(limit)
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
            }
        ]).toArray()
    }

}
const searchSerives = new SearchServices()
export default searchSerives