/**
 * ============================================================
 * 📄 ESG RECORDS ROUTES  —  /api/esg
 * ============================================================
 * Handles ESG sustainability certificate queries.
 *
 * Routes:
 *   GET /api/esg/my-records    → Get all ESG records for the logged-in donor
 *   GET /api/esg/:id           → Get specific ESG record by ID
 * ============================================================
 */

import express from 'express';
import { esgRecords } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// ─── GET /api/esg/my-records ─────────────────────────────────────────────────
// Returns all ESG certificates issued to the logged-in donor
router.get('/my-records', verifyToken, (req, res) => {
  const myRecords = esgRecords.filter((r) => r.donorId === req.user.id);

  // Calculate cumulative totals
  const totalMeals = myRecords.reduce((acc, r) => acc + (r.mealsCount || 0), 0);
  const totalWeight = myRecords.reduce((acc, r) => acc + (r.weightKg || 0), 0);
  const totalCO2 = myRecords.reduce((acc, r) => acc + (r.co2OffsetKg || 0), 0);

  return res.json({
    success: true,
    count: myRecords.length,
    totals: { totalMeals, totalWeight, totalCO2Offset: totalCO2.toFixed(2) },
    data: myRecords,
  });
});

// ─── GET /api/esg/:id ────────────────────────────────────────────────────────
// Get a specific ESG record (for PDF generation)
router.get('/:id', verifyToken, (req, res) => {
  const record = esgRecords.find((r) => r.id === req.params.id);

  if (!record) {
    return res.status(404).json({ success: false, message: 'ESG record not found.' });
  }

  return res.json({ success: true, data: record });
});

export default router;

