import express from 'express';
import pool from '../db';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/config/add-ons', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM add_ons');
        res.json(result.rows);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/address', authenticateToken as any, async (req, res) => {
    try {
        const { full_name, phone, house_number, street, area, city, pin_code, instructions } = req.body;
        const user_id = (req as any).user.id;
        const result = await pool.query(
            'INSERT INTO addresses (user_id, full_name, phone, house_number, street, area, city, pin_code, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [user_id, full_name, phone, house_number, street, area, city, pin_code, instructions]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/admin/dashboard', authenticateToken as any, authorizeAdmin as any, async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type = 'BASIC') as basic_deliveries,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type = 'PREMIUM') as premium_deliveries,
                (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type = 'ELITE') as elite_deliveries,
                (SELECT COUNT(*) FROM users WHERE role = 'user') as total_customers
        `);
        res.json(stats.rows[0]);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/referral', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const result = await pool.query(
            'SELECT referral_code, referral_points FROM users WHERE id = $1',
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { referral_code, referral_points } = result.rows[0];

        // Get total earned from completed referrals
        const earningsResult = await pool.query(
            'SELECT COALESCE(SUM(earned_amount), 0) as total FROM referrals WHERE referrer_id = $1 AND status = $2',
            [user_id, 'completed']
        );

        res.json({
            balance: referral_points || 0,
            totalEarned: parseFloat(earningsResult.rows[0].total),
            code: referral_code
        });
    } catch (err: any) {
        console.error('Referral balance error:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/user/settings
// Get user settings including profile, address, and notification preferences
router.get('/settings', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        const userResult = await pool.query(
            'SELECT id, name, phone, email, notifications FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get user's primary address
        const addressResult = await pool.query(
            'SELECT id, full_name, phone, house_number, street, area, city, pin_code, instructions FROM addresses WHERE user_id = $1 LIMIT 1',
            [user_id]
        );

        const address = addressResult.rows.length > 0 ? {
            id: addressResult.rows[0].id,
            fullName: addressResult.rows[0].full_name,
            phone: addressResult.rows[0].phone,
            houseNumber: addressResult.rows[0].house_number,
            street: addressResult.rows[0].street,
            area: addressResult.rows[0].area,
            city: addressResult.rows[0].city,
            pinCode: addressResult.rows[0].pin_code,
            instructions: addressResult.rows[0].instructions
        } : null;

        res.json({
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                notifications: user.notifications || { email: true, sms: false, push: true }
            },
            address
        });
    } catch (err: any) {
        console.error('Get settings error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/user/profile/update
// Update user profile (name and phone)
router.post('/profile/update', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        const result = await pool.query(
            'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, phone, email',
            [name, phone, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: result.rows[0].id,
                name: result.rows[0].name,
                phone: result.rows[0].phone,
                email: result.rows[0].email
            }
        });
    } catch (err: any) {
        console.error('Update profile error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/user/address/update
// Update or create user address
router.post('/address/update', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { id, fullName, phone, houseNumber, street, area, city, pinCode, instructions } = req.body;

        if (!fullName || !phone || !houseNumber || !street || !area || !city || !pinCode) {
            return res.status(400).json({ error: 'All address fields are required' });
        }

        let result;
        if (id) {
            // Update existing address
            result = await pool.query(
                'UPDATE addresses SET full_name = $1, phone = $2, house_number = $3, street = $4, area = $5, city = $6, pin_code = $7, instructions = $8 WHERE id = $9 AND user_id = $10 RETURNING id',
                [fullName, phone, houseNumber, street, area, city, pinCode, instructions, id, user_id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Address not found' });
            }
        } else {
            // Create new address
            result = await pool.query(
                'INSERT INTO addresses (user_id, full_name, phone, house_number, street, area, city, pin_code, instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
                [user_id, fullName, phone, houseNumber, street, area, city, pinCode, instructions]
            );
        }

        res.json({
            success: true,
            addressId: result.rows[0].id.toString()
        });
    } catch (err: any) {
        console.error('Update address error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/user/notifications/update
// Update notification preferences
router.post('/notifications/update', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { email, sms, push } = req.body;

        const notifications = {
            email: email !== undefined ? email : true,
            sms: sms !== undefined ? sms : false,
            push: push !== undefined ? push : true
        };

        const result = await pool.query(
            'UPDATE users SET notifications = $1 WHERE id = $2 RETURNING notifications',
            [JSON.stringify(notifications), user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            notifications: result.rows[0].notifications
        });
    } catch (err: any) {
        console.error('Update notifications error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/user/account/delete
// Delete user account
router.post('/account/delete', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        // Delete user and all related data (cascading deletes will handle related records)
        await pool.query('DELETE FROM users WHERE id = $1', [user_id]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (err: any) {
        console.error('Delete account error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
