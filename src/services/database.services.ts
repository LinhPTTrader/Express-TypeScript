
import { MongoClient, Db, Collection } from 'mongodb';

import User from '~/models/schemas/User.schema';
import dotenv from 'dotenv'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema';
import { Follower } from '~/models/schemas/Follower.schema';
import { Tweet } from '~/models/schemas/Tweet.schema';
import { Hashtag } from '~/models/schemas/Hashtag';
import { Bookmark } from '~/models/schemas/Bookmark.schema';
import { Like } from '~/models/schemas/Like.schema';
// Đọc các biến môi trường từ file .env
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.evhfunv.mongodb.net/?retryWrites=true&w=majority`;

class DatabaseService {
    private client: MongoClient
    private db: Db
    constructor() {
        this.client = new MongoClient(uri)
        this.db = this.client.db(process.env.DB_NAME)
    }
    async run() {
        try {
            await this.db.command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } finally {
            // Ensures that the client will close when you finish/error
            //await this.client.close();
        }
    }

    get Users(): Collection<User> {
        return this.db.collection(process.env.USER_COLLECTION as string)
    }

    get RefreshToken(): Collection<RefreshToken> {
        return this.db.collection(process.env.REFRESH_TOKEN as string)
    }
    get Follower(): Collection<Follower> {
        return this.db.collection(process.env.FOLLOWER_COLLECTION as string)
    }
    get Tweet(): Collection<Tweet> {
        return this.db.collection(process.env.TWEET_COLLECTION as string)
    }
    get Hashtag(): Collection<Hashtag> {
        return this.db.collection(process.env.HASHTAG_COLLECTION as string)
    }
    get Bookmark(): Collection<Bookmark> {
        return this.db.collection(process.env.BOOKMARK_COLLECTION as string)
    }
    get Like(): Collection<Like> {
        return this.db.collection(process.env.LIKE_COLLECTION as string)
    }
}

const databaseService = new DatabaseService();
export default databaseService;