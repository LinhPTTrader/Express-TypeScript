import { Request, Response } from "express"
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import userService from "~/services/users.services";

export const LoginController = (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email === 'linhphan@gmail.com' && password === '123456') {
        return res.send({
            message: 'Login Sucess'
        })
    }
    res.status(400).send({
        error: 'Login Fail'
    })
}

export const RegisterController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = userService.register({ email, password })
        return res.json({
            message: 'Thêm mới thành công',
            result
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'Thêm mới không thành công',
            error
        })
    }


}