import envConfig from "../../configs/env.config";
import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import { IUser } from "../user/user.interface";
import User from "../user/user.model";
import { generateJwtToken, generateUsername, otpGenerator } from "./auth.utils";
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken';
import sendEmail from "../../utils/sendEmail";
import OTP from "../otp/otp.model";


// create user service
const registerUserIntoDB = async (payload: IUser) => {
    const isUserExist = await User.findOne({ email: payload.email });

    // check if user already exist with email or phone
    if (isUserExist?.email === payload.email) {
        throw new AppError(httpStatus.CONFLICT, 'A user already registered with this email.');
    } else if (isUserExist?.phone === payload.phone) {
        throw new AppError(httpStatus.CONFLICT, 'A user already registered with this phone number.');
    }


    // create user
    const newUser = await User.create({ ...payload });


    // generate access token
    const accessToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role }, envConfig.security.refreshTokenSecret as string, '60d');


    const userWithoutPassword = await User.findById(newUser._id);

    const verificationCode = otpGenerator();

    const hashedOtpCode = await bcrypt.hash(verificationCode, Number(envConfig.security.saltRounds));

    await OTP.create({
        userId: newUser._id,
        email: newUser.email,
        otp: hashedOtpCode,
        type: 'verification'
    });

    await sendEmail({
        to: payload.email,
        subject: `Welcome to ${envConfig.app.name}`,
        template: 'welcome',
        context: {
            name: payload.name.firstName,
            role: "user"
        }
    })
    return { user: userWithoutPassword, accessToken, refreshToken };
}


// login user service
const loginUserFromDB = async (payload: { email: string; pin: string; }) => {

    const user = await User.findOne({ $and: [{ isDeleted: false, email: payload.email }] }).select('+pin');

    // if user not found throw error
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // compare with the hashed pin
    const isPinMatch = await bcrypt.compare(payload.pin, user.pin);

    // if pin not match throw error
    if (!isPinMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect pin");
    }


    // generate access token
    const accessToken = generateJwtToken({ userId: String(user._id), role: user.role }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(user._id), role: user.role }, envConfig.security.refreshTokenSecret as string, '60d');

    const userWithoutPin = await User.findById(user._id);

    return { user: userWithoutPin, accessToken, refreshToken };
}


// change password service
const changePasswordAtDB = async (userId: string, payload: { oldPassword: string, newPassword: string }) => {
    const user = await User.findById(userId).select('+pin');

    // if user not found throw error
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // compare with the hashed pin
    const isPinMatch = await bcrypt.compare(payload.oldPassword, user.pin);

    // if pin not match throw error
    if (!isPinMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old pin is incorrect");
    }

    user.pin = payload.newPassword;
    await user.save();

    return;
}


// send reset password email service
const sendResetPasswordEmail = async (email: string) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const otpCode = otpGenerator();

    const hashedOtpCode = await bcrypt.hash(otpCode, Number(envConfig.security.saltRounds));

    // set forgot password otp
    await OTP.create({
        userId: user._id,
        email: user.email,
        otp: hashedOtpCode,
        type: 'forgot-password'
    });

    const resetToken = jwt.sign({ userId: user._id, email: user.email }, envConfig.security.resetPasswordTokenSecret as string, { expiresIn: '5m' });

    await sendEmail({
        to: email,
        subject: 'Reset Your Password',
        template: 'resetPassword',
        context: {
            firstName: user.name.firstName,
            resetToken,
            otpCode,
            currentYear: new Date().getFullYear(),
            resetUrl: `${envConfig.app.nodeEnv === 'production' ? envConfig.client.liveUrl : envConfig.client.localUrl}/forgot-password?step=change-password&token=${resetToken}`
        }
    });

    return;
}


// verify reset password otp service
const verifyResetPasswordOtp = async (payload: { otp: string, email: string }) => {
    const hashedOtpCode = await OTP.findOne({ email: payload.email, type: 'forgot-password' });

    if (!hashedOtpCode) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid otp code");
    }

    const isOtpValid = await bcrypt.compare(payload.otp, hashedOtpCode.otp);
    if (!isOtpValid) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid otp code");
    }

    const isUserExist = await User.findOne({ email: payload.email, isDeleted: false });

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    } else if (isUserExist.email !== payload.email) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const resetToken = jwt.sign({ userId: isUserExist._id, email: isUserExist.email }, envConfig.security.resetPasswordTokenSecret as string, { expiresIn: '5m' });

    await OTP.deleteOne({ userId: isUserExist._id, type: 'forgot-password' });

    return { resetToken };
}


// reset password service
const resetPassword = async (token: string, payload: { newPin: string }) => {
    let id: string;
    let userEmail: string;
    try {
        const { userId, email } = jwt.verify(token, envConfig.security.resetPasswordTokenSecret as string) as JwtPayload;
        id = userId;
        userEmail = email;
    } catch (error) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const isUserExist = await User.findOne({ _id: id, isDeleted: false });

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    } else if (isUserExist.email !== userEmail) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const hashedNewPin = await bcrypt.hash(payload.newPin, Number(envConfig.security.saltRounds));

    await User.findByIdAndUpdate(id, { pin: hashedNewPin });

    return;
}


// refresh token service
const refreshToken = async (token: string) => {
    const { userId } = jwt.verify(token, envConfig.security.refreshTokenSecret as string) as JwtPayload;

    const isUserExist = await User.findOne({ _id: userId, isDeleted: false });

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    } else if (isUserExist.status === 'blocked') {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is blocked");
    }

    const accessToken = generateJwtToken({ userId: String(isUserExist._id), role: isUserExist.role }, envConfig.security.accessTokenSecret as string, '7d');

    return accessToken;
}


export const authServices = {
    registerUserIntoDB,
    loginUserFromDB,
    changePasswordAtDB,
    sendResetPasswordEmail,
    resetPassword,
    refreshToken,
    verifyResetPasswordOtp
}