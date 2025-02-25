import envConfig from "../../configs/env.config";
import httpStatus from "../../constants/httpStatus";
import AppError from "../../errors/AppError";
import { IUser } from "../user/user.interface";
import User from "../user/user.model";
import { generateJwtToken, otpGenerator } from "./auth.utils";
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken';
import sendEmail from "../../utils/sendEmail";
import OTP from "../otp/otp.model";
import { v4 as uuidv4 } from 'uuid';


// create user service
const registerUserIntoDB = async (payload: IUser, deviceInfo: string) => {
    let isUserExist = await User.findOne({ $or: [{ email: payload.email }, { phone: payload.phone }, { nid: payload.nid }] });

    if (isUserExist && isUserExist.isDeleted) {
        await User.findByIdAndDelete(isUserExist._id);
        isUserExist = null;
    }

    // check if user already exist with email or phone
    if (isUserExist?.email === payload.email) {
        throw new AppError(httpStatus.CONFLICT, 'A user already registered with this email.');
    } else if (isUserExist?.phone === payload.phone) {
        throw new AppError(httpStatus.CONFLICT, 'A user already registered with this phone number.');
    } else if (isUserExist?.nid === payload.nid) {
        throw new AppError(httpStatus.CONFLICT, 'A user already registered with this NID.');
    }

    const sessionToken = uuidv4();

    // create user
    const newUser = await User.create({
        ...payload,
        isLoggedIn: true,
        activeSession: {
            token: sessionToken,
            lastLogin: new Date(),
            deviceInfo,
            lastDevice: null
        }
    });

    // generate access token
    const accessToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role, sessionToken }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role, sessionToken }, envConfig.security.refreshTokenSecret as string, '60d');

    const userWithoutPin = await User.findById(newUser._id);

    await sendEmail({
        to: payload.email,
        subject: `Welcome to ${envConfig.app.name}`,
        template: 'welcome',
        context: {
            name: payload.name.firstName,
            role: newUser.role
        }
    })
    return { user: userWithoutPin, accessToken, refreshToken };
}


// login user service
const loginUserFromDB = async (payload: { emailOrPhone: string; pin: string; }, deviceInfo: string) => {
    const user = await User.findOne({
        $and: [{ isDeleted: false, $or: [{ email: payload.emailOrPhone }, { phone: payload.emailOrPhone }] }]
    }).select('+pin');

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

    // Generate new session token
    const sessionToken = uuidv4();

    // Update user's session information with new device
    await User.findByIdAndUpdate(user._id, {
        isLoggedIn: true,
        activeSession: {
            token: sessionToken,
            lastLogin: new Date(),
            deviceInfo,
            lastDevice: user.activeSession?.deviceInfo || null
        }
    });

    // generate access token with session information
    const accessToken = generateJwtToken(
        {
            userId: String(user._id),
            role: user.role,
            sessionToken
        },
        envConfig.security.accessTokenSecret as string,
        '7d'
    );

    // generate refresh token with session information
    const refreshToken = generateJwtToken(
        {
            userId: String(user._id),
            role: user.role,
            sessionToken
        },
        envConfig.security.refreshTokenSecret as string,
        '60d'
    );

    const userWithoutPin = await User.findById(user._id);

    return {
        user: userWithoutPin,
        accessToken,
        refreshToken,
        wasLoggedOutFromOtherDevice: user.isLoggedIn
    };
}


// change pin service
const changePinAtDB = async (userId: string, payload: { oldPin: string, newPin: string }) => {
    const user = await User.findById(userId).select('+pin');

    // if user not found throw error
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // compare with the hashed pin
    const isPinMatch = await bcrypt.compare(payload.oldPin, user.pin);

    // if pin not match throw error
    if (!isPinMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old pin is incorrect");
    }

    user.pin = payload.newPin;
    await user.save();

    return;
}


// send reset pin email service
const sendResetPinEmail = async (email: string) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const otpCode = otpGenerator();

    const hashedOtpCode = await bcrypt.hash(otpCode, Number(envConfig.security.saltRounds));

    // set forgot pin otp
    await OTP.findOneAndUpdate(
        { userId: user._id, email: user.email },
        { otp: hashedOtpCode },
        { upsert: true, new: true }
    );

    const resetToken = jwt.sign({ userId: user._id, email: user.email }, envConfig.security.resetPinTokenSecret as string, { expiresIn: '5m' });

    await sendEmail({
        to: email,
        subject: 'Reset Your Pin',
        template: 'resetPin',
        context: {
            firstName: user.name.firstName,
            resetToken,
            otpCode,
            currentYear: new Date().getFullYear(),
            resetUrl: `${envConfig.app.nodeEnv === 'production' ? envConfig.client.liveUrl : envConfig.client.localUrl}/forgot-pin?step=change-pin&token=${resetToken}`
        }
    });

    return;
}


// verify reset pin otp service
const verifyResetPinOtp = async (payload: { otp: string, email: string }) => {
    const hashedOtpCode = await OTP.findOne({ email: payload.email });

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

    const resetToken = jwt.sign({ userId: isUserExist._id, email: isUserExist.email }, envConfig.security.resetPinTokenSecret as string, { expiresIn: '5m' });

    await OTP.findByIdAndDelete(hashedOtpCode._id);

    return { resetToken };
}


// reset pin service
const resetPin = async (token: string, payload: { newPin: string }) => {
    let id: string;
    let userEmail: string;
    try {
        const { userId, email } = jwt.verify(token, envConfig.security.resetPinTokenSecret as string) as JwtPayload;
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


// logout user service
const logoutUserFromDB = async (userId: string) => {
    await User.findByIdAndUpdate(userId, { isLoggedIn: false, activeSession: { token: null, lastLogin: null, deviceInfo: null, lastDevice: null } });
}

export const authServices = {
    registerUserIntoDB,
    loginUserFromDB,
    changePinAtDB,
    sendResetPinEmail,
    resetPin,
    refreshToken,
    verifyResetPinOtp,
    logoutUserFromDB
}