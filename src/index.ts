import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import mediaRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
import routerTweet from './routes/tweets.routes'
import routerBookmark from './routes/bookmarks.routes'
import routerLike from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs"
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import helmet from "helmet";
import YAML from 'yaml'
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // store: ... , // Use an external store for more precise rate limiting
})

const file = fs.readFileSync(path.resolve('src/twitterclone-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)
// const options: swaggerJsdoc.Options = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'Twitter-Clone-API',
//             version: '1.0.0',
//         },
//     },
//     apis: ['./src/routes/*.routes.ts'], // files containing annotations as above
// };

// const openapiSpecification = swaggerJsdoc(options);

// Đọc các biến môi trường từ file .env
dotenv.config()


const app = express();



const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173'
    }
});
let user: {
    [key: string]: { socket_id: string }
} = {}
io.on("connection", (socket) => {
    const user_id = socket.handshake.auth.id
    user[user_id] = {
        socket_id: socket.id
    }
    socket.on('chat', (arg) => {
        const receiver_socket_id = user[arg.user_id].socket_id
        socket.to(receiver_socket_id).emit('chat', {
            content: arg.content,
            user_id: user_id
        })
    })
    console.log(user)
    socket.on('disconnect', () => {
        console.log('user disconect:', socket.id)
    })

});


app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(limiter)
app.use(helmet());

databaseService.run()
    .catch(console.log)

initFolder() // Tạo folder nếu nó chưa có

app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.send('Hello World'))

app.use('/medias', mediaRouter)
app.use('/users', usersRouter)
app.use('/tweets', routerTweet)
app.use('/bookmarks', routerBookmark)
app.use('/likes', routerLike)
app.use('/search', searchRouter)

// Static file
app.use('/static', staticRouter)

//Default Error Handler (Tất cả lỗi Error sẽ mặc định đưa về đây)
app.use(defaultErrorHandler)

app.listen(process.env.PORT, () => console.log('Server Start'))


httpServer.listen(4000, () => {
    console.log(`Socket.io đang chạy trên cổng 4000`);
})