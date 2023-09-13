

import { NextFunction, Request, Response } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/schemas/Errors';
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await validation.run(req);

        const errors = validationResult(req);
        //Nếu không có lỗi thì Next
        if (errors.isEmpty()) {
            return next();
        }
        // console.log('Errors:', errors)
        const errorsObject = errors.mapped();


        const entityError = new EntityError({ errors: {} });


        for (const key in errorsObject) {
            const { msg } = errorsObject[key]

            // Kiểm tra xem phải lỗi do Validator hay không
            if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {     // "msg instanceof ErrorrWithStatus" kiểm xem biến msg có thuộc kiểu ErrorWithStatus hay không 
                return next(msg)
            }
            entityError.errors[key] = errorsObject[key];
        }
        console.log(entityError)
        next(entityError)
    };
};