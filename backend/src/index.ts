process.env.TZ = 'Asia/Kolkata'; // All date operations use IST

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { loginLimiter, signupLimiter, generalLimiter } from './middleware/rateLimiter';
import pool from './db';
import authRoutes from './routes/auth';
import subRoutes from './routes/subscriptions';
import userRoutes from './routes/user';
import newsletterRoutes from './routes/newsletter';
import configRoutes from './routes/config';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import dashboardRoutes from './routes/dashboard';
import paymentRoutes from './routes/payments';
import orderRoutes from './routes/orders';
import addonsRoutes from './routes/addons';
import referralsRoutes from './routes/referrals';
import promoRoutes from './routes/promo';
import calendarRoutes from './routes/calendar';
import previewRoutes from './routes/preview';
import creditsRoutes from './routes/credits';
import contactRoutes from './routes/contact';
import { startDeliveryJob } from './jobs/generateDeliveries';
import path from 'path';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.set('trust proxy', 1); // Trust first proxy (nginx) so rate limiting keys on real client IP

// HTTPS enforcement - redirect if not using HTTPS (except in development)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, `https://${req.header('host')}${req.url}`);
        }
        next();
    });
}

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
}));

// Apply general rate limiter
app.use(generalLimiter);

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3003',
            'http://127.0.0.1:3003',
            'http://localhost:3004',
            'http://127.0.0.1:3004',
            'http://localhost:3006',
            'http://127.0.0.1:3006',
            'http://localhost:3007',
            'http://127.0.0.1:3007',
            'https://bloomme.co.in',
            'https://www.bloomme.co.in'
        ];
        // Allow no origin (same-site requests) or from allowed list
        // In development, allow localhost with any port
        const isLocalhost = origin && /^http:\/\/(localhost|127\.0\.0\.1)/.test(origin);
        if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV === 'development' && isLocalhost)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addons', addonsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/preview', previewRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/contact', contactRoutes);

// Serving uploaded files (using /api/uploads so it works seamlessly behind Nginx)
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
    res.send('BLOOMME Backend is running!');
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Ready to bloom' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    startDeliveryJob();
});
