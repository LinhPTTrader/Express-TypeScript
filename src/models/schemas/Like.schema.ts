import { ObjectId } from "mongodb";


interface LikeType {
    _id: ObjectId,
    user_id: ObjectId,
    twitter_id: ObjectId[],
    created_at: Date
}

export class Like {
    _id: ObjectId
    user_id: ObjectId
    twitter_id: ObjectId[]
    created_at: Date
    constructor(like: Like) {
        this._id = like._id
        this.user_id = like.user_id
        this.twitter_id = like.twitter_id || []
        this.created_at = like.created_at || Date()
    }
}