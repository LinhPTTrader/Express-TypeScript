import jwt, { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/schemas/Errors';


export const SignToken = (payload: string | Buffer | object, options: jwt.SignOptions) => {

    return new Promise<string>((resolve, reject) => {

        jwt.sign(payload, process.env.JWT_SECRECT as string, options, (error, token) => {
            if (error) {
                throw reject(new ErrorWithStatus({ message: 'Server error', status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
            }
            resolve(token as string)
        })
    })

}


export const VerifyToken = (token: string) => {
    return new Promise<jwt.JwtPayload>((resolve, reject) => {
        // console.log(token)
        jwt.verify(token, process.env.JWT_SECRECT as string, (error, decoded) => {
            if (error) {
                throw reject(new ErrorWithStatus({ message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED }))
            }
            resolve(decoded as JwtPayload)
        })
    })
}