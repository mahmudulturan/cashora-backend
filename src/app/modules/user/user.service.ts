import QueryBuilder from "../../builder/QueryBuilder";
import envConfig from "../../configs/env.config";
import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import { userSearchableFields } from "./user.constant";
import { IUser } from "./user.interface";
import User from "./user.model";
import jwt, { JwtPayload } from 'jsonwebtoken';


// retrieve all users service
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
    const populate = (query.populate as string)?.split(',');

    const usersQuery = new QueryBuilder(
        User.find()
            .populate(populate),
        query
    )
        .search(userSearchableFields).paginate().filter().sort().fields();

    const result = await usersQuery.modelQuery;
    const meta = await usersQuery.countTotal();

    return {
        meta,
        result
    };
}


// get current user
const getCurrentUser = async (token: string) => {
    try {
        const decoded = jwt.verify(token, envConfig.security.accessTokenSecret as string) as JwtPayload;

        const { userId, sessionToken } = decoded;

        const user = await User.findOne({ _id: userId, isDeleted: false });

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
        }

        // Verify if the session is still valid
        if (!user.isLoggedIn || user.activeSession?.token !== sessionToken) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
        }

        if (user.status === 'blocked') {
            throw new AppError(httpStatus.UNAUTHORIZED, "Your account has been blocked");
        }
        return user;
    } catch (error) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized Access");
    }
}

// update user service
const updateUserOnDB = async (userId: string, payload: Partial<IUser>) => {
    const user = await User.findByIdAndUpdate(userId, payload, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    return;
}


// update user status on db
const updateUserStatusOnDB = async (userId: string, payload: { status: "active" | "blocked" }) => {
    const user = await User.findByIdAndUpdate(userId, payload, { new: true });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return;
}


// delete user from db services
const deleteUserFromDB = async (userId: string) => {
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return;
};

export const userServices = {
    getAllUsersFromDB,
    updateUserOnDB,
    updateUserStatusOnDB,
    getCurrentUser,
    deleteUserFromDB
}