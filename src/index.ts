import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'
import { defaultErrorHandler } from './middlewares/errors.midlewares'


// Đọc các biến môi trường từ file .env
dotenv.config()

const app = express()

databaseService.run()
    .catch(console.log)

app.use(express.json())

app.get('/', (req, res) => res.send('Hello World'))

app.use('/users', usersRouter)

//Default Error Handler (Tất cả lỗi Error sẽ mặc định đưa về đây)
app.use(defaultErrorHandler)

app.listen(process.env.PORT, () => console.log('Server Start'))
