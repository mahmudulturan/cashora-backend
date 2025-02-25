import { Router } from "express";
import { authController } from "./auth.controller";
import requestValidation from "../../middlewares/requestValidation";
import { authValidation } from "./auth.validation";
import { authRateLimiters } from "./auth.limiter";
import verifyUser from "../../middlewares/verifyUser";
const router = Router();


// register user route
router.post('/register',
    authRateLimiters.userRegisterLimit,
    requestValidation(authValidation.registerUserValidationSchema),
    authController.registerUser);


// login user route
router.post('/login',
    authRateLimiters.loginRateLimit,
    requestValidation(authValidation.loginUserValidationSchema),
    authController.loginUser);


// change password route
router.patch('/password/change',
    verifyUser('user', 'admin'),
    requestValidation(authValidation.changePasswordValidationSchema),
    authController.changePassword);

// send reset password email route
router.post('/password/reset-email/:email',
    authRateLimiters.resetPasswordEmailLimit,
    authController.sendResetPasswordEmail);


router.post('/password/reset/verify-otp',
    requestValidation(authValidation.verifyOtpValidationSchema),
    authController.verifyResetPasswordOtp)


// reset password route
router.patch('/password/reset/:token',
    requestValidation(authValidation.resetPasswordValidationSchema),
    authController.resetPassword);


// refresh token route
router.post('/token/refresh',
    authController.refreshToken);


// logout route
router.get('/logout',
    verifyUser('user', 'admin'),
    authController.logout);

export default router;