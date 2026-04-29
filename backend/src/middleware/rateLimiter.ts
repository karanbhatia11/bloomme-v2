import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const WHITELISTED_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

const skip = (req: Request) => WHITELISTED_IPS.includes(req.ip || '');

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 signups per hour per IP
    message: { error: 'Too many accounts created from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    skip,
});
