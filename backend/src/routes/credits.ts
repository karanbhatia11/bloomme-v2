import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper: get live balance (earns that haven't expired + redeems)
export async function getBloomCreditsBalance(userId: number): Promise<number> {
    const result = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS balance
         FROM bloom_credit_transactions
         WHERE user_id = $1
           AND (type = 'redeem' OR expires_at IS NULL OR expires_at > NOW())`,
        [userId]
    );
    return Math.max(0, parseInt(result.rows[0].balance) || 0);
}

// Helper: award credits to a user
export async function awardCredits(
    userId: number,
    amount: number,
    type: 'earn_purchase' | 'earn_referral_given' | 'earn_referral_received',
    description: string,
    orderId?: number
): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 12 months

    await pool.query(
        `INSERT INTO bloom_credit_transactions (user_id, amount, type, order_id, description, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, amount, type, orderId || null, description, expiresAt]
    );
}

// GET /api/credits/balance
router.get('/balance', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const balance = await getBloomCreditsBalance(user_id);
        const rupeesValue = parseFloat((balance * 0.10).toFixed(2));
        res.json({ credits: balance, rupeesValue });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/credits/history
router.get('/history', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const result = await pool.query(
            `SELECT id, amount, type, description, expires_at, created_at
             FROM bloom_credit_transactions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [user_id]
        );
        res.json({ transactions: result.rows });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/credits/redeem  { orderId, creditsToRedeem }
router.post('/redeem', authenticateToken as any, async (req, res) => {
    try {
        const user_id = (req as any).user.id;
        const { orderId, creditsToRedeem } = req.body;

        if (!creditsToRedeem || creditsToRedeem < 100) {
            return res.status(400).json({ error: 'Minimum redemption is 100 credits (₹10)' });
        }

        // Get current balance
        const balance = await getBloomCreditsBalance(user_id);
        if (balance < creditsToRedeem) {
            return res.status(400).json({ error: 'Insufficient credits' });
        }

        // Validate max 20% of order
        if (orderId) {
            const orderResult = await pool.query('SELECT amount FROM orders WHERE id = $1 AND user_id = $2', [orderId, user_id]);
            if (orderResult.rows.length > 0) {
                const orderAmountRupees = orderResult.rows[0].amount / 100;
                const maxCredits = Math.floor((orderAmountRupees * 0.20) / 0.10);
                if (creditsToRedeem > maxCredits) {
                    return res.status(400).json({ error: `Max redeemable is ${maxCredits} credits (20% of order)` });
                }
            }
        }

        // Deduct credits
        await pool.query(
            `INSERT INTO bloom_credit_transactions (user_id, amount, type, order_id, description)
             VALUES ($1, $2, 'redeem', $3, $4)`,
            [user_id, -creditsToRedeem, orderId || null, `Redeemed ${creditsToRedeem} credits for ₹${(creditsToRedeem * 0.10).toFixed(0)} off`]
        );

        const newBalance = await getBloomCreditsBalance(user_id);
        res.json({
            success: true,
            creditsRedeemed: creditsToRedeem,
            discount: parseFloat((creditsToRedeem * 0.10).toFixed(2)),
            newBalance
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
