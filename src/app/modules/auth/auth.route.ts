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


// change pin route
router.patch('/pin/change',
    verifyUser('user', 'agent', 'admin'),
    requestValidation(authValidation.changePinValidationSchema),
    authController.changePin);

// send reset pin email route
router.post('/pin/reset-email/:email',
    authRateLimiters.resetPinEmailLimit,
    authController.sendResetPinEmail);


router.post('/pin/reset/verify-otp',
    requestValidation(authValidation.verifyOtpValidationSchema),
    authController.verifyResetPinOtp)


// reset pin route
router.patch('/pin/reset/:token',
    requestValidation(authValidation.resetPinValidationSchema),
    authController.resetPin);


// refresh token route
router.post('/token/refresh',
    authController.refreshToken);


// logout route
router.get('/logout',
    verifyUser('user', 'admin', "agent"),
    authController.logout);

export default router;