import envConfig from "../../configs/env.config";
import httpStatus from "../../constants/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { accessTokenCookieOptions, logOutCookieOptions, refreshTokenCookieOptions } from "./auth.constant";
import { authServices } from "./auth.service";

// create user controller
const registerUser = catchAsync(async (req, res) => {
    const deviceInfo = `${req.headers['user-agent']} - ${req.ip}`;

    const { user, accessToken, refreshToken } = await authServices.registerUserIntoDB(req.body, deviceInfo);

    // send response with refresh and access token
    res.status(httpStatus.CREATED)
        .cookie("access-token", accessToken, accessTokenCookieOptions)
        .cookie("refresh-token", refreshToken, refreshTokenCookieOptions)
        .send({ success: true, message: `${user?.role === 'user' ? 'User' : user?.role === 'agent' ? 'Agent' : 'Admin'} registered successfully!`, data: user });
})


// login user controller
const loginUser = catchAsync(async (req, res) => {
    const deviceInfo = `${req.headers['user-agent']} - ${req.ip}`;
    
    const { 
        user, 
        accessToken, 
        refreshToken, 
        wasLoggedOutFromOtherDevice 
    } = await authServices.loginUserFromDB(req.body, deviceInfo);

    // send response with refresh and access token
    res.status(httpStatus.OK)
        .cookie("access-token", accessToken, accessTokenCookieOptions)
        .cookie("refresh-token", refreshToken, refreshTokenCookieOptions)
        .send({ 
            success: true, 
            message: wasLoggedOutFromOtherDevice 
                ? "Logged in successfully. You were logged out from other devices."
                : "User logged in successful!", 
            data: user 
        });
})


// change password controller
const changePassword = catchAsync(async (req, res) => {
    await authServices.changePasswordAtDB(req.user._id, req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Password changed successfully'
    })
})


// send reset password email controller
const sendResetPasswordEmail = catchAsync(async (req, res) => {
    await authServices.sendResetPasswordEmail(req.params.email);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Reset password email sent successfully'
    })
})


// verify reset password otp controller
const verifyResetPasswordOtp = catchAsync(async (req, res) => {
    const verifyToken = await authServices.verifyResetPasswordOtp(req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Reset password otp verified successfully',
        data: verifyToken
    })
})


// reset password controller
const resetPassword = catchAsync(async (req, res) => {
    await authServices.resetPassword(req.params.token, req.body);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Password reset successfully'
    })
})


// refresh token controller
const refreshToken = catchAsync(async (req, res) => {
    const accessToken = await authServices.refreshToken(req.cookies["refresh-token"]);

    // send response
    res.status(httpStatus.OK)
        .cookie("access-token", accessToken, {
            httpOnly: envConfig.app.nodeEnv === 'production',
            sameSite: envConfig.app.nodeEnv === 'production' ? 'none' : 'lax',
            secure: envConfig.app.nodeEnv === 'production',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        .send({ success: true, message: "Token refreshed successfully" });
})

const logout = catchAsync(async (req, res) => {
    await authServices.logoutUserFromDB(req.user._id);
    res.clearCookie("access-token", logOutCookieOptions)
        .clearCookie("refresh-token", logOutCookieOptions)
        .send({ success: true, message: "User logged out successfully" });
});


export const authController = {
    registerUser,
    loginUser,
    changePassword,
    sendResetPasswordEmail,
    verifyResetPasswordOtp,
    resetPassword,
    refreshToken,
    logout
}