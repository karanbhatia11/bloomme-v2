import express from 'express';
import pool from '../db';

const router = express.Router();

// POST /api/promo/validate
// Validate promo code and return discount details
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Promo code is required' });
        }

        // Query promo codes from app_config
        const configResult = await pool.query(
            'SELECT value FROM app_config WHERE key = $1',
            ['promo_codes']
        );

        if (configResult.rows.length === 0) {
            return res.json({
                valid: false,
                message: 'Invalid promo code'
            });
        }

        const promoCodes = configResult.rows[0].value;

        // Check if code exists and is valid
        const promoData = promoCodes[code];
        if (!promoData || !promoData.active) {
            return res.json({
                valid: false,
                message: 'Invalid or expired promo code'
            });
        }

        // Check if code has usage limit
        if (promoData.maxUses && promoData.uses >= promoData.maxUses) {
            return res.json({
                valid: false,
                message: 'Promo code has reached maximum uses'
            });
        }

        // Return valid promo details
        res.json({
            valid: true,
            discountPercent: promoData.discountPercent || null,
            discountAmount: promoData.discountAmount || null,
            message: `Promo code applied! Get ${promoData.discountPercent || promoData.discountAmount}% off`
        });
    } catch (err: any) {
        console.error('Validate promo error:', err);
        res.status(400).json({ error: err.message });
    }
});

export default router;
