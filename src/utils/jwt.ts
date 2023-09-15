import jwt, { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/schemas/Errors';


export const SignToken = (payload: string | Buffer | object, options: jwt.SignOptions, secret: string) => {

    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, secret, options, (error, token) => {
            if (error) {
                throw reject(new ErrorWithStatus({ message: 'Server error', status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
            }
            resolve(token as string)
        })
    })

}


export const VerifyToken = (token: string, secrect: string) => {
    return new Promise<jwt.JwtPayload>((resolve, reject) => {
        // console.log(token)
        jwt.verify(token, secrect, (error, decoded) => {
            if (error) {
                throw reject(new ErrorWithStatus({ message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED }))
            }
            resolve(decoded as JwtPayload)
        })
    })
}