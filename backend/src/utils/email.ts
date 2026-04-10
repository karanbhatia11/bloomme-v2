import { Resend } from 'resend';

// Lazy initialize Resend to ensure env vars are loaded
let resend: Resend | null = null;

const getResend = (): Resend => {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured in environment variables');
        }
        resend = new Resend(apiKey);
    }
    return resend;
};

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bloomme.co.in';

/**
 * Send a welcome email to a new newsletter subscriber.
 */
export const sendWelcomeEmail = async (toEmail: string): Promise<boolean> => {
    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: 'Welcome to Bloomme — Faith. Freshness. On Time.',
            html: getWelcomeEmailHtml(toEmail),
            text: getWelcomeEmailText(),
        });
        console.log(`Welcome email sent to ${toEmail}`);
        return true;
    } catch (err) {
        console.error(`Failed to send welcome email to ${toEmail}:`, err);
        return false;
    }
};

/**
 * Send email verification email to new users.
 */
export const sendVerificationEmail = async (toEmail: string, verificationToken: string): Promise<boolean> => {
    const verificationLink = `${process.env.FRONTEND_URL || 'https://www.bloomme.co.in'}/verify-email?token=${verificationToken}`;

    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: 'Verify Your Bloomme Email Address',
            html: getVerificationEmailHtml(verificationLink),
            text: getVerificationEmailText(verificationLink),
        });
        console.log(`Verification email sent to ${toEmail}`);
        return true;
    } catch (err) {
        console.error(`Failed to send verification email to ${toEmail}:`, err);
        return false;
    }
};

/**
 * Send password reset email.
 */
export const sendPasswordResetEmail = async (toEmail: string, resetToken: string): Promise<boolean> => {
    const resetLink = `${process.env.FRONTEND_URL || 'https://www.bloomme.co.in'}/reset-password?token=${resetToken}`;

    try {
        await resend.emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: 'Reset Your Bloomme Password',
            html: getPasswordResetEmailHtml(resetLink),
            text: getPasswordResetEmailText(resetLink),
        });
        console.log(`Password reset email sent to ${toEmail}`);
        return true;
    } catch (err) {
        console.error(`Failed to send password reset email to ${toEmail}:`, err);
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

/**
 * HTML template for email verification.
 */
function getVerificationEmailHtml(verificationLink: string): string {
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
                    <tr>
                        <td style="background:linear-gradient(135deg,#4F7942,#3d5e33);padding:40px 30px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Verify Your Email</h1>
                            <p style="color:#D4AF37;font-size:14px;margin:0;">Complete your Bloomme account setup</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 30px;">
                            <p style="font-size:16px;line-height:1.8;color:#2C3E50;margin:0 0 20px;">
                                Welcome to Bloomme!
                            </p>
                            <p style="font-size:15px;color:#2C3E50;margin:0 0 30px;line-height:1.6;">
                                Please verify your email address to activate your account and start your journey with us.
                            </p>
                            <div style="text-align:center;margin:30px 0;">
                                <a href="${verificationLink}" style="display:inline-block;background:#4F7942;color:#ffffff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
                                    Verify Email
                                </a>
                            </div>
                            <p style="font-size:13px;color:#888;margin:20px 0 0;line-height:1.6;">
                                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#2C3E50;padding:24px 30px;text-align:center;">
                            <p style="color:#bdc3c7;font-size:13px;margin:0 0 8px;">
                                Bloomme Flowers &middot; Faridabad, Haryana, India
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
 * Plain text for email verification.
 */
function getVerificationEmailText(verificationLink: string): string {
    return `Welcome to Bloomme!

Please verify your email address to activate your account and start your journey with us.

Verify Email: ${verificationLink}

This link will expire in 24 hours. If you didn't create this account, please ignore this email.

---
Bloomme Flowers | Faridabad, Haryana, India`;
}

/**
 * HTML template for password reset.
 */
function getPasswordResetEmailHtml(resetLink: string): string {
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
                    <tr>
                        <td style="background:linear-gradient(135deg,#4F7942,#3d5e33);padding:40px 30px;text-align:center;">
                            <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Reset Your Password</h1>
                            <p style="color:#D4AF37;font-size:14px;margin:0;">Secure your Bloomme account</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 30px;">
                            <p style="font-size:16px;line-height:1.8;color:#2C3E50;margin:0 0 20px;">
                                We received a request to reset your password.
                            </p>
                            <p style="font-size:15px;color:#2C3E50;margin:0 0 30px;line-height:1.6;">
                                Click the button below to create a new password. This link will expire in 30 minutes.
                            </p>
                            <div style="text-align:center;margin:30px 0;">
                                <a href="${resetLink}" style="display:inline-block;background:#4F7942;color:#ffffff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="font-size:13px;color:#888;margin:20px 0 0;line-height:1.6;">
                                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#2C3E50;padding:24px 30px;text-align:center;">
                            <p style="color:#bdc3c7;font-size:13px;margin:0 0 8px;">
                                Bloomme Flowers &middot; Faridabad, Haryana, India
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
 * Plain text for password reset.
 */
function getPasswordResetEmailText(resetLink: string): string {
    return `Reset Your Password

We received a request to reset your password. Click the link below to create a new password. This link will expire in 30 minutes.

Reset Password: ${resetLink}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

---
Bloomme Flowers | Faridabad, Haryana, India`;
}
