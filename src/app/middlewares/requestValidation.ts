import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

// request validation middleware
const requestValidation = (schema: AnyZodObject) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const parsedData = await schema.parseAsync({
            body: req.body
        })
        req.body = parsedData.body;
        next();
    })
}

export default requestValidation;