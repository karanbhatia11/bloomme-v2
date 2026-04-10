import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'bloom_secret_key';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided, continue as guest
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (!err && user) {
            req.user = user;
        }
        // Continue regardless of verification result
        next();
    });
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export const requireEmailVerification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await pool.query('SELECT email_verified FROM users WHERE id = $1', [req.user.id]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.rows[0].email_verified) {
            return res.status(403).json({
                message: 'Email verification required',
                error: 'Please verify your email before accessing this feature. Check your inbox for the verification link.'
            });
        }

        next();
    } catch (err) {
        console.error('Email verification check error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

