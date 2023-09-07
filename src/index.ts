import express from 'express'
import userRouter from './user.routes'
const PORT = 3000
const app = express()

app.get('/', (req, res) => res.send('Hello World'))


app.use('/api', userRouter)
app.listen(PORT, () => console.log('Server Start'))
