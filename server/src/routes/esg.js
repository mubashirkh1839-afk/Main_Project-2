import express from 'express';
import { dbService } from '../db.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.get('/my-records', verifyToken, async (req, res) => {
  const myRecords = await dbService.getEsgRecords(req.user.id);
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

router.get('/:id', async (req, res) => {
  const record = await dbService.getEsgRecordById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'ESG record not found.' });
  return res.json({ success: true, data: record });
});

export default router;
