import jwt from 'jsonwebtoken';


export const SignToken = (payload: string | Buffer | object, options: jwt.SignOptions) => {

    return new Promise<string>((resolve, reject) => {

        jwt.sign(payload, process.env.JWT_SECRECT as string, options, (error, token) => {
            if (error) {
                throw reject(error)
            }
            resolve(token as string)
        })
    })

}