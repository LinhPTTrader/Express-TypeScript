import User from '~/models/schemas/User.schema';
import databaseService from "./database.services";
import { RegisterRequestBody } from '~/models/request/User.requests';
import { HashPassword } from '~/utils/crypto';
import { SignToken } from '~/utils/jwt';
import { TokenType } from '~/constants/enum';
import { ObjectId } from 'mongodb';
import { RefreshToken } from '~/models/schemas/RefreshToken.schema';
import bcrypt from "bcrypt";
import { USERS_MESSAGES } from '~/constants/messages';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/schemas/Errors';


class UserService {
    async register(payload: RegisterRequestBody) {
        const result = await databaseService.Users.insertOne(
            new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: HashPassword(payload.password) })
        )
        return { message: USERS_MESSAGES.REGISTER_SUCCESS, result };

    }
    async checkEmail(email: string) {
        return await databaseService.Users.findOne({ email })
    }

    async SignAccessToken(userId: string) {
        return SignToken(
            {
                payload: {
                    userId,
                    token_type: TokenType.AccessToken
                }
            },
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPRIRES_IN
            },
            process.env.JWT_SECRECT_ACCESS as string

        )
    }
    async SignRefreshToken(userId: string) {
        // console.log(process.env.REFRESH_TOKEN_EXPRIRES_IN)
        return SignToken(
            {
                payload: {
                    userId,
                    token_type: TokenType.RefreshToken
                }
            },
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPRIRES_IN
            },
            process.env.JWT_SECRECT_REFRESHTOKEN as string

        )
    }
    async SaveRefreshToken(email: string, password: string) {
        const result = await this.checkEmail(email);
        if (result && bcrypt.compareSync(password, result.password)) {
            const accessToken = await userService.SignAccessToken(result._id.toString());
            const refreshToken = await userService.SignRefreshToken(result._id.toString());
            const user = await databaseService.RefreshToken.findOne({ user_id: result._id });
            if (user) {
                // console.log(user._id)
                await databaseService.RefreshToken.updateOne({ _id: user._id }, { $set: { refreshToken } })
            } else {
                await databaseService.RefreshToken.insertOne(
                    new RefreshToken({ refreshToken, user_id: result._id })
                )
            }
            const content = {
                id: result._id,
                name: result.name,
                email: result.email,
                date_of_birth: result.date_of_birth
            }
            return { message: USERS_MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken, content }
        } else {
            throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT, status: 422 })
        }
    }
    async getUser(_id: ObjectId) {
        return await databaseService.Users.findOne({ _id });
    }
    async RemoveRefreshToken(refreshToken: string) {
        return await databaseService.RefreshToken.deleteOne({ refreshToken });
    }

    async VerifyEmail(_id: ObjectId) {
        return await databaseService.Users.updateOne(_id, { $set: { email_verify_token: '', updated_at: new Date() } })
    }
}

const userService = new UserService();
export default userService;