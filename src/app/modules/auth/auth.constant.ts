import envConfig from "../../configs/env.config";
import { ICookieOptions } from "../../interfaces/cookie";

// const liveDomain = envConfig.client.liveUrl!.split('//')[1].split('/')[0];

// // const cookieDomain = envConfig.app.nodeEnv === 'production' ? liveDomain : 'localhost';
const cookieHttpOnly = envConfig.app.nodeEnv === 'production';
const cookieSameSite = envConfig.app.nodeEnv === 'production' ? 'none' : 'lax';
const cookieSecure = envConfig.app.nodeEnv === 'production';

// Access token cookie options (7 days)
export const accessTokenCookieOptions: ICookieOptions = {
    // // domain: cookieDomain,
    httpOnly: cookieHttpOnly,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
};

// Refresh token cookie options (2 months)
export const refreshTokenCookieOptions: ICookieOptions = {
    // // domain: cookieDomain,
    httpOnly: cookieHttpOnly,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
};

// Log out cookie options
export const logOutCookieOptions: ICookieOptions = {
    // // domain: cookieDomain,
    httpOnly: cookieHttpOnly,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    maxAge: 0
};