import { Request, Response } from "express"
import userService from "~/services/users.services";
import { ParamsDictionary } from "express-serve-static-core"
import { RegisterRequestBody } from "~/models/request/User.requests";

export const LoginController = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const result = await userService.checkEmail(email);
    //console.log(result)
    if (result && password === result.password) {
        const accessToken = await userService.SignAccessToken(result._id.toString());
        const refreshToken = await userService.SignRefreshToken(result._id.toString())
        res.json({
            message: 'Login thanh cong',
            accessToken,
            refreshToken
        })
    } else {
        res.json('Login that bai')
    }
}

export const RegisterController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {

    try {
        const result = await userService.register(req.body)
        return res.json({
            message: 'Thêm mới thành công',
            result
        })
    } catch (error) {
        // console.log(error)
        return res.status(400).json({
            message: 'Thêm mới không thành công',
            error
        })
    }


}