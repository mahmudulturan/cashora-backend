import { NextFunction, Request, Response } from "express";
import httpStatus from "../constants/httpStatus";


const notFoundErrorHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: "Route Not Found",
        error: '404 Route Not Found'
    })
};

export default notFoundErrorHandler;