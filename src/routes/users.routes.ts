import { Router } from 'express'
import { RegisterValidator, ValidatorUser } from '~/middlewares/users.middlewares'
import { LoginController, RegisterController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

/**
 * Description: Login
 * Path: /login
 * Method: POST
 * Body: {name: string, email: string}
 */
usersRouter.post('/login', ValidatorUser, LoginController)




/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password, date_of_birth: ISOString}
 */
usersRouter.post('/register', RegisterValidator, wrapRequestHandler(RegisterController))

export default usersRouter