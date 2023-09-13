import { error } from "console"
import { Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
import { USERS_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/schemas/Errors"
import userService from "~/services/users.services"
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
            errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true // Loại bỏ các dấu như dấu cách thừa
    },
    email: {
        notEmpty: {
            errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
            errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
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
                    throw new ErrorWithStatus({ message: 'Email đã tồn tại', status: 422 });
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minSymbols: 1,
                minNumbers: 1,
                returnScore: false
            },
            errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        },
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        trim: true // Loại bỏ các dấu như dấu cách thừa
    },
    confirm_password: {
        notEmpty: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        trim: true, // Loại bỏ các dấu như dấu cách thừa
        // Custom mật khẩu xem có trùng nhau không
        custom: {
            options: ((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Mật khẩu không trùng nhau')
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
