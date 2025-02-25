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


// change pin controller
const changePin = catchAsync(async (req, res) => {
    await authServices.changePinAtDB(req.user._id, req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Pin changed successfully'
    })
})


// send reset pin email controller
const sendResetPinEmail = catchAsync(async (req, res) => {
    await authServices.sendResetPinEmail(req.params.email);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Reset pin email sent successfully'
    })
})


// verify reset pin otp controller
const verifyResetPinOtp = catchAsync(async (req, res) => {
    const verifyToken = await authServices.verifyResetPinOtp(req.body);
    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Reset pin otp verified successfully',
        data: verifyToken
    })
})


// reset pin controller
const resetPin = catchAsync(async (req, res) => {
    await authServices.resetPin(req.params.token, req.body);

    sendResponse(res, {
        success: true,
        status: httpStatus.OK,
        message: 'Pin reset successfully'
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
    changePin,
    sendResetPinEmail,
    verifyResetPinOtp,
    resetPin,
    refreshToken,
    logout
}