import { Router, Request, Response } from 'express';
import pool from '../db';
import { sendWelcomeEmail } from '../utils/email';

const router = Router();

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter and send a welcome email via SES.
 */
router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: 'Please provide a valid email address.' });
        return;
    }

    try {
        // Check if already subscribed
        const existing = await pool.query(
            'SELECT id, status FROM newsletter_subscribers WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (existing.rows.length > 0) {
            const subscriber = existing.rows[0];
            if (subscriber.status === 'active') {
                res.status(200).json({ message: 'You are already subscribed!' });
                return;
            }
            // Re-activate if previously unsubscribed
            await pool.query(
                'UPDATE newsletter_subscribers SET status = $1, subscribed_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['active', subscriber.id]
            );
        } else {
            // Insert new subscriber
            await pool.query(
                'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
                [email.toLowerCase().trim()]
            );
        }

        // Send welcome email via SES (non-blocking — don't fail the request if email fails)
        sendWelcomeEmail(email.toLowerCase().trim()).then((sent) => {
            if (sent) {
                pool.query(
                    'UPDATE newsletter_subscribers SET welcome_email_sent = TRUE WHERE email = $1',
                    [email.toLowerCase().trim()]
                );
            }
        });

        res.status(201).json({ message: 'Successfully subscribed! Check your inbox for a welcome email.' });
    } catch (err: any) {
        console.error('Newsletter subscribe error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe an email from the newsletter.
 */
router.post('/unsubscribe', async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: 'Email is required.' });
        return;
    }

    try {
        await pool.query(
            'UPDATE newsletter_subscribers SET status = $1 WHERE email = $2',
            ['unsubscribed', email.toLowerCase().trim()]
        );
        res.json({ message: 'You have been unsubscribed.' });
    } catch (err) {
        console.error('Newsletter unsubscribe error:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

export default router;
