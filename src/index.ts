import express from 'express'
import usersRouter from './routes/users.routes'
const PORT = 3000
const app = express()


app.use(express.json())
app.get('/', (req, res) => res.send('Hello World'))


app.use('/users', usersRouter)
app.listen(PORT, () => console.log('Server Start'))
