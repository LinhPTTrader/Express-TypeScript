
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

import User from '~/models/schemas/User.schema';
import dotenv from 'dotenv'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema';
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
        return this.db.collection(process.env.USER_COLECTION as string)
    }

    get RefreshToken(): Collection<RefreshToken> {
        return this.db.collection(process.env.REFRESH_TOKEN as string)
    }
}

const databaseService = new DatabaseService();
export default databaseService;