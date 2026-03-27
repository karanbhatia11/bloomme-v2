import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.ADMIN_PORT || 9000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
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

// Serve admin portal HTML
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Admin Portal running on http://localhost:${PORT}`);
});
