import { Resend } from 'resend';

let resend = null;

/**
 * Lazily build (and cache) the Resend client.
 * @returns {Resend}
 */
function getClient() {
  if (resend) return resend;
  resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

/**
 * Send a password-reset email containing the reset link.
 * Uses the Resend HTTP API (not SMTP) so it works on hosts that block
 * outbound SMTP ports, e.g. Render's free tier.
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Full URL to the admin reset-password page
 * @param {number} expiresInMinutes - Link validity window, for the copy
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(to, resetUrl, expiresInMinutes) {
  const { error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your DGDF Admin password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <img src="https://dgdelightfound.org/_next/image?url=%2Flogo.png&w=1080&q=75" alt="dgdf-logo" style="width: 200px;"/>
        <h2 style="color: #1a1a2e;">Reset your password</h2>
        <p>We received a request to reset the password for your DGDF Admin account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
            Reset Password
          </a>
        </p>
        <p>This link expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #888; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send email via Resend');
  }
}
