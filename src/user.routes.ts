import { Router } from 'express'

const userRouter = Router()

userRouter.use((req, res, next) => {
    console.log('Ok midle da chay')
    next()
})
userRouter.get('/user', (req, res) => res.send({ name: 'LinhPhan', age: 28 }))

export default userRouter