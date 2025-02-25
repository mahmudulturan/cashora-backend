import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from "../errors/AppError";
import User from "../modules/user/user.model";
import httpStatus from "../constants/httpStatus";
import envConfig from "../configs/env.config";

type TRole = 'user' | 'admin' | 'agent';

const verifyUser = (...requiredRole: TRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies['access-token'];

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized Access');
        }

        try {
            const decoded = jwt.verify(token, envConfig.security.accessTokenSecret as string) as JwtPayload;

            const { userId, role, sessionToken } = decoded;

            const user = await User.findById(userId);

            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
            }
            
            // Verify if the session is still valid
            if (!user.isLoggedIn || user.activeSession?.token !== sessionToken) {
                throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
            }

            const isMatchedRole = requiredRole.includes(role);

            if (!isMatchedRole) {
                throw new AppError(httpStatus.UNAUTHORIZED, "You have no access to this route");
            }

            if (user.status === 'blocked') {
                throw new AppError(httpStatus.UNAUTHORIZED, "Your account has been blocked");
            }

            // Add session information to the request
            req.user = {
                ...user.toObject(),
                userId,
                role,
                sessionToken
            };

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AppError(httpStatus.UNAUTHORIZED, "Token has expired");
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
            }
            throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
        }
    });
};

export default verifyUser;