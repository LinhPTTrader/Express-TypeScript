import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/constants/enum"


interface Media {
    url: string,
    type: MediaType
}

export interface TweetRequestBody {
    // _id: ObjectId 
    // user_id: ObjectId (Không cần user_id vì có thể lấy qua Access Token)
    type: TweetType
    audience: TweetAudience
    content: string
    parent_id: string// Null khi twitter gốc
    hashtags: string[]
    mentions: ObjectId[] // Mảng user_id
    medias: Media[]
}