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
export const sendVerificationEmail = async (toEmail: string, verificationToken: string, userName?: string): Promise<boolean> => {
    const verificationLink = `${process.env.FRONTEND_URL || 'https://www.bloomme.co.in'}/verify-email?token=${verificationToken}`;

    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: 'Verify Your Bloomme Email Address',
            html: getVerificationEmailHtml(verificationLink, userName),
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
export const sendPasswordResetEmail = async (toEmail: string, resetToken: string, userName?: string): Promise<boolean> => {
    const resetLink = `${process.env.FRONTEND_URL || 'https://www.bloomme.co.in'}/reset-password?token=${resetToken}`;

    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: 'Reset Your Bloomme Password',
            html: getPasswordResetEmailHtml(resetLink, userName),
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
function getVerificationEmailHtml(verificationLink: string, userName?: string): string {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    const greeting = userName ? `Hello <strong style="color:#1a1c1b;">${userName}</strong>,` : 'Hello,';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your Bloomme email</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Segoe UI',Arial,sans-serif;color:#1a1c1b;">

  <!-- Trust bar -->
  <div style="width:100%;height:4px;background:#775a11;"></div>

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;border-bottom:1px solid #e3e2e0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="40" height="40" style="display:inline-block;vertical-align:middle;border-radius:8px;" />
                    <span style="font-size:22px;font-weight:700;color:#775a11;letter-spacing:-0.5px;vertical-align:middle;margin-left:10px;">Bloomme</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:13px;color:#7f7666;">&#128274; Security Verification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Main -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">

          <!-- Hero text -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#4d4638;font-weight:500;">Security Verification</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#1a1c1b;letter-spacing:-0.5px;line-height:1.2;">Verify your email.</h1>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 0 24px rgba(26,28,27,0.06);overflow:hidden;">
                <tr>
                  <td style="padding:32px 32px 24px;">
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#4d4638;">
                      ${greeting} thank you for signing up for Bloomme. Please verify your email address to get started with your daily flower rituals.
                    </p>

                    <!-- Icon block -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#e9e8e6;border-radius:12px;margin-bottom:28px;">
                      <tr>
                        <td align="center" style="padding:32px;">
                          <div style="font-size:40px;margin-bottom:8px;">✉️</div>
                          <p style="margin:0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7f7666;font-weight:500;">Pending Activation</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:20px;">
                          <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#5c4300,#775a11);color:#ffffff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.03em;box-shadow:0 4px 12px rgba(92,67,0,0.25);">
                            Verify account
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="margin:0;font-size:12px;color:#7f7666;max-width:300px;text-align:center;line-height:1.6;">
                            If you did not create a Bloomme account, please ignore this email or contact support. This link expires in 24 hours.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security meta -->
          <tr>
            <td style="padding:0 32px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#f4f3f1;border-radius:12px;padding:20px 24px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7f7666;font-weight:500;">Timestamp</p>
                    <p style="margin:0;font-size:13px;font-weight:500;color:#1a1c1b;">${timestamp}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f4f3f1;border-radius:12px;padding:20px 24px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7f7666;font-weight:500;">Device Identity</p>
                    <p style="margin:0;font-size:13px;font-weight:500;color:#1a1c1b;">Secure Web Portal</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f1;border-top:1px solid #d1c5b3;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;">
                    <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="32" height="32" style="display:inline-block;vertical-align:middle;border-radius:6px;margin-right:8px;" />
                    <span style="font-size:16px;font-weight:700;color:#775a11;vertical-align:middle;">Bloomme</span>
                    <p style="margin:8px 0 0;font-size:12px;color:#4d4638;opacity:0.6;line-height:1.6;max-width:300px;">
                      &copy; 2026 Bloomme. Crafted for devotion.
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <span style="font-size:32px;opacity:0.3;">&#128272;</span>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(209,197,179,0.3);margin-top:24px;padding-top:20px;">
                <tr>
                  <td>
                    <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#4d4638;opacity:0.6;text-decoration:none;margin-right:24px;">Support</a>
                    <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#4d4638;opacity:0.6;text-decoration:none;margin-right:24px;">Privacy Policy</a>
                    <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#4d4638;opacity:0.6;text-decoration:none;">Security Center</a>
                  </td>
                </tr>
              </table>
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
function getPasswordResetEmailHtml(resetLink: string, userName?: string): string {
    const greeting = userName ? `Hello <strong style="color:#1a1c1b;">${userName}</strong>,` : 'Hello,';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password | Bloomme</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Segoe UI',Arial,sans-serif;color:#1a1c1b;">

  <!-- Trust bar -->
  <div style="width:100%;height:4px;background:#775a11;"></div>

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px 0;">
        <table width="600" cellpadding="0" cellspacing="0">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="48" height="48" style="display:inline-block;vertical-align:middle;border-radius:10px;"/>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;color:#775a11;">&#128274; Vault Secured</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:0 0 32px;">
              <h1 style="margin:0 0 20px;font-size:34px;font-weight:800;letter-spacing:-0.5px;color:#2f1500;line-height:1.2;">Reset your password</h1>
              <p style="margin:0;font-size:17px;line-height:1.7;color:#4d4638;">
                ${greeting} we received a request to reset your password for your Bloomme account. If you're ready to secure your access with a new credential, use the button below.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 0 40px;">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#5c4300,#775a11);color:#ffffff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.05em;box-shadow:0 4px 16px rgba(92,67,0,0.3);">
                Reset password
              </a>
            </td>
          </tr>

          <!-- Security pod -->
          <tr>
            <td style="padding:0 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#e9e8e6;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:32px;">
                    <!-- Expiry -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <span style="font-size:20px;">&#9203;</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;color:#775a11;">Expiration Notice</p>
                          <p style="margin:0;font-size:14px;line-height:1.6;color:#4d4638;">
                            For your protection, this link will expire in <strong>30 minutes</strong>. After this window, you will need to initiate a new request.
                          </p>
                        </td>
                      </tr>
                    </table>
                    <!-- Divider -->
                    <div style="height:1px;background:rgba(209,197,179,0.3);margin-bottom:24px;"></div>
                    <!-- Didn't request -->
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#2f1500;">Didn't request this?</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#4d4638;">
                      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:48px;border-top:1px solid #d1c5b3;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="32" height="32" style="display:inline-block;vertical-align:middle;border-radius:6px;margin-right:8px;"/>
              <span style="font-size:16px;font-weight:700;color:#775a11;vertical-align:middle;">Bloomme</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7f7666;text-decoration:none;margin:0 12px;">Support Center</a>
              <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7f7666;text-decoration:none;margin:0 12px;">Privacy Policy</a>
              <a href="#" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7f7666;text-decoration:none;margin:0 12px;">Security Guarantee</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <table cellpadding="0" cellspacing="0" style="background:#f4f3f1;border-radius:12px;display:inline-table;">
                <tr>
                  <td style="padding:10px 20px;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#775a11;vertical-align:middle;margin-right:8px;"></span>
                    <span style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7f7666;font-weight:500;vertical-align:middle;">Verified Encryption Active</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;font-size:12px;color:#7f7666;">&copy; 2026 Bloomme. Crafted for devotion.</p>
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

// ── Order Confirmation Email ───────────────────────────────────────────────────

export interface OrderConfirmationData {
    bloommeOrderId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    timeSlot?: string;
    razorpayPaymentId: string;
    planName?: string;
    planDeliveries?: number;
    planPrice?: number;
    planFrequency?: string;
    planStartDate?: string;
    planEndDate?: string;
    addons?: { name: string; deliveries: number; price: number; customDates?: string[] }[];
    creditsRedeemed?: number;
    creditDiscount?: number;
    total: number;
    creditsEarned: number;
}

export const sendOrderConfirmationEmail = async (data: OrderConfirmationData): Promise<boolean> => {
    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: data.customerEmail,
            subject: `Order Confirmed — ${data.planName ? data.planName + ' Plan' : 'Your Bloomme Order'} 🌸`,
            html: getOrderConfirmationHtml(data),
            text: getOrderConfirmationText(data),
        });
        console.log(`Order confirmation email sent to ${data.customerEmail}`);
        return true;
    } catch (err) {
        console.error(`Failed to send order confirmation to ${data.customerEmail}:`, err);
        return false;
    }
};

function fmtDate(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getOrderConfirmationHtml(d: OrderConfirmationData): string {
    const freqLabel: Record<string, string> = { daily: 'Daily', alternate: 'Alternate days', weekly: 'Weekly', custom: 'Custom schedule' };
    const greeting = d.customerName ? `Hello <strong style="color:#1a1c1b;">${d.customerName}</strong>,` : 'Hello,';

    const planRow = d.planName ? `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e9e8e6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="44">
                  <div style="width:40px;height:40px;background:#ffdcc3;border-radius:10px;text-align:center;line-height:40px;font-size:18px;">🌸</div>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2f1500;">${d.planName} Plan — ${d.planDeliveries || 0} deliveries</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#7f7666;">
                    ${freqLabel[d.planFrequency || ''] || d.planFrequency || ''}
                    ${d.planStartDate && d.planEndDate ? ` · ${fmtDate(d.planStartDate)} to ${fmtDate(d.planEndDate)}` : ''}
                  </p>
                </td>
                <td align="right" style="white-space:nowrap;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2f1500;">₹${(d.planPrice || 0).toLocaleString('en-IN')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : '';

    const addonRows = (d.addons || []).map(a => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e9e8e6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="44">
                  <div style="width:40px;height:40px;background:#ffdcc3;border-radius:10px;text-align:center;line-height:40px;font-size:18px;">🎁</div>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2f1500;">${a.name} — ${a.deliveries} deliveries</p>
                  ${a.customDates && a.customDates.length > 0
                    ? `<p style="margin:4px 0 0;font-size:12px;color:#7f7666;">${a.customDates.map(fmtDate).join(' · ')}</p>`
                    : ''}
                </td>
                <td align="right" style="white-space:nowrap;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#2f1500;">₹${a.price.toLocaleString('en-IN')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join('');

    const taxLine = `<tr><td style="padding:4px 0 8px;"><p style="margin:0;font-size:10px;color:#7f7666;">Incl. all taxes</p></td></tr>`;

    const creditsDiscountRow = (d.creditsRedeemed && d.creditsRedeemed > 0) ? `
        <tr>
          <td style="padding:8px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><p style="margin:0;font-size:13px;color:#775a11;font-weight:600;">Bloom Credits (${d.creditsRedeemed} credits)</p></td>
                <td align="right"><p style="margin:0;font-size:13px;color:#775a11;font-weight:700;">−₹${(d.creditDiscount || 0).toFixed(0)}</p></td>
              </tr>
            </table>
          </td>
        </tr>` : '';

    const creditsEarnedBanner = d.creditsEarned > 0 ? `
        <tr>
          <td style="padding:0 0 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ffdcc3,#fff1e9);border-radius:12px;border:1px solid rgba(196,160,82,0.3);">
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="36" style="font-size:24px;vertical-align:middle;">⭐</td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;font-size:14px;font-weight:700;color:#2f1500;">You earned ${d.creditsEarned.toLocaleString('en-IN')} Bloom Credits!</p>
                        <p style="margin:4px 0 0;font-size:12px;color:#775a11;">Worth ₹${Math.ceil(d.creditsEarned * 0.10)} · valid for 12 months</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : '';

    const deliveryRows = [
        d.bloommeOrderId    && { icon: '🔖', label: 'Order ID',        value: d.bloommeOrderId },
        d.timeSlot          && { icon: '🕐', label: 'Time Slot',        value: d.timeSlot },
        d.customerAddress   && { icon: '📍', label: 'Address',          value: d.customerAddress },
        d.customerPhone     && { icon: '📱', label: 'Phone',            value: `+91 ${d.customerPhone}` },
        d.customerEmail     && { icon: '📧', label: 'Email',            value: d.customerEmail },
        d.razorpayPaymentId && { icon: '🧾', label: 'Transaction ID',   value: d.razorpayPaymentId },
    ].filter(Boolean).map((row: any) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(209,197,179,0.3);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="28" style="font-size:16px;vertical-align:top;padding-top:2px;">${row.icon}</td>
                <td style="padding-left:10px;">
                  <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7f7666;">${row.label}</p>
                  <p style="margin:3px 0 0;font-size:13px;font-weight:600;color:#2f1500;word-break:break-all;">${row.value}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed — Bloomme</title>
</head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Segoe UI',Arial,sans-serif;color:#1a1c1b;">

  <!-- Trust bar -->
  <div style="width:100%;height:4px;background:linear-gradient(90deg,#775a11,#c4a052);"></div>

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;border-bottom:1px solid #e3e2e0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="40" height="40" style="display:inline-block;vertical-align:middle;border-radius:8px;"/>
                  <span style="font-size:22px;font-weight:700;color:#775a11;letter-spacing:-0.5px;vertical-align:middle;margin-left:10px;">Bloomme</span>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="font-size:13px;color:#7f7666;">✅ Order Confirmed</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>

  <!-- Main -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0">

        <!-- Hero -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🌸</div>
            <h1 style="margin:0 0 8px;font-size:30px;font-weight:800;color:#2f1500;letter-spacing:-0.5px;">Order Confirmed!</h1>
            <p style="margin:0;font-size:16px;font-style:italic;color:#775a11;font-family:Georgia,serif;">Your blooms are on their way.</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#4d4638;">
              ${greeting} thank you for your order. Here's a summary of everything you've booked.
            </p>
          </td>
        </tr>

        <!-- Order Summary Card -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 0 24px rgba(26,28,27,0.06);overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7f7666;">Order Summary</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${planRow}
                    ${addonRows}
                    ${taxLine}
                    ${creditsDiscountRow}
                    <tr>
                      <td style="padding:16px 0 0;border-top:2px solid #e9e8e6;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td><p style="margin:0;font-size:16px;font-weight:700;color:#2f1500;">Total</p></td>
                            <td align="right"><p style="margin:0;font-size:22px;font-weight:800;color:#2f1500;">₹${d.total.toLocaleString('en-IN')}.00</p></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Credits Earned -->
        ${creditsEarnedBanner ? `<tr><td style="padding:0 32px 24px;">${creditsEarnedBanner.trim()}</td></tr>` : ''}

        <!-- Delivery Details -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 0 24px rgba(26,28,27,0.06);overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7f7666;">Delivery Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${deliveryRows}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 48px;text-align:center;">
            <a href="https://www.bloomme.co.in/dashboard" style="display:inline-block;background:linear-gradient(135deg,#5c4300,#775a11);color:#ffffff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.03em;box-shadow:0 4px 16px rgba(92,67,0,0.3);">
              View My Dashboard
            </a>
            <p style="margin:16px 0 0;font-size:12px;color:#7f7666;">Questions? WhatsApp us at +91 9950707995</p>
          </td>
        </tr>

        <!-- Quote -->
        <tr>
          <td style="padding:0 32px 48px;text-align:center;">
            <p style="margin:0;font-size:15px;font-style:italic;color:#c4a052;font-family:Georgia,serif;">&ldquo;Every morning begins with devotion.&rdquo;</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f1;border-top:1px solid #d1c5b3;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;">
                  <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="32" height="32" style="display:inline-block;vertical-align:middle;border-radius:6px;margin-right:8px;"/>
                  <span style="font-size:16px;font-weight:700;color:#775a11;vertical-align:middle;">Bloomme</span>
                  <p style="margin:8px 0 0;font-size:12px;color:#4d4638;line-height:1.6;">&copy; 2026 Bloomme. Crafted for devotion.<br/>Faridabad, Haryana, India</p>
                </td>
                <td align="right" valign="top">
                  <a href="https://www.bloomme.co.in/privacy" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7f7666;text-decoration:none;margin-left:16px;">Privacy</a>
                  <a href="https://www.bloomme.co.in/contact" style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#7f7666;text-decoration:none;margin-left:16px;">Support</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

function getOrderConfirmationText(d: OrderConfirmationData): string {
    const lines = [`Order Confirmed — Bloomme`, ``, `Hello ${d.customerName || ''},`, ``];
    if (d.planName) lines.push(`${d.planName} Plan — ${d.planDeliveries} deliveries: ₹${d.planPrice}`);
    (d.addons || []).forEach(a => lines.push(`${a.name} — ${a.deliveries} deliveries: ₹${a.price}`));
    lines.push(``, `Incl. all taxes`);
    if (d.creditsRedeemed) lines.push(`Bloom Credits (${d.creditsRedeemed}): −₹${d.creditDiscount}`);
    lines.push(`Total: ₹${d.total}`, ``);
    if (d.creditsEarned) lines.push(`You earned ${d.creditsEarned} Bloom Credits (worth ₹${Math.ceil(d.creditsEarned * 0.10)})`, ``);
    if (d.timeSlot) lines.push(`Time Slot: ${d.timeSlot}`);
    if (d.customerAddress) lines.push(`Address: ${d.customerAddress}`);
    if (d.customerPhone) lines.push(`Phone: +91 ${d.customerPhone}`);
    lines.push(`Transaction ID: ${d.razorpayPaymentId}`);
    lines.push(``, `View your dashboard: https://www.bloomme.co.in/dashboard`);
    lines.push(`Questions? WhatsApp: +91 9950707995`);
    lines.push(``, `---`, `Bloomme Flowers | Faridabad, Haryana, India`);
    return lines.join('\n');
}

// ── Admin Notification Emails ──────────────────────────────────────────────────

export interface AdminOrderNotificationData extends OrderConfirmationData {
    orderId: number;
    paidAt?: string;
    isNewUser: boolean;
    planScheduleDates?: string[];
    addonSchedules?: { name: string; dates: string[] }[];
}

export const sendAdminNewOrderEmail = async (data: AdminOrderNotificationData): Promise<boolean> => {
    const raw = process.env.ADMIN_NOTIFICATION_EMAIL || '';
    const adminEmails = raw.split(',').map(e => e.trim()).filter(Boolean);
    if (adminEmails.length === 0) return false;
    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: adminEmails,
            subject: `New Order Received 🎉 — ${data.bloommeOrderId || ''} | ${data.customerName}`,
            html: getAdminNewOrderHtml(data),
            text: getAdminNewOrderText(data),
        });
        console.log(`Admin new-order notification sent for ${data.bloommeOrderId}`);
        return true;
    } catch (err) {
        console.error('Failed to send admin new-order notification:', err);
        return false;
    }
};

export interface AdminCancellationData {
    bloommeOrderId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    cancelledAt: string;
    type: 'subscription' | 'addon_order';
    planName?: string;
    addonNames?: string[];
    total?: number;
}

export const sendAdminCancellationEmail = async (data: AdminCancellationData): Promise<boolean> => {
    const raw = process.env.ADMIN_NOTIFICATION_EMAIL || '';
    const adminEmails = raw.split(',').map(e => e.trim()).filter(Boolean);
    if (adminEmails.length === 0) return false;
    try {
        await getResend().emails.send({
            from: `Bloomme <${SENDER_EMAIL}>`,
            to: adminEmails,
            subject: `Order Cancelled ⚠️ — ${data.bloommeOrderId || ''} | ${data.customerName}`,
            html: getAdminCancellationHtml(data),
            text: getAdminCancellationText(data),
        });
        console.log(`Admin cancellation notification sent for ${data.bloommeOrderId}`);
        return true;
    } catch (err) {
        console.error('Failed to send admin cancellation notification:', err);
        return false;
    }
};

function fmtDateShort(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fmtTs(iso: string): string {
    try {
        return new Date(iso).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
        });
    } catch { return iso; }
}

