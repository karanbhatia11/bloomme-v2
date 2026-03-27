import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'https://bloomme.co.in',
            'https://www.bloomme.co.in'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
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

// Serving uploaded files (using /api/uploads so it works seamlessly behind Nginx)
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
    res.send('BLOOMME Backend is running!');
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Ready to bloom' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
