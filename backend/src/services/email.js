import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: false,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"${config.mail.fromName}" <${config.mail.from}>`,
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(toEmail, resetToken) {
  console.log(`Sending password reset email to: ${toEmail}`);
  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2DA5DE, #E21526); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">FPR Inkotanyi</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your FPR Inkotanyi member account.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #E21526; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reset Token:</strong></p>
            <p style="font-family: monospace; font-size: 18px; color: #E21526; font-weight: bold; margin: 10px 0;">${resetToken}</p>
          </div>
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Copy the reset token above</li>
            <li>Go to the password reset page</li>
            <li>Enter the token and your new password</li>
          </ol>
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Security Note:</strong> This token will expire in 24 hours.
            If you didn't request this reset, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendMail({
      to: toEmail,
      subject: 'Password Reset - FPR Inkotanyi Portal',
      html,
    });
    console.log(`Password reset email sent to: ${toEmail}`);
    console.log(`Reset Token: ${resetToken}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
    throw new Error(`Failed to send password reset email: ${err.message}`);
  }
}

export async function send2FACode(toEmail, code) {
  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2DA5DE, #E21526); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">FPR Inkotanyi</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Two-Factor Authentication</h2>
          <p>Hello,</p>
          <p>Your login requires two-factor authentication. Please use the verification code below:</p>
          <div style="background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #2DA5DE;">
            <p style="margin: 0; color: #6b7280;">Your verification code is:</p>
            <p style="font-family: monospace; font-size: 36px; color: #2DA5DE; font-weight: bold; margin: 15px 0; letter-spacing: 8px;">${code}</p>
          </div>
          <p style="color: #dc2626; font-size: 14px;">
            <strong>Security Alert:</strong> This code expires in 10 minutes.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendMail({
      to: toEmail,
      subject: 'Your 2FA Verification Code - FPR Inkotanyi Portal',
      html,
    });
    console.log(`2FA code sent to: ${toEmail}`);
  } catch (err) {
    console.error('Failed to send 2FA email:', err.message);
    throw new Error('Failed to send 2FA email');
  }
}
