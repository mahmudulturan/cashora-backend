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

    const username = await generateUsername(payload.name.firstName, payload.name.lastName);


    // create user
    const newUser = await User.create({ ...payload, username });


    // generate access token
    const accessToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role, isEmailVerified: newUser.isEmailVerified }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(newUser._id), role: newUser.role, isEmailVerified: newUser.isEmailVerified }, envConfig.security.refreshTokenSecret as string, '60d');


    const userWithoutPassword = await User.findById(newUser._id);

    const verificationCode = otpGenerator();

    const hashedOtpCode = await bcrypt.hash(verificationCode, Number(envConfig.security.saltRounds));

    await OTP.create({
        userId: newUser._id,
        email: newUser.email,
        otp: hashedOtpCode,
        type: 'verification'
    });


    // send verification email
    const verificationToken = jwt.sign({ userId: newUser._id, email: newUser.email }, envConfig.security.emailVerificationTokenSecret as string, { expiresIn: '30m' });
    const verificationUrl = `${envConfig.client.localUrl}/verify-email?token=${verificationToken}`;
    await sendEmail({
        to: payload.email,
        subject: `Welcome to ${envConfig.app.name}`,
        template: 'welcome',
        context: {
            name: payload.name.firstName,
            role: "user",
            verificationUrl,
            verificationCode,
        }
    })
    return { user: userWithoutPassword, accessToken, refreshToken };
}


// login user service
const loginUserFromDB = async (payload: { email: string; password: string; }) => {

    const user = await User.findOne({ $and: [{ isDeleted: false, email: payload.email }] }).select('+password');

    // if user not found throw error
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // compare with the hashed password
    const isPasswordMatch = await bcrypt.compare(payload.password, user.password);

    // if password not match throw error
    if (!isPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password");
    }


    // generate access token
    const accessToken = generateJwtToken({ userId: String(user._id), role: user.role, isEmailVerified: user.isEmailVerified }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(user._id), role: user.role, isEmailVerified: user.isEmailVerified }, envConfig.security.refreshTokenSecret as string, '60d');

    const userWithoutPassword = await User.findById(user._id);

    return { user: userWithoutPassword, accessToken, refreshToken };
}


// change password service
const changePasswordAtDB = async (userId: string, payload: { oldPassword: string, newPassword: string }) => {
    const user = await User.findById(userId).select('+password');

    // if user not found throw error
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // compare with the hashed password
    const isPasswordMatch = await bcrypt.compare(payload.oldPassword, user.password);

    // if password not match throw error
    if (!isPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    user.password = payload.newPassword;
    await user.save();

    return;
}


// send verificationEmail service
const sendVerificationEmail = async (email: string) => {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    } else if (user.isEmailVerified) {
        throw new AppError(httpStatus.CONFLICT, "User is already verified");
    }
    const verificationCode = otpGenerator();

    const hashedOtpCode = await bcrypt.hash(verificationCode, Number(envConfig.security.saltRounds));

    await OTP.create({
        userId: user._id,
        email: user.email,
        otp: hashedOtpCode,
        type: 'verification'
    });

    const verificationToken = jwt.sign({ userId: user._id, email: user.email }, envConfig.security.emailVerificationTokenSecret as string, { expiresIn: '30m' });

    const verificationUrl = `${envConfig.app.nodeEnv === 'production' ? envConfig.client.liveUrl : envConfig.client.localUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"${envConfig.app.name}" <${envConfig.email.gmailId}>`,
        to: email,
        subject: `Verify Your Email for ${envConfig.app.name}`,
        template: 'verifyEmail',
        context: {
            firstName: user.name.firstName,
            verificationUrl,
            verificationCode,
            currentYear: new Date().getFullYear()
        }
    };

    await sendEmail(mailOptions);

    return;
}


// verify email service
const verifyEmail = async (token?: string, payload?: { email: string, verificationCode: string }) => {
    let id: string = '';
    let userEmail: string = '';
    if (token) {
        try {
            const { userId, email } = jwt.verify(token, envConfig.security.emailVerificationTokenSecret as string) as JwtPayload;
            id = userId;
            userEmail = email;
        } catch (error) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
        }

        const isUserExist = await User.findOne({ _id: id, isDeleted: false });

        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        } else if (isUserExist.isEmailVerified) {
            throw new AppError(httpStatus.CONFLICT, "User is already verified");
        } else if (isUserExist.email !== userEmail) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
        }
    } else if (payload?.email && payload?.verificationCode) {
        const hashedOtpCode = await OTP.findOne({ email: payload.email, type: 'verification' });

        if (!hashedOtpCode) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid verification code");
        }

        const isOtpValid = await bcrypt.compare(payload.verificationCode, hashedOtpCode.otp);
        if (!isOtpValid) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid verification code");
        }

        const isUserExist = await User.findOne({ email: payload.email, isDeleted: false });

        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        } else if (isUserExist.isEmailVerified) {
            throw new AppError(httpStatus.CONFLICT, "User is already verified");
        }
        id = isUserExist._id.toString();
        userEmail = isUserExist.email;
    } else {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid request");
    }


    const user = await User.findByIdAndUpdate(id, { isEmailVerified: true }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    await OTP.deleteOne({ userId: user._id, type: 'verification' });

    const emailConfig = {
        from: `"${envConfig.app.name}" <${envConfig.email.gmailId}>`,
        to: user.email,
        subject: 'Email Verified Successfully!',
        template: 'verifiedEmail',
        context: {
            name: user.name.firstName,
            role: user.role
        }
    };
    await sendEmail(emailConfig);

    // generate access token
    const accessToken = generateJwtToken({ userId: String(user._id), role: user.role, isEmailVerified: true }, envConfig.security.accessTokenSecret as string, '7d');

    // generate refresh token
    const refreshToken = generateJwtToken({ userId: String(user._id), role: user.role, isEmailVerified: true }, envConfig.security.refreshTokenSecret as string, '60d');

    return { accessToken, refreshToken };
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
const resetPassword = async (token: string, payload: { newPassword: string }) => {
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

    const hashedNewPassword = await bcrypt.hash(payload.newPassword, Number(envConfig.security.saltRounds));

    await User.findByIdAndUpdate(id, { password: hashedNewPassword });

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
    sendVerificationEmail,
    verifyEmail,
    sendResetPasswordEmail,
    resetPassword,
    refreshToken,
    verifyResetPasswordOtp
}