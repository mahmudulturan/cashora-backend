import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { userServices } from "./user.service";

// get users controller 
const getUsers = catchAsync(async (req, res) => {
    const users = await userServices.getAllUsersFromDB(req.query);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Users fetched successfully',
        data: users
    })
});


// get current user controller
const getCurrentUser = catchAsync(async (req, res) => {
    const token = req.cookies['access-token'];

    if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized Access');
    }

    const user = await userServices.getCurrentUser(token);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'User fetched successfully',
        data: user
    })
});


// get current user controller
const updateUser = catchAsync(async (req, res) => {
    await userServices.updateUserOnDB(req.user._id, req.body);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'User updated successfully'
    })
});


// update user status controller
const updateUserStatus = catchAsync(async (req, res) => {
    await userServices.updateUserStatusOnDB(req.params.id, req.body);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'User status updated successfully'
    })
})


// delete user controller
const deleteUser = catchAsync(async (req, res) => {
    await userServices.deleteUserFromDB(req.params.id);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: "User deleted successfully"
    })
})

export const userController = {
    getUsers,
    getCurrentUser,
    updateUser,
    updateUserStatus,
    deleteUser
}