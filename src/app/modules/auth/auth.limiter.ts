import rateLimiter from "../../middlewares/rateLimiter";

// login rate limiter
const loginRateLimit = rateLimiter({
    windowMs: 15,
    max: 10,
    message: 'Too many login attempts, please try again later'
});

// user register rate limiter
const userRegisterLimit = rateLimiter({
    windowMs: 15,
    max: 5,
    message: 'Too many registration attempts, please try again later'
});

// verification email rate limiter
const verificationEmailLimit = rateLimiter({
    windowMs: 15,
    max: 5,
    message: 'Too many verification email requests, please try again later'
});

// reset password email rate limiter
const resetPasswordEmailLimit = rateLimiter({
    windowMs: 15,
    max: 5,
    message: 'Too many reset password requests, please try again later'
});


export const authRateLimiters = {
    loginRateLimit,
    userRegisterLimit,
    verificationEmailLimit,
    resetPasswordEmailLimit
}