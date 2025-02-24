import { NextFunction, Request, RequestHandler, Response } from "express";

// using higher order function to catch async errors
const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // if promise resolved then call the function if cathed then call next with error
        Promise.resolve(fn(req, res, next)).catch(error => next(error));
    }
}


export default catchAsync