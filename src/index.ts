import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import dotenv from 'dotenv'

// Đọc các biến môi trường từ file .env
dotenv.config()

const app = express()

app.use(express.json())
app.get('/', (req, res) => res.send('Hello World'))


databaseService.run()
    .catch(console.log)

app.use('/users', usersRouter)

app.listen(process.env.PORT, () => console.log('Server Start'))
