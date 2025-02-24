import rateLimit from 'express-rate-limit';
import envConfig from '../configs/env.config';

interface IRateLimitConfig {
    windowMs?: number;
    max?: number;
    message?: string;
}

const rateLimiter = ({
    windowMs: minutes = 15,
    max = 100,
    message = 'Too many requests from this IP, please try again later.'
}: IRateLimitConfig = {}) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message
        },
        skip: (_req) => envConfig.app.nodeEnv === 'development',
        keyGenerator: (request) => {
            return request.ip || request.headers['x-forwarded-for'] as string || request.socket.remoteAddress || '';
        }
    });
};

export default rateLimiter;