function infoRow(icon: string, label: string, value: string): string {
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ece4;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="28" style="font-size:15px;vertical-align:top;padding-top:2px;">${icon}</td>
            <td style="padding-left:10px;">
                <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7f7666;">${label}</p>
                <p style="margin:3px 0 0;font-size:13px;font-weight:600;color:#2f1500;word-break:break-all;">${value}</p>
            </td>
        </tr></table>
    </td></tr>`;
}

function sectionCard(title: string, innerHtml: string): string {
    return `<tr><td style="padding:0 32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;box-shadow:0 0 20px rgba(26,28,27,0.05);overflow:hidden;">
            <tr><td style="padding:20px 24px 4px;">
                <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7f7666;">${title}</p>
                <table width="100%" cellpadding="0" cellspacing="0">${innerHtml}</table>
            </td></tr>
        </table>
    </td></tr>`;
}

function adminEmailWrapper(bodyRows: string): string {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#faf9f7;font-family:'Segoe UI',Arial,sans-serif;color:#1a1c1b;">
<div style="width:100%;height:4px;background:linear-gradient(90deg,#775a11,#c4a052);"></div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;border-bottom:1px solid #e3e2e0;">
    <tr><td align="center"><table width="600" cellpadding="0" cellspacing="0"><tr><td style="padding:16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
                <img src="https://www.bloomme.co.in/images/backgroundlesslogo.png" alt="Bloomme" width="36" height="36" style="display:inline-block;vertical-align:middle;border-radius:7px;"/>
                <span style="font-size:20px;font-weight:700;color:#775a11;vertical-align:middle;margin-left:8px;">Bloomme</span>
                <span style="font-size:11px;color:#7f7666;vertical-align:middle;margin-left:8px;">· Admin Notification</span>
            </td>
        </tr></table>
    </td></tr></table></td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px 48px;">
    <tr><td align="center"><table width="600" cellpadding="0" cellspacing="0">
        ${bodyRows}
        <tr><td style="padding:8px 32px 24px;text-align:center;">
            <a href="${process.env.FRONTEND_URL || 'https://www.bloomme.co.in'}/admin" style="display:inline-block;background:linear-gradient(135deg,#5c4300,#775a11);color:#fff;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.03em;box-shadow:0 4px 12px rgba(92,67,0,0.25);">
                👉 Open Admin Portal
            </a>
            <p style="margin:10px 0 0;font-size:12px;color:#7f7666;">View full details, delivery schedule, and take action.</p>
        </td></tr>
    </table></td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f1;border-top:1px solid #d1c5b3;">
    <tr><td align="center"><table width="600" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#7f7666;">&copy; 2026 Bloomme. Internal notification — do not share.</p>
    </td></tr></table></td></tr>
</table>
</body></html>`;
}

