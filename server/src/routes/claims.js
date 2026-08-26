/**
 * ============================================================
 * 🛡️ CLAIMS & 2-TIER OTP VERIFICATION ROUTES  —  /api/claims
 * ============================================================
 * Handles all volunteer claim reservations and OTP verifications.
 *
 * Routes:
 *   POST  /api/claims/reserve             → Volunteer reserves a food listing
 *   POST  /api/claims/verify-pickup-otp   → Volunteer verifies donor's pickup OTP
 *   POST  /api/claims/verify-dropoff-otp  → NGO verifies drop-off OTP (completes delivery)
 *   GET   /api/claims/mine                → Get all claims for logged-in volunteer
 * ============================================================
 */

import express from 'express';
import { foodListings, claims, esgRecords, generateId } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ─── POST /api/claims/reserve ─────────────────────────────────────────────────
// Volunteer reserves a food listing (prevents double-claiming)
router.post('/reserve', verifyToken, (req, res) => {
  const { foodListingId, vehicle, eta, notes } = req.body;

  if (!foodListingId) {
    return res.status(400).json({ success: false, message: 'foodListingId is required.' });
  }

  const listingIdx = foodListings.findIndex((f) => f.id === foodListingId);

  if (listingIdx === -1) {
    return res.status(404).json({ success: false, message: 'Food listing not found.' });
  }

  const listing = foodListings[listingIdx];

  // Check if already claimed
  if (listing.status !== 'Available') {
    return res.status(409).json({
      success: false,
      message: `This listing is already ${listing.status}. Choose another listing.`,
    });
  }

  // Create claim record
  const newClaim = {
    id: generateId('cl'),
    foodListingId,
    volunteerId: req.user.id,
    receiverId: null,
    vehicle: vehicle || 'Motorbike',
    eta: eta || '30 mins',
    notes: notes || '',
    status: 'Reserved',
    claimedAt: new Date().toISOString(),
    pickedUpAt: null,
    deliveredAt: null,
  };

  claims.push(newClaim);

  // Update food listing status
  foodListings[listingIdx].status = 'Claimed';
  foodListings[listingIdx].claimedBy = `Volunteer (ETA: ${eta})`;

  console.log(`🛵 [CLAIMED] Listing "${listing.title}" reserved by Volunteer ${req.user.id}`);

  return res.status(201).json({
    success: true,
    message: 'Food listing successfully reserved! Proceed to pickup location.',
    claim: newClaim,
    pickupInstructions: {
      address: listing.location,
      landmark: listing.landmark,
      donorPhone: listing.donorPhone,
      pickupOtpHint: 'Ask the Donor for the 4-digit Pickup OTP when you arrive.',
    },
  });
});

// ─── POST /api/claims/verify-pickup-otp ───────────────────────────────────────
// Volunteer enters donor's pickup OTP at the pickup location
// → Marks status as "In-Transit"
router.post('/verify-pickup-otp', verifyToken, (req, res) => {
  const { foodListingId, otp } = req.body;

  if (!foodListingId || !otp) {
    return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });
  }

  const listingIdx = foodListings.findIndex((f) => f.id === foodListingId);
  if (listingIdx === -1) {
    return res.status(404).json({ success: false, message: 'Food listing not found.' });
  }

  const listing = foodListings[listingIdx];

  // Validate OTP
  if (listing.pickupOtp !== String(otp)) {
    return res.status(400).json({
      success: false,
      message: '❌ Incorrect Pickup OTP. Please ask the Donor to confirm the code.',
    });
  }

  // Update statuses
  foodListings[listingIdx].status = 'In-Transit';
  foodListings[listingIdx].pickedUpAt = new Date().toISOString();

  const claimIdx = claims.findIndex(
    (c) => c.foodListingId === foodListingId && c.volunteerId === req.user.id
  );
  if (claimIdx !== -1) {
    claims[claimIdx].status = 'Picked-Up';
    claims[claimIdx].pickedUpAt = new Date().toISOString();
  }

  console.log(`✅ [PICKUP OTP VERIFIED] Listing "${listing.title}" is now In-Transit`);

  return res.json({
    success: true,
    message: '✅ Pickup OTP verified! Food safely collected. Proceed to the NGO/Community Kitchen.',
    nextStep: 'Deliver to the NGO Receiver and get the Drop-off OTP to complete rescue.',
  });
});

// ─── POST /api/claims/verify-dropoff-otp ──────────────────────────────────────
// NGO Receiver enters drop-off OTP to confirm receipt
// → Marks delivery as "Delivered" and auto-generates ESG record
router.post('/verify-dropoff-otp', verifyToken, (req, res) => {
  const { foodListingId, otp } = req.body;

  if (!foodListingId || !otp) {
    return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });
  }

  const listingIdx = foodListings.findIndex((f) => f.id === foodListingId);
  if (listingIdx === -1) {
    return res.status(404).json({ success: false, message: 'Food listing not found.' });
  }

  const listing = foodListings[listingIdx];

  // Validate drop-off OTP
  if (listing.dropoffOtp !== String(otp)) {
    return res.status(400).json({
      success: false,
      message: '❌ Incorrect Drop-off OTP. Please ask the NGO Receiver to confirm the code.',
    });
  }

  // Mark listing as Delivered
  foodListings[listingIdx].status = 'Delivered';
  foodListings[listingIdx].deliveredAt = new Date().toISOString();

  const claimIdx = claims.findIndex((c) => c.foodListingId === foodListingId);
  if (claimIdx !== -1) {
    claims[claimIdx].status = 'Completed';
    claims[claimIdx].deliveredAt = new Date().toISOString();
  }

  // ── AUTO-GENERATE ESG RECORD ──────────────────────────────────────────────
  const co2Offset = ((listing.weightKg || 10) * 2.5).toFixed(2);
  const newEsgRecord = {
    id: generateId('esg'),
    donorId: listing.donorId,
    foodListingId: listing.id,
    donorName: listing.donor,
    mealsCount: listing.servings,
    weightKg: listing.weightKg,
    co2OffsetKg: parseFloat(co2Offset),
    certificateId: `ESG-IN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    issuedAt: new Date().toISOString(),
  };
  esgRecords.push(newEsgRecord);

  console.log(`🎉 [DELIVERY COMPLETE] "${listing.title}" delivered! ESG Certificate: ${newEsgRecord.certificateId}`);

  return res.json({
    success: true,
    message: '🎉 Delivery Complete! Food rescue mission accomplished.',
    esgCertificate: newEsgRecord,
  });
});

// ─── GET /api/claims/mine ─────────────────────────────────────────────────────
// Get all claims for the currently logged-in volunteer
router.get('/mine', verifyToken, (req, res) => {
  const myClaims = claims.filter((c) => c.volunteerId === req.user.id);

  const enriched = myClaims.map((claim) => {
    const listing = foodListings.find((f) => f.id === claim.foodListingId);
    return { ...claim, listing };
  });

  return res.json({ success: true, count: enriched.length, data: enriched });
});

export default router;

