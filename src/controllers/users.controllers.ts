import { Request, Response } from "express"

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