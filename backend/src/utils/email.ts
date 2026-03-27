import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    // Uses EC2 instance role credentials automatically when on EC2.
    // For local dev, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
    ...(process.env.AWS_ACCESS_KEY_ID && {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    }),
});

const SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'noreply@bloomme.co.in';

/**
 * Send a welcome email to a new newsletter subscriber.
 */
export const sendWelcomeEmail = async (toEmail: string): Promise<boolean> => {
    const params = {
        Source: `Bloomme <${SENDER_EMAIL}>`,
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: 'Welcome to Bloomme — Faith. Freshness. On Time.',
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: getWelcomeEmailHtml(toEmail),
                    Charset: 'UTF-8',
                },
                Text: {
                    Data: getWelcomeEmailText(),
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        await ses.send(new SendEmailCommand(params));
        console.log(`Welcome email sent to ${toEmail}`);
        return true;
    } catch (err) {
        console.error(`Failed to send welcome email to ${toEmail}:`, err);
        return false;
    }
};

/**
 * HTML template for the welcome email.
 */
function getWelcomeEmailHtml(email: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9f9f4;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f4;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#4F7942,#3d5e33);padding:40px 30px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Welcome to Bloomme</h1>
                            <p style="color:#D4AF37;font-size:14px;letter-spacing:2px;margin:0;text-transform:uppercase;font-weight:700;">Faith. Freshness. On Time.</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px 30px;">
                            <p style="font-size:16px;line-height:1.8;color:#2C3E50;margin:0 0 20px;">
                                Namaste! Thank you for subscribing to the Bloomme newsletter.
                            </p>
                            <p style="font-size:16px;line-height:1.8;color:#2C3E50;margin:0 0 20px;">
                                You'll now receive tips for a mindful morning routine, updates on seasonal flowers,
                                festival specials, and exclusive offers delivered straight to your inbox.
                            </p>

                            <div style="background:#FDFBF0;border-radius:12px;padding:24px;margin:25px 0;border-left:4px solid #D4AF37;">
                                <p style="font-size:15px;color:#2C3E50;margin:0;font-weight:600;">
                                    Start your day with devotion
                                </p>
                                <p style="font-size:14px;color:#666;margin:8px 0 0;">
                                    Fresh puja flowers & essentials delivered to your doorstep by 6 AM every morning.
                                    Plans start at just &#8377;1499/month.
                                </p>
                            </div>

                            <div style="text-align:center;margin:30px 0;">
                                <a href="https://www.bloomme.co.in" style="display:inline-block;background:#4F7942;color:#ffffff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
                                    Explore Subscriptions
                                </a>
                            </div>

                            <p style="font-size:14px;color:#888;line-height:1.6;margin:0;">
                                If you didn't subscribe to this newsletter, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#2C3E50;padding:24px 30px;text-align:center;">
                            <p style="color:#bdc3c7;font-size:13px;margin:0 0 8px;">
                                Bloomme Flowers &middot; Faridabad, Haryana, India
                            </p>
                            <p style="color:#7f8c8d;font-size:12px;margin:0;">
                                &copy; 2026 Bloomme. All Rights Reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Plain text fallback for the welcome email.
 */
function getWelcomeEmailText(): string {
    return `Welcome to Bloomme — Faith. Freshness. On Time.

Namaste! Thank you for subscribing to the Bloomme newsletter.

You'll now receive tips for a mindful morning routine, updates on seasonal flowers, festival specials, and exclusive offers delivered straight to your inbox.

Start your day with devotion — fresh puja flowers & essentials delivered to your doorstep by 6 AM every morning. Plans start at just Rs.1499/month.

Visit us: https://www.bloomme.co.in

---
Bloomme Flowers | Faridabad, Haryana, India
(c) 2026 Bloomme. All Rights Reserved.`;
}
