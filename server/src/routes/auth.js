import express from 'express';
import jwt from 'jsonwebtoken';
import { dbService, otpStore, generateId, generateOtp } from '../db.js';

const router = express.Router();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'food_rescue_secret');
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) return res.status(400).json({ success: false, message: 'Valid phone is required.' });

  const cleanPhone = phone.replace(/\D/g, '');
  const otp = generateOtp();
  otpStore[cleanPhone] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  console.log(`📱 [OTP] Phone: ${cleanPhone} → OTP: ${otp}`);

  return res.json({ success: true, message: `OTP sent to ${cleanPhone}`, devOtp: otp });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, role, orgName, city } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });

  const cleanPhone = phone.replace(/\D/g, '');
  const record = otpStore[cleanPhone];
  if (!record || Date.now() > record.expiresAt || record.otp !== String(otp)) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
  }

  delete otpStore[cleanPhone];

  let user = await dbService.findUserByPhone(cleanPhone);
  if (!user) {
    user = await dbService.createUser({
      id: generateId('u'),
      name: name || 'Anonymous User',
      phone: cleanPhone,
      role: role || 'Volunteer',
      orgName: orgName || null,
      city: city || 'Kanpur',
      trustScore: 5.0,
      totalMealsRescued: 0,
      totalDeliveries: 0,
    });
    console.log(`✅ [USER] Registered: ${user.name} as ${user.role}`);
  }

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'food_rescue_secret',
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

router.get('/me', verifyToken, async (req, res) => {
  const user = await dbService.findUserById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, user });
});

export default router;
