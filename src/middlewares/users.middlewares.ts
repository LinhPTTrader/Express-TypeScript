

import { Request, Response, NextFunction } from "express"
import { body, check, checkSchema } from "express-validator"
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from "~/constants/httpStatus"
import { USERS_MESSAGES } from "~/constants/messages"
import { REGEX_USERNAME } from "~/constants/regex";
import { ErrorWithStatus } from "~/models/schemas/Errors"
import databaseService from "~/services/database.services";
import userService from "~/services/users.services"
import { VerifyToken } from "~/utils/jwt"
import { validate } from '~/utils/validation'



export const ValidatorUser = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body)
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
                const result = await userService.CheckEmail(value);
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
                if (!accessToken) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    req.id = (await VerifyToken(accessToken, process.env.JWT_SECRECT_ACCESS as string)).payload.userId
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
                console.log("refresh:", value)
                if (!value) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    req.id = (await VerifyToken(value, process.env.JWT_SECRECT_REFRESHTOKEN as string)).payload.userId
                    return true;
                }
            }
        }
    }
}, ['body']))


export const EmailVerifyTokenValidator = validate(checkSchema({
    emailVerifyToken: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
        },
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                if (!value) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                } else {
                    req.id = (await VerifyToken(value, process.env.JWT_EMAIL_SECRECT as string)).payload.userId
                    return true;
                }
            }
        }
    }
},))


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


export const EmailValidator = validate(checkSchema({
    email: {
        notEmpty: {
            errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_IS_INVALID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
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
            options: async (value, { req }) => {
                const result = await userService.CheckEmail(value);
                // console.log(result)
                if (!result) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY });
                }
                req.id = result._id;
                return true;
            }
        }
    },
}))

export const ForgotPasswordTokenValidator = validate(
    checkSchema({
        forgot_password_token: {
            notEmpty: {
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
            },
            trim: true,
            custom: {
                options: async (value: string, { req }) => {
                    if (!value) {
                        throw new ErrorWithStatus({ message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                    } else {
                        req.id = (await VerifyToken(value, process.env.JWT_FORGOT_PASSWORD_SECRECT as string)).payload.userId
                        return true;
                    }
                }
            }
        }
    }, ['body']),
)

export const ResetPasswordTokenValidator = validate(
    checkSchema({
        new_password: {
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
        confirm_new_password: {
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
                    if (value !== req.body.new_password) {
                        throw new ErrorWithStatus({ message: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                    }
                    return true
                })
            }
        },
    })
)

export const UserUpdateValidator = validate(
    checkSchema({
        name: {
            notEmpty: {
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_IS_REQUIRED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            },
            isString: {
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_MUST_BE_A_STRING, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            },
            isLength: {
                options: {
                    min: 1,
                    max: 100
                },
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            },
            trim: true
        },
        username: {
            notEmpty: {
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.USERNAME_INVALID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            },
            isString: {
                errorMessage: new ErrorWithStatus({ message: USERS_MESSAGES.NAME_MUST_BE_A_STRING, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
            },
            custom: {
                options: async (value, { req }) => {
                    if (!REGEX_USERNAME.test(value)) {
                        throw new ErrorWithStatus({ message: USERS_MESSAGES.USERNAME_INVALID, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    }
                    const user = databaseService.Users.findOne({ username: value })
                    if (!user) {
                        throw new ErrorWithStatus({ message: USERS_MESSAGES.USERNAME_EXISTED, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
                    }
                    return true
                }
            }
        },
    }, ['body'])
)

export const FollowerValidation = validate(checkSchema({
    follower_user_id: {
        custom: {
            options: async (value, { req }) => {
                if (!ObjectId.isValid(value)) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.INVALID_USER_ID, status: HTTP_STATUS.NOT_FOUND })
                }
                const follower_user = await databaseService.Users.findOne({ _id: new ObjectId(value) })
                console.log('flo: ', follower_user)
                if (follower_user === null) {
                    throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
                }
            }
        }
    }
}, ['body']))