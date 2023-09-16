import { Router } from 'express'
import { AccessTokenValidator, ChangePasswordValidator, EmailVerifyTokenValidator, RefreshTokenValidator, RegisterValidator, ValidatorUser } from '~/middlewares/users.middlewares'
import { ChangePasswordController, EmailVerifyController, FetchAcccountController, LoginController, LogoutController, RegisterController, RequireVerifyEmailController } from '~/controllers/users.controllers'
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

/**
 * Description: Require Verify Email
 * Path: //verify-email
 * Method: GET
 * Header: {Authorization: Bearer: <accessToken>}
 */
usersRouter.get('/verify-email', AccessTokenValidator, RequireVerifyEmailController)


/**
 * Description: Verify Email 
 * Path: /verify-email
 * Method: POST
* Header: {Authorization: Bearer: <accessToken>}
 * Body: {email_verify_token}
 */
usersRouter.post('/verify-email', AccessTokenValidator, EmailVerifyTokenValidator, EmailVerifyController)

/**
 * Description:  Change Password
 * Path: /change-password
 * Method: POST
 * Header: {Authorization: Bearer: <accessToken>}
 * Body: {password: string, new_pass_word: string, confirm_new_password}
 */
usersRouter.post('/change-password', AccessTokenValidator, ChangePasswordValidator, ChangePasswordController)


export default usersRouter