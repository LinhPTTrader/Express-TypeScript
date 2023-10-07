import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import mediaRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import path from 'path'
import staticRouter from './routes/static.routes'
import routerTweet from './routes/tweets.routes'
import routerBookmark from './routes/bookmarks.routes'
import routerLike from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'



// Đọc các biến môi trường từ file .env
dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

databaseService.run()
    .catch(console.log)

initFolder() // Tạo folder nếu nó chưa có

app.use(express.json())

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
