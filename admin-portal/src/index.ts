import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.ADMIN_PORT || 9000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Authentication middleware
const authenticateToken = (req: any, res: Response, next: any) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err: any) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// --- LOGIN ---
app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Admin credentials
        const ADMIN_USERNAME = 'rushilpartner@gmail.com';
        const ADMIN_PASSWORD = 'gauravpartner';

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET HOMEPAGE CONTENT ---
app.get('/api/homepage-content', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/homepage-content`, {
            headers: {
                'Authorization': req.headers.authorization,
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- UPDATE HOMEPAGE CONTENT ---
app.put('/api/homepage-content/:section', authenticateToken, async (req: any, res: Response) => {
    try {
        const { section } = req.params;
        const response = await fetch(`${BACKEND_URL}/api/admin/homepage-content/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization,
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROXY ROUTES FOR ADMIN DASHBOARD ---
// GET /api/admin/stats
app.get('/api/admin/stats', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/users
app.get('/api/admin/users', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/subscriptions
app.get('/api/admin/subscriptions', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/subscriptions`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/subscriptions/:id/details
app.get('/api/admin/subscriptions/:id/details', authenticateToken, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const response = await fetch(`${BACKEND_URL}/api/admin/subscriptions/${id}/details`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/orders
app.get('/api/admin/orders', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/orders`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/addons
app.get('/api/admin/addons', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/addons`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/delivery-manifest
app.get('/api/admin/delivery-manifest', authenticateToken, async (req: any, res: Response) => {
    try {
        const { from_date, to_date } = req.query;
        let queryStr = `${BACKEND_URL}/api/admin/delivery-manifest`;
        if (from_date && to_date) {
            queryStr += `?from_date=${from_date}&to_date=${to_date}`;
        }
        const response = await fetch(queryStr, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/page-content
app.get('/api/admin/page-content', authenticateToken, async (req: any, res: Response) => {
    try {
        const page = req.query.page || '';
        const response = await fetch(`${BACKEND_URL}/api/admin/page-content?page=${page}`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/page-content/:id
app.put('/api/admin/page-content/:id', authenticateToken, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const response = await fetch(`${BACKEND_URL}/api/admin/page-content/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/upload/image
app.post('/api/upload/image', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
            method: 'POST',
            headers: { 'Authorization': req.headers.authorization },
            body: req.body
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/deliveries/mark-status
app.put('/api/admin/deliveries/mark-status', authenticateToken, async (req: any, res: Response) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/deliveries/mark-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Serve admin portal HTML for root and all unmatched routes (SPA routing)
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Admin Portal running on http://localhost:${PORT}`);
});
