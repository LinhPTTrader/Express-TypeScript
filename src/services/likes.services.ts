import { ObjectId } from "mongodb";
import databaseService from "./database.services";
import { Like } from "~/models/schemas/Like.schema";

class LikeService {
    async LikeTweet(user_id: ObjectId, tweet_id: ObjectId) {
        const newLike = new Like({ user_id, tweet_id })
        return await databaseService.Like.findOneAndUpdate({ user_id, tweet_id }, { $setOnInsert: newLike }, { upsert: true, returnDocument: 'after' })

    }
    async UnLikeTweet(user_id: ObjectId, tweet_id: ObjectId) {
        return await databaseService.Like.findOneAndDelete({ user_id, tweet_id })
    }
}

const likeService = new LikeService()

export default likeService;