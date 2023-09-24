import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/constants/enum"

interface Media {
    url: string,
    type: MediaType
}

interface TweetConstructor {
    _id?: ObjectId
    user_id: ObjectId
    type: TweetType
    audience: TweetAudience
    twitter_article?: ObjectId[]

    content: string
    parent_id: string | null
    //  Chỉ null khi tweet gốc
    hashtags: ObjectId[]
    mentions: ObjectId[] // Đề cập đến ai đó   
    medias: Media[]
    guest_views?: number
    user_views?: number
    created_at?: Date
    updated_at?: Date
}

export class Tweet {
    _id?: ObjectId
    user_id?: ObjectId
    type: TweetType
    audience: TweetAudience
    twitter_article?: ObjectId[]
    content: string
    parent_id: ObjectId | null
    //  Chỉ null khi tweet gốc
    hashtags: ObjectId[]
    mentions: ObjectId[] // Đề cập đến ai đó   
    medias: Media[]
    guest_views: number
    user_views: number
    created_at: Date
    updated_at: Date
    constructor(tweet: TweetConstructor) {
        this._id = tweet._id
        this.user_id = tweet.user_id
        this.type = tweet.type
        this.audience = tweet.audience
        this.twitter_article = tweet.twitter_article || []
        this.content = tweet.content
        this.parent_id = tweet.parent_id ? new ObjectId(tweet.parent_id) : null
        this.hashtags = tweet.hashtags
        this.medias = tweet.medias
        this.mentions = tweet.mentions.map(item => new ObjectId(item))
        this.guest_views = tweet.guest_views || 0
        this.user_views = tweet.user_views || 0
        this.created_at = tweet.created_at || new Date()
        this.updated_at = tweet.updated_at || new Date()
    }
}