import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Lazily build (and cache) the nodemailer SMTP transporter.
 * @returns {import('nodemailer').Transporter}
 */
function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

/**
 * Send a password-reset email containing the reset link.
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Full URL to the admin reset-password page
 * @param {number} expiresInMinutes - Link validity window, for the copy
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(to, resetUrl, expiresInMinutes) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from,
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
}
