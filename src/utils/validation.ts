import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
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

        res.status(400).json({ errors: errors.mapped() });
    };
};