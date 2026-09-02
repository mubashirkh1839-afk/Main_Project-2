import express from 'express';
import { FoodListing, Claim, EsgRecord, generateId } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.post('/reserve', verifyToken, async (req, res) => {
  try {
    const { foodListingId, vehicle, eta, notes } = req.body;
    if (!foodListingId) return res.status(400).json({ success: false, message: 'foodListingId is required.' });
    const listing = await FoodListing.findOne({ id: foodListingId });
    if (!listing) return res.status(404).json({ success: false, message: 'Food listing not found.' });
    if (listing.status !== 'Available') return res.status(409).json({ success: false, message: `This listing is already ${listing.status}. Choose another listing.` });

    const newClaim = await Claim.create({
      id: generateId('cl'), foodListingId, volunteerId: req.user.id,
      receiverId: null, vehicle: vehicle || 'Motorbike', eta: eta || '30 mins', notes: notes || '',
      status: 'Reserved', claimedAt: new Date(), pickedUpAt: null, deliveredAt: null,
    });
    listing.status = 'Claimed';
    listing.claimedBy = `Volunteer (ETA: ${eta || '30 mins'})`;
    await listing.save();
    return res.status(201).json({ success: true, message: 'Food listing successfully reserved! Proceed to pickup location.', claim: newClaim, pickupInstructions: { address: listing.location, landmark: listing.landmark, donorPhone: listing.donorPhone, pickupOtpHint: 'Ask the Donor for the 4-digit Pickup OTP when you arrive.' } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to reserve food listing.', error: error.message });
  }
});

router.post('/verify-pickup-otp', verifyToken, async (req, res) => {
  try {
    const { foodListingId, otp } = req.body;
    if (!foodListingId || !otp) return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });
    const listing = await FoodListing.findOne({ id: foodListingId });
    if (!listing) return res.status(404).json({ success: false, message: 'Food listing not found.' });
    if (listing.pickupOtp !== String(otp)) return res.status(400).json({ success: false, message: 'Incorrect Pickup OTP. Please ask the Donor to confirm the code.' });
    listing.status = 'In-Transit';
    listing.pickedUpAt = new Date();
    await listing.save();
    await Claim.findOneAndUpdate({ foodListingId, volunteerId: req.user.id }, { status: 'Picked-Up', pickedUpAt: new Date() });
    return res.json({ success: true, message: 'Pickup OTP verified! Food safely collected. Proceed to the NGO/Community Kitchen.', nextStep: 'Deliver to the NGO Receiver and get the Drop-off OTP to complete rescue.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to verify pickup OTP.', error: error.message });
  }
});

router.post('/verify-dropoff-otp', verifyToken, async (req, res) => {
  try {
    const { foodListingId, otp } = req.body;
    if (!foodListingId || !otp) return res.status(400).json({ success: false, message: 'foodListingId and otp are required.' });
    const listing = await FoodListing.findOne({ id: foodListingId });
    if (!listing) return res.status(404).json({ success: false, message: 'Food listing not found.' });
    if (listing.dropoffOtp !== String(otp)) return res.status(400).json({ success: false, message: 'Incorrect Drop-off OTP. Please ask the NGO Receiver to confirm the code.' });
    listing.status = 'Delivered';
    listing.deliveredAt = new Date();
    await listing.save();
    await Claim.findOneAndUpdate({ foodListingId }, { status: 'Completed', deliveredAt: new Date() });
    const newEsgRecord = await EsgRecord.create({
      id: generateId('esg'), donorId: listing.donorId, foodListingId: listing.id, donorName: listing.donor,
      mealsCount: listing.servings, weightKg: listing.weightKg, co2OffsetKg: Number(((listing.weightKg || 10) * 2.5).toFixed(2)),
      certificateId: `ESG-IN-2026-${Math.floor(100000 + Math.random() * 900000)}`, issuedAt: new Date(),
    });
    return res.json({ success: true, message: 'Delivery Complete! Food rescue mission accomplished.', esgCertificate: newEsgRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to verify drop-off OTP.', error: error.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const myClaims = await Claim.find({ volunteerId: req.user.id }).sort({ claimedAt: -1 }).lean();
    const enriched = await Promise.all(myClaims.map(async (claim) => ({ ...claim, listing: await FoodListing.findOne({ id: claim.foodListingId }).lean() })));
    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load claims.', error: error.message });
  }
});

export default router;
