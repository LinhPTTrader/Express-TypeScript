import { Router } from 'express'
import { LoginValidator } from '~/middlewares/users.middlewares'
import { LoginController } from '~/controllers/users.controllers'
const usersRouter = Router()


usersRouter.post('/login', LoginValidator, LoginController)

export default usersRouter