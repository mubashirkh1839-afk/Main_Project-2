/**
 * ============================================================
 * 🔐 AUTH ROUTES  —  /api/auth
 * ============================================================
 * Handles user registration, OTP send/verify, and JWT issuance.
 *
 * Routes:
 *   POST /api/auth/send-otp     → Generates & stores a 4-digit OTP for a phone number
 *   POST /api/auth/verify-otp   → Validates OTP, creates/retrieves user, returns JWT
 *   GET  /api/auth/me           → Returns authenticated user profile (requires token)
 * ============================================================
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { User, otpStore, generateId, generateOtp } from '../db.js';

const router = express.Router();
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// ─── MIDDLEWARE: Verify JWT Token ─────────────────────────────────────────────
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, phone, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Generates a 4-digit OTP and sends it through Twilio when configured.
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  // Store OTP against phone number
  otpStore.set(phone, { otp, expiresAt });

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `Your FoodRescue OTP is ${otp}. It expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}`,
      });
      console.log(`📱 [OTP SENT VIA TWILIO] Phone: ${phone}`);
    } catch (error) {
      otpStore.delete(phone);
      console.error('Twilio OTP delivery failed:', error.message);
      return res.status(500).json({ success: false, message: 'Unable to send OTP right now.' });
    }
  } else {
    console.log(`📱 [DEV OTP] Phone: ${phone} → OTP: ${otp} (expires in 5 mins)`);
  }

  return res.json({
    success: true,
    message: `OTP sent to ${phone}`,
    // Only return OTP in development mode (remove in production)
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Validates the OTP, creates/retrieves user, returns JWT
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, role, orgName, city } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
  }

  const record = otpStore.get(phone);

  // OTP not found or expired
  if (!record) {
    return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
  }

  // OTP is valid — clean up
  otpStore.delete(phone);

  // Find existing user or create new one
  let user = await User.findOne({ phone }).lean();
  if (!user) {
    user = {
      id: generateId('u'),
      name: name || 'Anonymous User',
      phone,
      role: role || 'Volunteer',
      orgName: orgName || null,
      city: city || 'Kanpur',
      trustScore: 5.0,
      totalMealsRescued: 0,
      totalDeliveries: 0,
      createdAt: new Date().toISOString(),
    };
    await User.create(user);
    console.log(`✅ [NEW USER] Registered: ${user.name} as ${user.role}`);
  }

  // Issue JWT token (valid for 7 days)
  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      orgName: user.orgName,
      city: user.city,
      trustScore: user.trustScore,
    },
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns authenticated user's full profile
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).lean();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, user });
});

export default router;

