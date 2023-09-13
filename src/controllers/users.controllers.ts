import { NextFunction, Request, Response } from "express"
import userService from "~/services/users.services";
import { ParamsDictionary } from "express-serve-static-core"
import { RegisterRequestBody } from "~/models/request/User.requests";

import { USERS_MESSAGES } from "~/constants/messages";

export const LoginController = async (req: Request, res: Response) => {

    const { email, password } = req.body;
    userService.SaveRefreshToken(email, password)
        .then((result) => {
            res.json(result)
        })
        .catch(err => res.json(err))


}

export const RegisterController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response, next: NextFunction) => {
    const result = await userService.register(req.body)
    // throw new Error('Loi')
    return res.json({
        message: USERS_MESSAGES.REGISTER_SUCCESS,
        result
    })
}