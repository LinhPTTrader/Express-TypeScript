

import { Request, Response, NextFunction } from "express"
import { body, checkSchema } from "express-validator"
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from "~/constants/httpStatus"
import { USERS_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/schemas/Errors"
import userService from "~/services/users.services"
import { VerifyToken } from "~/utils/jwt"
import { validate } from '~/utils/validation'



export const ValidatorUser = (req: Request, res: Response, next: NextFunction) => {
    //console.log(req.body)
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            error: 'Missing email or password'
        })
    }
    next()
}

export const RegisterValidator = validate(checkSchema({
    name: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        trim: true // Loại bỏ các dấu như dấu cách thừa
    },
    email: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isEmail: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_IS_INVALID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isLength: {
            options: {
                min: 1,
                max: 256
            },
        },
        trim: true, // Loại bỏ các dấu như dấu cách thừa
        custom: {
            options: async (value) => {
                const result = await userService.checkEmail(value);
                // console.log(result)
                if (result) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY });
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minSymbols: 1,
                minNumbers: 1,
                returnScore: false
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        trim: true // Loại bỏ các dấu như dấu cách thừa
    },
    confirm_password: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
        },
        trim: true, // Loại bỏ các dấu như dấu cách thừa
        // Custom mật khẩu xem có trùng nhau không
        custom: {
            options: ((value, { req }) => {
                if (value !== req.body.password) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                }
                return true
            })
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            }
        }
    }
}))


export const AccessTokenValidator = validate(checkSchema({
    Authorization: {
        custom: {
            options: async (value, { req }) => {
                const accessToken = (value || '').split(' ')[1]
                console.log(accessToken)
                if (!accessToken) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    const id = (await VerifyToken(accessToken, process.env.JWT_SECRECT_ACCESS as string)).payload.userId
                    req.params = id
                    return true;
                }
            }
        }
    },

}, ['headers']))

export const RefreshTokenValidator = validate(checkSchema({
    refreshToken: {
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                if (!value) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    const id = (await VerifyToken(value, process.env.JWT_SECRECT_REFRESHTOKEN as string)).payload.userId
                    req.params = id
                    return true;
                }
            }
        }
    }
}, ['body']))


export const EmailVerifyTokenValidator = validate(checkSchema({
    emailVerifyToken: {
        notEmpty: {
            errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                if (!value) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    const id = (await VerifyToken(value, process.env.JWT_EMAIL_SECRECT as string)).payload.userId
                    req.params = id
                    return true;
                }
            }
        }
    }
}, ['body']))


export const ChangePasswordValidator = validate(checkSchema({
    password: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED, status: 422 })
        },
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                const id = new ObjectId(req.params?.toString())
                const result = await userService.CheckPassword(id, value)
                if (!result) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                }
                return true
            }
        }
    },
    newPassword: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minSymbols: 1,
                minNumbers: 1,
                returnScore: false
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG, status: HTTP_STATUS.UNAUTHORIZED })
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50, status: HTTP_STATUS.UNAUTHORIZED })
        },
        trim: true // Loại bỏ các dấu như dấu cách thừa
    },
    confirmNewPassword: {
        notEmpty: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50, status: HTTP_STATUS.UNAUTHORIZED })
        },
        trim: true, // Loại bỏ các dấu như dấu cách thừa
        // Custom mật khẩu xem có trùng nhau không
        custom: {
            options: ((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                }
                return true
            })
        }
    },
}))