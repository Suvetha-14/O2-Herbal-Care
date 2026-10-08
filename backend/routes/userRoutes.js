import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateToken, protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { body, validationResult } from 'express-validator';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

/**
 * Helper to compute HMAC-SHA256 hash of an OTP
 */
const hashOtp = (otp) => {
  const secret = process.env.JWT_SECRET || 'o2_herbal_otp_secret_key';
  return crypto.createHmac('sha256', secret).update(String(otp)).digest('hex');
};

/**
 * Generate cryptographically secure 6-digit OTP
 */
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// @route   POST /api/users/send-otp
// @desc    Generate and store secure OTP for user registration with cooldown & expiry
// @access  Public (Rate limited)
router.post(
  '/send-otp',
  authLimiter,
  [
    body('identifier', 'Valid email is required')
      .isEmail()
      .normalizeEmail()
      .trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { identifier } = req.body;
      const lowerIdentifier = identifier.toLowerCase().trim();

      // Prevent sending registration OTP to an already registered user
      const existingUser = await User.findOne({ email: lowerIdentifier });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in directly.',
        });
      }

      // Check existing OTP record for resend cooldown (60 seconds)
      const existingOtpRecord = await OTP.findOne({ identifier: lowerIdentifier });
      if (existingOtpRecord) {
        const timeElapsed = Date.now() - new Date(existingOtpRecord.createdAt).getTime();
        if (timeElapsed < 60 * 1000) {
          const secondsRemaining = Math.ceil((60 * 1000 - timeElapsed) / 1000);
          return res.status(429).json({
            success: false,
            message: `Please wait ${secondsRemaining} seconds before requesting a new OTP.`,
          });
        }
      }

      const otp = generateSecureOTP();
      const otpHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

      // Update existing record or create new one
      if (existingOtpRecord) {
        existingOtpRecord.otpHash = otpHash;
        existingOtpRecord.expiresAt = expiresAt;
        existingOtpRecord.attempts = 0;
        existingOtpRecord.createdAt = new Date();
        await existingOtpRecord.save();
      } else {
        await OTP.create({
          identifier: lowerIdentifier,
          otpHash,
          expiresAt,
          attempts: 0,
          createdAt: new Date(),
        });
      }

      // Send OTP email (with Ethereal fallback in dev if SMTP not configured)
      try {
        await sendOtpEmail(lowerIdentifier, otp);
      } catch (emailError) {
        // Email send failed — log OTP to console only in non-production environments
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[AUTH] Email send failed for ${lowerIdentifier}. Dev OTP: ${otp}`);
        } else {
          console.error(`[AUTH] Email send failed for ${lowerIdentifier}: ${emailError.message}`);
        }
      }

      // SECURITY: NEVER return OTP in API response
      return res.status(200).json({
        success: true,
        message: 'A 6-digit verification code has been sent to your email address.',
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      return res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
    }
  }
);

// @route   POST /api/users/verify-otp
// @desc    Verify OTP and register new user account
// @access  Public (Rate limited)
router.post(
  '/verify-otp',
  authLimiter,
  [
    body('identifier', 'Valid email is required').isEmail().normalizeEmail().trim(),
    body('otp', 'OTP must be exactly 6 digits').isLength({ min: 6, max: 6 }).isNumeric(),
    body('name', 'Name is required').trim().notEmpty().isLength({ max: 100 }),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { identifier, otp, name, password } = req.body;
      const lowerIdentifier = identifier.toLowerCase().trim();

      const otpRecord = await OTP.findOne({ identifier: lowerIdentifier });
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'No active verification code found for this email. Please request a new code.',
        });
      }

      // Step E: Attempt limit MUST be checked BEFORE comparing OTP
      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Code has been invalidated. Please request a new code.',
        });
      }

      // Step D: Check expiration
      if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
      }

      // Compare hashed OTP using constant-time comparison
      const submittedHash = hashOtp(otp);
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(submittedHash, 'hex'),
        Buffer.from(otpRecord.otpHash, 'hex')
      );

      if (!isMatch) {
        otpRecord.attempts += 1;
        if (otpRecord.attempts >= 5) {
          await OTP.deleteOne({ _id: otpRecord._id });
          return res.status(400).json({
            success: false,
            message: 'Maximum verification attempts reached. Code has been invalidated. Please request a new code.',
          });
        }
        await otpRecord.save();
        const attemptsLeft = 5 - otpRecord.attempts;
        return res.status(400).json({
          success: false,
          message: `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
        });
      }

      // Check if user account was created concurrently
      let user = await User.findOne({ email: lowerIdentifier });
      if (user) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
        });
      }

      // Create new user account with hashed password
      user = new User({
        name: name.trim(),
        email: lowerIdentifier,
        password, // Handled by pre('save') hook in User model
      });
      await user.save();

      // Successfully verified: Delete OTP record immediately
      await OTP.deleteOne({ _id: otpRecord._id });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account created and verified successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      return res.status(500).json({ success: false, message: 'Server error during verification. Please try again.' });
    }
  }
);

// @route   POST /api/users/register
// @desc    Direct registration endpoint with server validation and password hashing
// @access  Public (Rate limited)
router.post(
  '/register',
  authLimiter,
  [
    body('name', 'Name is required').trim().notEmpty().isLength({ max: 100 }),
    body('email', 'Valid email is required').isEmail().normalizeEmail().trim(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      let user = await User.findOne({ email: lowerEmail });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      user = new User({
        name: name.trim(),
        email: lowerEmail,
        password,
      });

      await user.save();

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({ success: false, message: 'Server error registering user' });
    }
  }
);

// @route   POST /api/users/login
// @desc    Authenticate user with email and password
// @access  Public (Rate limited)
router.post(
  '/login',
  authLimiter,
  [
    body('email', 'Valid email is required').isEmail().normalizeEmail().trim(),
    body('password', 'Password is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: lowerEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }
);

// @route   GET /api/users/me
// @desc    Get currently authenticated user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// @route   POST /api/users/forgot-password
// @desc    Generate a secure password reset token and email a reset link
// @access  Public (Rate limited)
router.post(
  '/forgot-password',
  authLimiter,
  [body('email', 'Valid email is required').isEmail().normalizeEmail().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: lowerEmail }).select('+passwordResetTokenHash +passwordResetExpires');

      // Always respond with success to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.',
        });
      }

      // Generate a cryptographically secure reset token (raw token sent in email)
      const rawToken = crypto.randomBytes(32).toString('hex');
      // Store only the SHA-256 hash in the DB (never the raw token)
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(lowerEmail)}`;

      try {
        await sendPasswordResetEmail(lowerEmail, rawToken, resetUrl);
      } catch (emailError) {
        // Email failed — clear the token so the user can try again
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error('[AUTH] Failed to send password reset email:', emailError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// @route   POST /api/users/reset-password
// @desc    Verify reset token and update user password
// @access  Public
router.post(
  '/reset-password',
  [
    body('email', 'Valid email is required').isEmail().normalizeEmail().trim(),
    body('token', 'Reset token is required').notEmpty(),
    body('password', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, token, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      // Hash the submitted token and compare to stored hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        email: lowerEmail,
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: Date.now() },
      }).select('+password +passwordResetTokenHash +passwordResetExpires');

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset link. Please request a new one.',
        });
      }

      // Update password (pre-save hook will hash it)
      user.password = password;
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      const authToken = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully. You are now logged in.',
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ success: false, message: 'Server error during password reset.' });
    }
  }
);

export default router;
