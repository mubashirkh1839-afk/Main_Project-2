import express from 'express';
import { dbService, generateId, generateOtp } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

router.get('/nearby', async (req, res) => {
  const { lat, lng, radius = 10, type = 'All' } = req.query;
  const filter = { status: 'Available' };
  if (type !== 'All') filter.type = type;

  let results = await dbService.getFoodListings(filter);

  if (lat && lng) {
    results = results.filter(
      (item) => item.lat && item.lng && getDistanceKm(parseFloat(lat), parseFloat(lng), item.lat, item.lng) <= parseFloat(radius)
    );
  }

  results.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  return res.json({ success: true, count: results.length, data: results });
});

router.get('/', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const results = await dbService.getFoodListings(filter);
  return res.json({ success: true, count: results.length, data: results });
});

router.get('/:id', async (req, res) => {
  const item = await dbService.getFoodListingById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });
  return res.json({ success: true, data: item });
});

router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'Donor') {
    return res.status(403).json({ success: false, message: 'Only Donors can post food.' });
  }

  const { title, type, category, servings, weightKg, location, landmark, lat, lng, expiryHours, packagingStatus, imageUrl } = req.body;
  if (!title || !location || !expiryHours) {
    return res.status(400).json({ success: false, message: 'title, location, and expiryHours are required.' });
  }

  const newListing = await dbService.createFoodListing({
    id: generateId('fl'),
    donorId: req.user.id,
    donor: req.user.name || 'Donor',
    donorPhone: req.user.phone || '',
    title,
    type: type || 'Veg',
    category: category || 'Cooked Meals',
    servings: Number(servings) || 10,
    weightKg: Number(weightKg) || 5,
    location,
    landmark: landmark || '',
    lat: Number(lat) || 26.4722,
    lng: Number(lng) || 80.3090,
    expiryHours: parseInt(expiryHours),
    expiresAt: new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000),
    pickupOtp: generateOtp(),
    dropoffOtp: generateOtp(),
    status: 'Available',
    packagingStatus: packagingStatus || 'Packed',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(),
  });

  console.log(`🍲 [FOOD POSTED] "${newListing.title}" — Pickup OTP: ${newListing.pickupOtp}`);
  return res.status(201).json({ success: true, message: 'Food listing created!', data: newListing });
});

router.patch('/:id/delist', verifyToken, async (req, res) => {
  const item = await dbService.getFoodListingById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Listing not found.' });
  if (item.donorId !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized.' });

  const updated = await dbService.updateFoodListing(req.params.id, { status: 'Delisted' });
  return res.json({ success: true, message: 'Listing delisted.', data: updated });
});

export default router;
