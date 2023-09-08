import { Router } from 'express'
import { ValidatorUser } from '~/middlewares/users.middlewares'
import { LoginController, RegisterController } from '~/controllers/users.controllers'
const usersRouter = Router()


usersRouter.post('/login', ValidatorUser, LoginController)
usersRouter.post('/register', ValidatorUser, RegisterController)

export default usersRouter