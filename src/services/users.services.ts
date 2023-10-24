import { ObjectId } from 'mongodb';
import { Follower } from './../models/schemas/Follower.schema';
import { pick, result } from 'lodash';
import User, { UserUpdate, UserVerifyStatus } from '~/models/schemas/User.schema';
import databaseService from "./database.services";
import { RegisterRequestBody, UpdateUserRequestBody } from '~/models/request/User.requests';
import { HashPassword } from '~/utils/crypto';
import { SignToken } from '~/utils/jwt';
import { TokenType } from '~/constants/enum';
import { RefreshToken } from '~/models/schemas/RefreshToken.schema';
import bcrypt from "bcrypt";
import { USERS_MESSAGES } from '~/constants/messages';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/schemas/Errors';
import { sendVerifyEmail } from '~/utils/email';
import { VerifyEmailTemplate } from '~/templates/verifyemail';
import { ForgotPasswordTemplate } from '~/templates/forgotPassword';
import { ur } from '@faker-js/faker';


class UserService {
    async Register(payload: RegisterRequestBody) {
        const result = await databaseService.Users.insertOne(
            new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: HashPassword(payload.password) })
        )
        const email_verify_token = await this.SignEmailVerifyToken(result.insertedId.toString())
        databaseService.Users.updateOne({ _id: result.insertedId }, { $set: { email_verify_token } })
        const url = `${process.env.HOSTUI}/verify-email?email_token=${email_verify_token}`
        console.log(ur)
        sendVerifyEmail(payload.email, "Verify Email", VerifyEmailTemplate(url, payload.name))
            .then(result => console.log(result))
            .catch(err => console.log(err))
        return { message: USERS_MESSAGES.REGISTER_SUCCESS, result };

    }
    async CheckEmail(email: string) {
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
    async SignEmailVerifyToken(userId: string) {
        // console.log(process.env.REFRESH_TOKEN_EXPRIRES_IN)
        return SignToken(
            {
                payload: {
                    userId,
                    token_type: TokenType.EmailVerifyToken
                }
            },
            {
                expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPRIRES_IN
            },
            process.env.JWT_EMAIL_SECRECT as string

        )
    }
    async SignForgotPasswordToken(userId: string) {
        // console.log(process.env.REFRESH_TOKEN_EXPRIRES_IN)
        return SignToken(
            {
                payload: {
                    userId,
                    token_type: TokenType.ForgotPasswordToken
                }
            },
            {
                expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPRIRES_IN
            },
            process.env.JWT_FORGOT_PASSWORD_SECRECT as string

        )
    }
    async SaveRefreshToken(email: string, password: string) {
        const result = await this.CheckEmail(email);
        // console.log(result)
        if (result && bcrypt.compareSync(password, result.password)) {
            const accessToken = await this.SignAccessToken(result._id.toString());
            const refreshToken = await this.SignRefreshToken(result._id.toString());
            const user = await databaseService.RefreshToken.findOne({ user_id: result._id });

            if (user) {
                // console.log(user._id)
                await databaseService.RefreshToken.updateOne({ _id: user._id }, { $set: { refreshToken } })
            } else {
                await databaseService.RefreshToken.insertOne(
                    new RefreshToken({ refreshToken, user_id: result._id })
                )
            }
            const { password, forgot_password_token, email_verify_token, created_at, updated_at, ...content } = result as User
            return { message: USERS_MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken, result: content }
        } else {
            throw new ErrorWithStatus({ message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT, status: 422 })
        }
    }
    async GetUser(_id: ObjectId) {
        const result = await databaseService.Users.findOne({ _id });
        const data = pick(result, ['_id', 'name', 'date_of_birth', 'bio', 'location', 'website', 'avatar', 'cover_photo', 'username', 'verify'])
        return data
    }
    async RemoveRefreshToken(refreshToken: string) {
        return await databaseService.RefreshToken.deleteOne({ refreshToken });
    }

    async VerifyEmail(_id: ObjectId) {
        return await databaseService.Users.updateOne({ _id }, { $set: { email_verify_token: '', updated_at: new Date() } })
    }
    async UpdateVerifyEmail(_id: ObjectId) {
        return await databaseService.Users.updateOne({ _id }, { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } })
    }
    async CheckPassword(_id: ObjectId, password: string) {
        const result = await databaseService.Users.findOne(_id)
        if (result && bcrypt.compareSync(password, result.password)) {
            return true
        }
        return false
    }
    async UpdatePassword(_id: ObjectId, newPassword: string) {
        const password = HashPassword(newPassword);
        await databaseService.Users.updateOne({ _id }, { $set: { password, updated_at: new Date(), forgot_password_token: '' } })
        return {
            message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
        }
    }
    async ForgotPassword(email: string, user_id: string) {
        const forgot_password_token = await this.SignForgotPasswordToken(user_id);
        await databaseService.Users.updateOne({ _id: new ObjectId(user_id) }, [{
            $set: {
                forgot_password_token,
                updated_at: '$$NOW'
            }
        }])
        const url = `http://localhost:3000/users/forgot-password?forgot_password_token=${forgot_password_token}`
        sendVerifyEmail(email, "Forgot Password", ForgotPasswordTemplate(url, email))
            .then(result => console.log(result))
            .catch(err => console.log(err))
        return { message: "Forgot password success, please check email!!!" };

    }
    async VerifyForgotPassword(user_id: string, token: string) {
        const user = await databaseService.Users.findOne({ _id: new ObjectId(user_id) })

        if (user?.forgot_password_token === token) {
            return user.forgot_password_token
        }
        throw new ErrorWithStatus({ message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
    }
    async CheckRefreshTokenAndUserId(user_id: ObjectId, token: string) {
        const result = await databaseService.RefreshToken.findOne({ user_id });
        if (result?.refreshToken === token) {
            return true
        }
        return false
    }
    async UpdateUser(_id: ObjectId, user: UserUpdate) {

        const data = pick(user, ['name', 'date_of_birth', 'bio', 'location', 'website', 'avatar', 'cover_photo', 'username'])

        const result = await databaseService.Users.updateOne({ _id }, {
            $set: {
                ...data, updated_at: new Date()
            }
        })
        console.log("result", result)
        if (result.acknowledged && result.modifiedCount > 0) {
            return { message: USERS_MESSAGES.UPDATE_ME_SUCCESS, status: HTTP_STATUS.OK }
        }
        return { message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND }
    }
    //new Follower({ user_id: new ObjectId(user_id), follower_user_id: new ObjectId(follower_user_id) }
    async Follower(user_id: string, follower_user_id: string) {
        await databaseService.Follower.findOneAndUpdate(
            {
                user_id: new ObjectId(user_id),
                follower_user_id: new ObjectId(follower_user_id)
            },
            {
                $setOnInsert: new Follower({ user_id: new ObjectId(user_id), follower_user_id: new ObjectId(follower_user_id) })
            },

            {
                upsert: true, returnDocument: 'after'
            }
        )
        return { message: USERS_MESSAGES.FOLLOW_SUCCESS, status: HTTP_STATUS.OK }
    }
    async UnFollower(user_id: ObjectId, follower_user_id: ObjectId) {
        await databaseService.Follower.deleteOne({ user_id: new ObjectId(user_id), follower_user_id: new ObjectId(follower_user_id) })
        return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS, status: HTTP_STATUS.OK }
    }

    async VerifyEmailToken(_id: ObjectId, email_verify_token: string) {
        return await databaseService.Users.findOneAndUpdate(
            {
                _id: new ObjectId(_id),
                email_verify_token
            },
            {
                $set: { verify: 1, email_verify_token: "" }
            },
            { upsert: false, returnDocument: 'after' }
        )
    }
    async ResendVerifyEmailToken(user_id: string) {
        const user = await databaseService.Users.findOne({ _id: new ObjectId(user_id) })
        if (user && user.verify === UserVerifyStatus.Verified) {
            throw new ErrorWithStatus({ message: "Verified email", status: HTTP_STATUS.OK })
        } else {
            const email_verify_token = await this.SignEmailVerifyToken(user_id)
            databaseService.Users.updateOne({ _id: new ObjectId(user_id) }, { $set: { email_verify_token } })
            const url = `${process.env.HOSTUI}/verify-email?email_token=${email_verify_token}`
            sendVerifyEmail(user?.email as string, "Verify Email", VerifyEmailTemplate(url, user?.name as string))
                .then(result => console.log(result))
                .catch(err => console.log(err))
            return { message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS };
        }
    }


    async GetUserById(user_id: ObjectId) {
        const user = await databaseService.Users.findOne({ _id: new ObjectId(user_id) })
        const data = pick(user, ['_id', 'name', 'date_of_birth', 'bio', 'location', 'website', 'avatar', 'cover_photo', 'username', 'verify'])
        return data
    }
}

const userService = new UserService();
export default userService;