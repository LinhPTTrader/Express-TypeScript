import { Router } from 'express'
import { AccessTokenValidator, RefreshTokenValidator, RegisterValidator, ValidatorUser } from '~/middlewares/users.middlewares'
import { FetchAcccountController, LoginController, LogoutController, RegisterController } from '~/controllers/users.controllers'
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

/**
 * Description: Logout
 * Path: /logout
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {refreshToken: string}
 */
usersRouter.post('/logout', AccessTokenValidator, RefreshTokenValidator, LogoutController)


/**
 * Description: Duy trì đăng nhập
 * Path: /fetchuser
 * Method: GET
 * Header: {Authorization: Bearer: <accessToken>}
 */
usersRouter.get('/fetch', AccessTokenValidator, FetchAcccountController)


export default usersRouter