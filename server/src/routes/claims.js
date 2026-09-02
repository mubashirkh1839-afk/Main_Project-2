import express from 'express';
import { dbService, generateId } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.post('/reserve', verifyToken, async (req, res) => {
  const { foodListingId, vehicle, eta, notes } = req.body;
  if (!foodListingId) return res.status(400).json({ success: false, message: 'foodListingId is required.' });

  const listing = await dbService.getFoodListingById(foodListingId);
  if (!listing) return res.status(404).json({ success: false, message: 'Food listing not found.' });
  if (listing.status !== 'Available') return res.status(409).json({ success: false, message: `This listing is already ${listing.status}.` });

  const newClaim = await dbService.createClaim({
    id: generateId('cl'),
    foodListingId,
    volunteerId: req.user.id,
    receiverId: null,
    vehicle: vehicle || 'Motorbike',
    eta: eta || '30 mins',
    notes: notes || '',
    status: 'Reserved',
    claimedAt: new Date(),
    pickedUpAt: null,
    deliveredAt: null,
  });

  await dbService.updateFoodListing(foodListingId, {
    status: 'Claimed',
    claimedBy: `${req.user.name || 'Volunteer'} (ETA: ${eta || '30 mins'})`,
  });

  return res.status(201).json({
    success: true,
    message: 'Food listing reserved!',
    claim: newClaim,
    pickupInstructions: {
      address: listing.location,
      landmark: listing.landmark,
      donorPhone: listing.donorPhone,
    },
  });
});

router.post('/verify-pickup-otp', verifyToken, async (req, res) => {
  const { foodListingId, otp } = req.body;
  if (!foodListingId || !otp) return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });

  const listing = await dbService.getFoodListingById(foodListingId);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

  if (listing.pickupOtp !== String(otp)) {
    return res.status(400).json({ success: false, message: '❌ Incorrect Pickup OTP.' });
  }

  await dbService.updateFoodListing(foodListingId, {
    status: 'In-Transit',
    pickedUpAt: new Date(),
  });

  await dbService.updateClaim(foodListingId, {
    status: 'Picked-Up',
    pickedUpAt: new Date(),
  });

  return res.json({ success: true, message: '✅ Pickup OTP verified! Status updated to In-Transit.' });
});

router.post('/verify-dropoff-otp', verifyToken, async (req, res) => {
  const { foodListingId, otp } = req.body;
  if (!foodListingId || !otp) return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });

  const listing = await dbService.getFoodListingById(foodListingId);
  if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

  if (listing.dropoffOtp !== String(otp)) {
    return res.status(400).json({ success: false, message: '❌ Incorrect Drop-off OTP.' });
  }

  await dbService.updateFoodListing(foodListingId, {
    status: 'Delivered',
    deliveredAt: new Date(),
  });

  await dbService.updateClaim(foodListingId, {
    status: 'Completed',
    deliveredAt: new Date(),
  });

  const co2Offset = ((listing.weightKg || 10) * 2.5).toFixed(2);
  const newEsg = await dbService.createEsgRecord({
    id: generateId('esg'),
    donorId: listing.donorId,
    foodListingId: listing.id,
    donorName: listing.donor,
    mealsCount: listing.servings,
    weightKg: listing.weightKg,
    co2OffsetKg: parseFloat(co2Offset),
    certificateId: `ESG-IN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    issuedAt: new Date(),
  });

  return res.json({ success: true, message: '🎉 Delivery complete! ESG certificate generated.', esgCertificate: newEsg });
});

router.get('/mine', verifyToken, async (req, res) => {
  const myClaims = await dbService.getMyClaims(req.user.id);
  return res.json({ success: true, count: myClaims.length, data: myClaims });
});

export default router;
