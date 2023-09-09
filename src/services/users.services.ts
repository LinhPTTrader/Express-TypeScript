import User from '~/models/schemas/User.schema';
import databaseService from "./database.services";
import { RegisterRequestBody } from '~/models/request/User.requests';
import { HashPassword } from '~/utils/crypto';
import { SignToken } from '~/utils/jwt';
import { TokenType } from '~/constants/enum';


class UserService {
    async register(payload: RegisterRequestBody) {
        const result = await databaseService.Users.insertOne(
            new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: HashPassword(payload.password) })
        )

        return result;
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
            }
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
            }
        )
    }
}
const userService = new UserService();
export default userService;