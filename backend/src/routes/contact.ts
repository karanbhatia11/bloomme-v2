import { Router, Request, Response } from 'express';
import { Resend } from 'resend';

const router = Router();

const getResend = (): Resend => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not configured');
    return new Resend(apiKey);
};

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bloomme.co.in';
const SUPPORT_EMAIL = 'info@bloomme.co.in';

router.post('/', async (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    try {
        await getResend().emails.send({
            from: `Bloomme Contact Form <${SENDER_EMAIL}>`,
            to: SUPPORT_EMAIL,
            replyTo: email,
            subject: `Contact Form: ${subject || 'New message from website'}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fffbf5; border-radius: 12px;">
                    <h2 style="color: #775a11; margin-bottom: 4px;">New Contact Form Submission</h2>
                    <p style="color: #888; font-size: 13px; margin-top: 0;">Bloomme Website — Contact Us</p>
                    <hr style="border: none; border-top: 1px solid #e8dcc8; margin: 20px 0;" />
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 100px;">Name</td>
                            <td style="padding: 8px 0; color: #2d2d2d; font-weight: 600;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td>
                            <td style="padding: 8px 0; color: #2d2d2d;"><a href="mailto:${email}" style="color: #775a11;">${email}</a></td>
                        </tr>
                        ${phone ? `<tr>
                            <td style="padding: 8px 0; color: #888; font-size: 13px;">Phone</td>
                            <td style="padding: 8px 0; color: #2d2d2d;">${phone}</td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 8px 0; color: #888; font-size: 13px;">Subject</td>
                            <td style="padding: 8px 0; color: #2d2d2d;">${subject || '—'}</td>
                        </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #e8dcc8; margin: 20px 0;" />
                    <p style="color: #888; font-size: 13px; margin-bottom: 8px;">Message</p>
                    <p style="color: #2d2d2d; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                    <hr style="border: none; border-top: 1px solid #e8dcc8; margin: 20px 0;" />
                    <p style="color: #bbb; font-size: 11px; text-align: center;">Bloomme · bloomme.co.in</p>
                </div>
            `,
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Contact form email failed:', err);
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

export default router;
