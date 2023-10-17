import { ObjectId } from "mongodb";
import databaseService from "./database.services";
import { Bookmark } from "~/models/schemas/Bookmark.schema";

class BookmarkService {
    async BookmarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
        user_id = new ObjectId(user_id)
        tweet_id = new ObjectId(tweet_id)
        const newBookmark = new Bookmark({ user_id, tweet_id })
        return await databaseService.Bookmark.findOneAndUpdate(
            { user_id, tweet_id },
            { $setOnInsert: newBookmark },
            { upsert: true, returnDocument: 'after' })
    }

    async UnBookmarkTweet(user_id: ObjectId, tweet_id: ObjectId) {
        user_id = new ObjectId(user_id)
        tweet_id = new ObjectId(tweet_id)
        return await databaseService.Bookmark.findOneAndDelete({ user_id, tweet_id })
    }
}

const bookmarkService = new BookmarkService()

export default bookmarkService;