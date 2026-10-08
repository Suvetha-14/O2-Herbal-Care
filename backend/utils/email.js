/**
 * Email utility using nodemailer.
 * Supports Gmail (App Password) and auto-creates Ethereal test credentials
 * when SMTP_USER is not configured (development fallback).
 */

import nodemailer from 'nodemailer';

/**
 * Create a nodemailer transporter.
 * If SMTP_USER is not set, falls back to Ethereal (fake SMTP for dev).
 */
const createTransporter = async () => {
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  if (process.env.SMTP_USER && smtpPass) {
    // Production: use configured SMTP (Gmail, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPass,
      },
    });
  }

  // Development fallback: Ethereal auto-test account
  const testAccount = await nodemailer.createTestAccount();
  console.log(`[EMAIL] No SMTP config found. Using Ethereal test account: ${testAccount.user}`);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send a 6-digit OTP verification email.
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"O2 Herbal Care" <${process.env.SMTP_USER || 'noreply@o2herbal.com'}>`,
      to,
      subject: 'Your O2 Herbal Care Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #2d6a4f; font-size: 24px; margin: 0;">O2 Herbal Care</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Natural • Pure • Effective</p>
          </div>
          <h3 style="color: #111827; font-size: 18px; margin-bottom: 8px;">Email Verification Code</h3>
          <p style="color: #374151; font-size: 14px; margin-bottom: 24px;">
            Use the code below to verify your email address and complete your account registration.
          </p>
          <div style="text-align: center; background: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #15803d; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
            ⏱ This code expires in <strong>5 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
            If you didn't request this code, please ignore this email.
          </p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} O2 Herbal Care. All rights reserved.
          </p>
        </div>
      `,
      text: `Your O2 Herbal Care verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);

    // In dev (Ethereal), log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL] OTP email preview (Ethereal): ${previewUrl}`);
    } else {
      console.log(`[EMAIL] OTP email sent to ${to} (Message ID: ${info.messageId})`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('[EMAIL] Failed to send OTP email:', error.message);
    throw error;
  }
};

/**
 * Send a password reset email with a reset link.
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Secure reset token
 * @param {string} resetUrl - Full reset URL (e.g. http://localhost:5173/reset-password?token=...)
 */
export const sendPasswordResetEmail = async (to, resetToken, resetUrl) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"O2 Herbal Care" <${process.env.SMTP_USER || 'noreply@o2herbal.com'}>`,
      to,
      subject: 'Password Reset Request — O2 Herbal Care',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #2d6a4f; font-size: 24px; margin: 0;">O2 Herbal Care</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Natural • Pure • Effective</p>
          </div>
          <h3 style="color: #111827; font-size: 18px; margin-bottom: 8px;">Password Reset Request</h3>
          <p style="color: #374151; font-size: 14px; margin-bottom: 24px;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetUrl}" style="display: inline-block; background: #15803d; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
            ⏱ This link expires in <strong>15 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
            If the button doesn't work, copy and paste this URL into your browser:
          </p>
          <p style="color: #2d6a4f; font-size: 12px; word-break: break-all; margin-bottom: 16px;">
            ${resetUrl}
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 0;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} O2 Herbal Care. All rights reserved.
          </p>
        </div>
      `,
      text: `Password Reset Request\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[EMAIL] Password reset email preview (Ethereal): ${previewUrl}`);
    } else {
      console.log(`[EMAIL] Password reset email sent to ${to}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('[EMAIL] Failed to send password reset email:', error.message);
    throw error;
  }
};
