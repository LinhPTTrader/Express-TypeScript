
import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services";
import { ParamsDictionary } from "express-serve-static-core"
import { ForgotPasswordReqBody, LogoutReqBody, RegisterRequestBody } from "~/models/request/User.requests";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ObjectId } from "mongodb";
import { result } from "lodash";
import { USERS_MESSAGES } from "~/constants/messages";
import { error } from "console";
import User from "~/models/schemas/User.schema";


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
    // console.log('Logout')
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
    userService.updateVerifyEmail(_id)
        .then(result => {
            if (result) {
                res.status(HTTP_STATUS.OK).json({ message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS })
            }
        })
        .catch(err => next(err))

}

export const RequireVerifyEmailController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    const _id = new ObjectId(req.params.toString())
    const emailVerifyToken = await userService.SignEmailVerifyToken(_id.toString())
    userService.getUser(_id)
        .then(result => {
            if (result?.verify === 0) {
                // Đoạn này đáng ra là phải gửi Email cho User và họ xác nhận thông qua email_verify_token
                res.status(HTTP_STATUS.OK).json({ emailVerifyToken })
            } else if (result?.verify === 1) {
                res.status(HTTP_STATUS.OK).json({ message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS })
            } else {
                res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.EMAIL_IS_REQUIRED })
            }
        })
        .catch(error => next(error))
}

export const ChangePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const id = new ObjectId(req.params.toString());
    const newPassword = req.body.newPassword;
    userService.UpdatePassword(id, newPassword)
        .then((result) => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(err => next(err))
}

export const ForgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const id = new ObjectId(req.params.toString())
    userService.ForgotPassword(email, id)
        .then(result => {
            res.json(result)
        })
        .catch(err => next(err))

}
export const VerifyForgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const { forgot_password_token } = req.body
    const id = new ObjectId(req.params.toString())
    userService.VerifyForgotPassword(id, forgot_password_token)
        // Điều hướng đến reset password
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(err => next(err))
}

export const ResetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const { new_password } = req.body;
    const id = new ObjectId(req.params.toString());
    userService.UpdatePassword(id, new_password)
        .then(result => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(err => next(err))
}