/**
 * ============================================================
 * 🍲 FOOD LISTING ROUTES  —  /api/food
 * ============================================================
 * Handles all surplus food listing operations.
 *
 * Routes:
 *   GET  /api/food/nearby         → Finds listings within radius (geospatial proximity)
 *   GET  /api/food                → Get all active listings
 *   GET  /api/food/:id            → Get specific listing details
 *   POST /api/food                → Create new surplus food listing (Donor only)
 *   PATCH /api/food/:id/delist    → Manually delist an expired listing (Donor only)
 * ============================================================
 */

import express from 'express';
import { foodListings, generateId, generateOtp } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ─── HELPER: Calculate distance between two lat/lng points (Haversine formula) ─
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// ─── GET /api/food/nearby?lat=...&lng=...&radius=10&type=All ──────────────────
// Returns listings sorted by urgency within the specified radius
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 10, type = 'All' } = req.query;

  let results = foodListings.filter((item) => item.status === 'Available');

  // If lat/lng provided, filter by proximity
  if (lat && lng) {
    results = results.filter((item) => {
      const dist = getDistanceKm(
        parseFloat(lat),
        parseFloat(lng),
        item.lat,
        item.lng
      );
      return dist <= parseFloat(radius);
    });
  }

  // Filter by food type
  if (type !== 'All') {
    results = results.filter((item) => item.type === type);
  }

  // Sort by urgency: listings expiring soonest come first
  results.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

  return res.json({ success: true, count: results.length, data: results });
});

// ─── GET /api/food ────────────────────────────────────────────────────────────
// Get all food listings (for map display, includes claimed/delivered)
router.get('/', (req, res) => {
  const { status } = req.query;
  let results = [...foodListings];

  if (status) {
    results = results.filter((item) => item.status === status);
  }

  // Sort by creation time, newest first
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json({ success: true, count: results.length, data: results });
});

// ─── GET /api/food/:id ────────────────────────────────────────────────────────
// Get details of a specific food listing
router.get('/:id', (req, res) => {
  const item = foodListings.find((f) => f.id === req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Food listing not found.' });
  }

  return res.json({ success: true, data: item });
});

// ─── POST /api/food ───────────────────────────────────────────────────────────
// Create a new surplus food listing (Donor only)
router.post('/', verifyToken, (req, res) => {
  if (req.user.role !== 'Donor') {
    return res.status(403).json({ success: false, message: 'Only Donors can post food listings.' });
  }

  const {
    title, type, category, servings, weightKg,
    location, landmark, lat, lng,
    expiryHours, packagingStatus, imageUrl,
  } = req.body;

  // Basic validation
  if (!title || !location || !expiryHours) {
    return res.status(400).json({
      success: false,
      message: 'title, location, and expiryHours are required fields.',
    });
  }

  const newListing = {
    id: generateId('fl'),
    donorId: req.user.id,
    title,
    type: type || 'Veg',
    category: category || 'Cooked Meals',
    servings: servings || 10,
    weightKg: weightKg || 5,
    location,
    landmark: landmark || '',
    lat: lat || 26.4722,
    lng: lng || 80.3090,
    expiryHours: parseInt(expiryHours),
    expiresAt: new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000).toISOString(),
    pickupOtp: generateOtp(),   // Server-generated secure 4-digit OTP
    dropoffOtp: generateOtp(),  // Server-generated secure 4-digit OTP
    status: 'Available',
    packagingStatus: packagingStatus || 'Packed',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  };

  foodListings.push(newListing);

  console.log(`🍲 [NEW LISTING] "${newListing.title}" by Donor ${req.user.id} — Pickup OTP: ${newListing.pickupOtp}`);

  return res.status(201).json({
    success: true,
    message: 'Food listing created successfully!',
    data: newListing,
  });
});

// ─── PATCH /api/food/:id/delist ───────────────────────────────────────────────
// Manually delist a food listing
router.patch('/:id/delist', verifyToken, (req, res) => {
  const idx = foodListings.findIndex((f) => f.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Listing not found.' });
  }
  if (foodListings[idx].donorId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You can only delist your own listings.' });
  }

  foodListings[idx].status = 'Delisted';
  return res.json({ success: true, message: 'Listing delisted.', data: foodListings[idx] });
});

export default router;

