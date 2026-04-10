import express from 'express';
import pool from '../db';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';

const router = express.Router();

// GET /api/referrals/overview
// Get referral statistics and overview
router.get('/overview', authenticateToken as any, requireEmailVerification as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        // Get user's referral code and balance
        const userResult = await pool.query(
            'SELECT referral_code, referral_points FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { referral_code, referral_points } = userResult.rows[0];

        // Count total referrals
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM referrals WHERE referrer_id = $1',
            [user_id]
        );

        const referralCount = parseInt(countResult.rows[0].count);

        // Sum earned amount from referrals
        const earningsResult = await pool.query(
            'SELECT COALESCE(SUM(earned_amount), 0) as total FROM referrals WHERE referrer_id = $1 AND status = $2',
            [user_id, 'completed']
        );

        const totalEarnings = parseFloat(earningsResult.rows[0].total);

        res.json({
            code: referral_code,
            balance: referral_points || 0,
            totalEarnings,
            referralCount,
            minWithdrawal: 500  // Minimum amount to withdraw
        });
    } catch (err: any) {
        console.error('Referral overview error:', err);
        res.status(400).json({ error: err.message });
    }
});

// GET /api/referrals/list
// Get list of referrals with details
router.get('/list', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;

        const result = await pool.query(
            `SELECT r.id, u.name as referred_name, u.email as referred_email, r.status, r.earned_amount, r.created_at
             FROM referrals r
             JOIN users u ON r.referred_user_id = u.id
             WHERE r.referrer_id = $1
             ORDER BY r.created_at DESC`,
            [user_id]
        );

        const referrals = result.rows.map((row) => ({
            id: row.id.toString(),
            referredName: row.referred_name,
            referredEmail: row.referred_email,
            status: row.status,
            earnedAmount: parseFloat(row.earned_amount),
            referralDate: row.created_at.toISOString().split('T')[0]
        }));

        res.json({
            referrals,
            total: referrals.length
        });
    } catch (err: any) {
        console.error('Referral list error:', err);
        res.status(400).json({ error: err.message });
    }
});

// POST /api/referrals/withdraw
// Withdraw referral balance
router.post('/withdraw', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { amount, method } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!method || !['bank', 'upi'].includes(method)) {
            return res.status(400).json({ error: 'Invalid withdrawal method' });
        }

        // Get user's current balance
        const userResult = await pool.query(
            'SELECT referral_points FROM users WHERE id = $1',
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentBalance = userResult.rows[0].referral_points;

        if (currentBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Create withdrawal request
        const withdrawalResult = await pool.query(
            `INSERT INTO referral_withdrawals (user_id, amount, method, status, created_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             RETURNING id`,
            [user_id, amount, method, 'pending']
        );

        const withdrawalId = withdrawalResult.rows[0].id;

        // Update user's referral points (deduct amount)
        await pool.query(
            'UPDATE users SET referral_points = referral_points - $1 WHERE id = $2',
            [amount, user_id]
        );

        res.json({
            success: true,
            withdrawalId: withdrawalId.toString(),
            message: `Withdrawal of ₹${amount} requested via ${method}`
        });
    } catch (err: any) {
        console.error('Withdraw referral error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
