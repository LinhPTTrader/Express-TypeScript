

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
        const firstError = Object.values(errors.mapped())[0];
        //Nếu không có lỗi thì Next
        if (errors.isEmpty()) {
            return next();
        }
        if (firstError.msg instanceof ErrorWithStatus && firstError.msg.status === 422) {
            console.log('Errors:', firstError.msg)
            return next(firstError.msg)
        }
        console.log(firstError.msg)
        next(firstError.msg)
    };
};