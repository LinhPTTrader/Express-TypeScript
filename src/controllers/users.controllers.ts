import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services";
import { ParamsDictionary } from "express-serve-static-core"
import { ForgotPasswordReqBody, LogoutReqBody, RegisterRequestBody, UpdateUserRequestBody } from "~/models/request/User.requests";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { ObjectId } from "mongodb";
import { USERS_MESSAGES } from "~/constants/messages";
import { ErrorWithStatus } from '~/models/schemas/Errors';



export const LoginController = async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = req.body;
    userService.SaveRefreshToken(email, password)
        .then((result) => {
            // console.log(result)
            res.cookie('refreshToken', result.refreshToken, { httpOnly: false })
            return res.status(HTTP_STATUS.OK).json(result);
        })
        .catch(err => next(err))
}

export const RegisterController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    userService.Register(req.body)
        .then(result => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}


export const LogoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    // console.log('Logout')
    userService.RemoveRefreshToken(refreshToken)
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))

}

export const FetchAcccountController = async (req: any, res: Response, next: NextFunction) => {
    const user_id = new ObjectId(req.id)
    const { refreshToken } = req.body;
    userService.CheckRefreshTokenAndUserId(user_id, refreshToken)
        .then(result => {
            if (result) {
                userService.GetUser(user_id)
                    .then(result => {
                        res.status(HTTP_STATUS.OK).json(result)
                    })
                    .catch(err => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
            } else {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED })
            }
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const EmailVerifyController = async (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    userService.UpdateVerifyEmail(id)
        .then(result => {
            if (result) {
                res.status(HTTP_STATUS.OK).json({ message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS })
            }
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))

}

export const RequireVerifyEmailController = async (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const emailVerifyToken = await userService.SignEmailVerifyToken(id.toString())
    userService.GetUser(id)
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
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const ChangePasswordController = async (req: any, res: Response, next: NextFunction) => {
    const _id = req.id
    const newPassword = req.body.newPassword;
    userService.UpdatePassword(_id, newPassword)
        .then((result) => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const ForgotPasswordController = async (req: any, res: Response, next: NextFunction) => {
    const email = req.body.email;
    const id = req.id
    userService.ForgotPassword(email, id)
        .then(result => {
            res.json(result)
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))

}
export const VerifyForgotPasswordController = async (req: any, res: Response, next: NextFunction) => {
    const { forgot_password_token } = req.body
    const id = req.id
    userService.VerifyForgotPassword(id, forgot_password_token)
        // Điều hướng đến reset password
        .then(result => res.status(HTTP_STATUS.OK).json(result))
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const ResetPasswordController = async (req: any, res: Response, next: NextFunction) => {
    const { new_password } = req.body;
    const id = req.id
    userService.UpdatePassword(id, new_password)
        .then(result => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const UpdateProfileController = async (req: any, res: Response, next: NextFunction) => {
    const user = req.body;
    const id = req.id
    userService.UpdateUser(id, user)
        .then(result => {
            res.status(result.status).json({ message: result.message })
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const GetProfileController = async (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    userService.GetUser(id)
        .then(result => {
            res.status(HTTP_STATUS.OK).json(result)
        })
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}

export const FollowerController = async (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { follower_user_id } = req.body
    userService.Follower(id, follower_user_id)
        .then(result => res.status(result.status).json({ message: result.message }))
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}
export const UnFollowerController = async (req: any, res: Response, next: NextFunction) => {
    const id = req.id
    const { follower_user_id } = req.body
    userService.UnFollower(id, follower_user_id)
        .then(result => res.status(result.status).json({ message: result.message }))
        .catch(() => next(new ErrorWithStatus({ message: 'ERROR', status: HTTP_STATUS.INTERNAL_SERVER_ERROR })))
}