function getAdminNewOrderHtml(d: AdminOrderNotificationData): string {
    const paidAtStr = d.paidAt ? fmtTs(d.paidAt) : 'Just now';

    const newUserBanner = d.isNewUser ? `<tr><td style="padding:0 32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#d4edda,#f0fff4);border-radius:12px;border:1px solid #b2dfdb;">
            <tr><td style="padding:14px 20px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1b5e20;">🆕 Brand new customer — first order ever!</p>
                <p style="margin:4px 0 0;font-size:12px;color:#2e7d32;">Make sure their first delivery is perfect.</p>
            </td></tr>
        </table>
    </td></tr>` : '';

    const heroRow = `<tr><td style="padding:32px 32px 8px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#775a11;">Hey Admins!</p>
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#2f1500;letter-spacing:-0.5px;">Congratulations! A new order just came in.</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#4d4638;line-height:1.6;">A customer has successfully placed and paid for their order. Here are all the details:</p>
        <div style="display:inline-block;background:#e8f5e9;border-radius:8px;padding:8px 20px;margin-bottom:4px;">
            <span style="font-size:14px;font-weight:700;color:#1b5e20;">✅ PAID &nbsp;·&nbsp; ${d.bloommeOrderId || ''} &nbsp;·&nbsp; ${paidAtStr}</span>
        </div>
    </td></tr>`;

    const customerRows = [
        infoRow('👤', 'Name', d.customerName || '—'),
        infoRow('📧', 'Email', d.customerEmail || '—'),
        d.customerPhone ? infoRow('📱', 'Phone', d.customerPhone) : '',
        d.timeSlot ? infoRow('🕐', 'Time Slot', d.timeSlot) : '',
        d.customerAddress ? infoRow('📍', 'Address', d.customerAddress) : '',
    ].join('');

    const planRow = d.planName ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="36"><div style="width:32px;height:32px;background:#ffdcc3;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🌸</div></td>
            <td style="padding-left:10px;"><p style="margin:0;font-size:13px;font-weight:700;color:#2f1500;">${d.planName} — ${d.planDeliveries || 0} deliveries</p></td>
            <td align="right"><p style="margin:0;font-size:13px;font-weight:700;color:#2f1500;">₹${(d.planPrice || 0).toLocaleString('en-IN')}</p></td>
        </tr></table>
    </td></tr>` : '';

    const addonRows = (d.addons || []).map(a => `<tr><td style="padding:10px 0;border-bottom:1px solid #f0ece4;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="36"><div style="width:32px;height:32px;background:#e8f5e9;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">🎁</div></td>
            <td style="padding-left:10px;"><p style="margin:0;font-size:13px;font-weight:700;color:#2f1500;">${a.name} — ${a.deliveries} deliveries</p></td>
            <td align="right"><p style="margin:0;font-size:13px;font-weight:700;color:#2f1500;">₹${a.price.toLocaleString('en-IN')}</p></td>
        </tr></table>
    </td></tr>`).join('');

    const totalRow = `<tr><td style="padding:12px 0 6px;"><table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><p style="margin:0;font-size:15px;font-weight:700;color:#2f1500;">Total Paid</p></td>
        <td align="right"><p style="margin:0;font-size:20px;font-weight:800;color:#2f1500;">₹${d.total.toLocaleString('en-IN')}</p></td>
    </tr></table></td></tr>`;

    const paymentRows = [
        infoRow('💳', 'Total Paid', `₹${d.total.toLocaleString('en-IN')}`),
        infoRow('🧾', 'Transaction ID', d.razorpayPaymentId || '—'),
        infoRow('🕐', 'Paid At', paidAtStr),
    ].join('');

    // Delivery schedule
    let scheduleHtml = '';
    if (d.planScheduleDates && d.planScheduleDates.length > 0) {
        const dates = d.planScheduleDates.map(fmtDateShort).join(' · ');
        scheduleHtml += `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ece4;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#775a11;">${d.planName || 'Plan'} (${d.planScheduleDates.length} deliveries)</p>
            <p style="margin:0;font-size:12px;color:#4d4638;line-height:1.6;">${dates}</p>
        </td></tr>`;
    }
    (d.addonSchedules || []).forEach(ao => {
        if (ao.dates.length > 0) {
            const dates = ao.dates.map(fmtDateShort).join(' · ');
            scheduleHtml += `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ece4;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#775a11;">${ao.name} (${ao.dates.length} deliveries)</p>
                <p style="margin:0;font-size:12px;color:#4d4638;line-height:1.6;">${dates}</p>
            </td></tr>`;
        }
    });

    const scheduleSection = scheduleHtml ? sectionCard('Delivery Schedule', scheduleHtml) : '';

    return adminEmailWrapper(`
        ${heroRow}
        ${newUserBanner}
        ${sectionCard('Customer', customerRows)}
        ${sectionCard('Items', planRow + addonRows + totalRow)}
        ${sectionCard('Payment', paymentRows)}
        ${scheduleSection}
    `);
}

function getAdminNewOrderText(d: AdminOrderNotificationData): string {
    const lines = [
        `Hey Admins! 🎉 Congratulations — a new order just came in.`,
        ``,
        `A customer has successfully placed and paid for their order.`,
        d.isNewUser ? `🆕 BRAND NEW CUSTOMER — their first order ever!` : ``,
        ``,
        `✅ PAID | ${d.bloommeOrderId || ''} | ${d.paidAt ? fmtTs(d.paidAt) : 'Just now'}`,
        ``,
        `CUSTOMER`,
        `Name: ${d.customerName}`,
        `Email: ${d.customerEmail}`,
        d.customerPhone ? `Phone: ${d.customerPhone}` : '',
        d.timeSlot ? `Time Slot: ${d.timeSlot}` : '',
        d.customerAddress ? `Address: ${d.customerAddress}` : '',
        ``,
        `ITEMS`,
    ];
    if (d.planName) lines.push(`${d.planName} Plan — ${d.planDeliveries} deliveries: ₹${d.planPrice}`);
    (d.addons || []).forEach(a => lines.push(`${a.name} — ${a.deliveries} deliveries: ₹${a.price}`));
    lines.push(`Total: ₹${d.total}`);
    lines.push(``, `Transaction ID: ${d.razorpayPaymentId}`);
    if (d.planScheduleDates?.length) {
        lines.push(``, `DELIVERY SCHEDULE`, `${d.planName}: ${d.planScheduleDates.map(fmtDateShort).join(', ')}`);
    }
    (d.addonSchedules || []).forEach(ao => {
        if (ao.dates.length) lines.push(`${ao.name}: ${ao.dates.map(fmtDateShort).join(', ')}`);
    });
    lines.push(``, `---`, `Bloomme Admin Notification`);
    return lines.filter(l => l !== undefined).join('\n');
}

function getAdminCancellationHtml(d: AdminCancellationData): string {
    const cancelledAtStr = fmtTs(d.cancelledAt);
    const typeLabel = d.type === 'subscription' ? 'Subscription' : 'Add-On Order';

    const heroRow = `<tr><td style="padding:32px 32px 8px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#b71c1c;">Hey Admins!</p>
        <h1 style="margin:0 0 10px;font-size:28px;font-weight:800;color:#b71c1c;letter-spacing:-0.5px;">An order has been cancelled.</h1>
        <p style="margin:0 0 16px;font-size:15px;color:#4d4638;line-height:1.6;">A customer has cancelled their ${typeLabel.toLowerCase()}. Please review immediately and check if any action is needed.</p>
        <div style="display:inline-block;background:#ffebee;border-radius:8px;padding:8px 20px;margin-bottom:4px;">
            <span style="font-size:14px;font-weight:700;color:#b71c1c;">❌ CANCELLED &nbsp;·&nbsp; ${d.bloommeOrderId || ''} &nbsp;·&nbsp; ${cancelledAtStr}</span>
        </div>
    </td></tr>`;

    const customerRows = [
        infoRow('👤', 'Name', d.customerName || '—'),
        infoRow('📧', 'Email', d.customerEmail || '—'),
        d.customerPhone ? infoRow('📱', 'Phone', d.customerPhone) : '',
    ].join('');

    let detailRows = infoRow('📋', 'Type', typeLabel);
    if (d.planName) detailRows += infoRow('🌸', 'Plan', d.planName);
    if (d.addonNames?.length) detailRows += infoRow('🎁', 'Add-Ons', d.addonNames.join(', '));
    if (d.total) detailRows += infoRow('💳', 'Order Value', `₹${d.total.toLocaleString('en-IN')}`);
    detailRows += infoRow('🕐', 'Cancelled At', cancelledAtStr);

    return adminEmailWrapper(`${heroRow}${sectionCard('Customer', customerRows)}${sectionCard('Cancellation Details', detailRows)}`);
}

function getAdminCancellationText(d: AdminCancellationData): string {
    const lines = [
        `Hey Admins! ⚠️ An order has been cancelled.`,
        ``,
        `A customer has cancelled their ${d.type === 'subscription' ? 'subscription' : 'add-on order'}. Please review immediately.`,
        ``,
        `❌ CANCELLED | ${d.bloommeOrderId || ''} | ${fmtTs(d.cancelledAt)}`,
        `Type: ${d.type === 'subscription' ? 'Subscription' : 'Add-On Order'}`,
        ``,
        `CUSTOMER`,
        `Name: ${d.customerName}`,
        `Email: ${d.customerEmail}`,
        d.customerPhone ? `Phone: ${d.customerPhone}` : '',
        ``,
        `DETAILS`,
        d.planName ? `Plan: ${d.planName}` : '',
        d.addonNames?.length ? `Add-Ons: ${d.addonNames.join(', ')}` : '',
        d.total ? `Order Value: ₹${d.total}` : '',
        `Cancelled At: ${fmtTs(d.cancelledAt)}`,
        ``, `---`, `Bloomme Admin Notification`,
    ];
    return lines.filter(l => l !== undefined && l !== '').join('\n');
}
