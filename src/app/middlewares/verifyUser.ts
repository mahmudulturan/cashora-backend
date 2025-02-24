import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from "../errors/AppError";
import User from "../modules/user/user.model";
import httpStatus from "../constants/httpStatus";
import envConfig from "../configs/env.config";

type TRole = 'user' | 'admin';

const verifyUser = (...requiredRole: TRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies['access-token'];

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized Access');
        }

        try {
            const decoded = jwt.verify(token, envConfig.security.accessTokenSecret as string) as JwtPayload;

            const { userId, role } = decoded;

            const user = await User.findById(userId);

            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
            }
            const isMatchedRole = requiredRole.includes(role);

            if (!isMatchedRole) {
                throw new AppError(httpStatus.UNAUTHORIZED, "You have no access to this route");
            };

            if (user.status === 'blocked') {
                throw new AppError(httpStatus.UNAUTHORIZED, "Your account has been blocked");
            }

            req.user = user;
        } catch (error) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
        }
        next();
    })
}

export default verifyUser;