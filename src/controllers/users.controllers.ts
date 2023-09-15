
import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services";
import { ParamsDictionary } from "express-serve-static-core"
import { LogoutReqBody, RegisterRequestBody } from "~/models/request/User.requests";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ObjectId } from "mongodb";
import { result } from "lodash";
import { USERS_MESSAGES } from "~/constants/messages";
import { error } from "console";


export const LoginController = async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = req.body;
    userService.SaveRefreshToken(email, password)
        .then((result) => {
            // console.log(result)
            res.cookie('refreshToken', result.refreshToken, { httpOnly: false })
            return res.status(HTTP_STATUS.OK).json(result);
        })
        .catch(err => {
            next(err)
        })
}

export const RegisterController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    userService.register(req.body)
        .then(result => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(err => next(err))
}


export const LogoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    userService.RemoveRefreshToken(refreshToken)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(err => next(err))

}

export const FetchAcccountController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    const _id = new ObjectId(req.params.toString())
    userService.getUser(_id)
        .then(result => {
            const user = { id: result?._id, name: result?.name, email: result?.email, date_of_birth: result?.date_of_birth }
            res.status(HTTP_STATUS.OK).json(user)
        })
        .catch(err => next(err))
}

export const EmailVerifyController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    const _id = new ObjectId(req.params.toString())
    userService.getUser(_id)
        .then(result => {
            if (!result) {
                res.status(HTTP_STATUS.NOT_FOUND).json(USERS_MESSAGES.USER_NOT_FOUND)
            } else if (result.email_verify_token === '') {
                res.status(HTTP_STATUS.OK).json(USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE)
            } else {
                userService.VerifyEmail(_id)
                    .then((result2) => console.log(result2))
                    .catch(err2 => next(err2))
            }
        })
        .catch(err => next(err))
}

export const RequireVerifyEmailController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    const _id = new ObjectId(req.params.toString())
    userService.getUser(_id)
        .then(result => {
            if (result?.verify === 0) {
                // Đoạn này đáng ra là phải gửi Email cho User và họ xác nhận thông qua email_verify_token
                res.status(HTTP_STATUS.OK).json("Email chua Verify")
            } else if (result?.verify === 1) {
                res.status(HTTP_STATUS.NO_CONTENT).json(USERS_MESSAGES.EMAIL_VERIFY_SUCCESS)
            } else {
                res.status(HTTP_STATUS.NOT_FOUND).json(USERS_MESSAGES.EMAIL_IS_REQUIRED)
            }
        })
        .catch(error => next(error))
}