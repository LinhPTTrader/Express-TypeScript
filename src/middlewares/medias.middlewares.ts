import { checkSchema } from 'express-validator';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { ErrorWithStatus } from '~/models/schemas/Errors';
import { VerifyToken } from '~/utils/jwt';
import { validate } from "~/utils/validation";

export const AccessTokenMediaValidator = validate(
    checkSchema({
        Authorization: {
            custom: {
                options: async (value, { req }) => {
                    const accessToken = (value || '').split(' ')[1]
                    if (!accessToken) {
                        throw new ErrorWithStatus({ message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
                    } else {
                        req.id = (await VerifyToken(accessToken, process.env.JWT_SECRECT_ACCESS as string)).payload.userId
                        return true
                    }
                }
            }
        },

    }, ['headers'])
)