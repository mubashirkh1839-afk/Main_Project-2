/**
 * ============================================================
 * ⏱️ AUTOMATED EXPIRY SWEEPER (Server-Side Cron Job)
 * ============================================================
 *
 * Yeh module ek background cron job hai jo har minute chalti hai.
 * Iska kaam hai:
 * 1. Sabhi "Available" food listings ki expiry time check karna.
 * 2. Jo listing 30 minute ke andar expire ho rahi hai aur abhi bhi
 *    unclaimed hai, usse automatically "Delisted / Expired" mark karna.
 *
 * Yeh ensure karta hai ki:
 * - Stale (kharab) khana kabhi bhi deliver na ho.
 * - Platform par sirf fresh, safe food visible ho.
 * - 100% Food Safety guarantee.
 * ============================================================
 */

import cron from 'node-cron';
import { FoodListing } from './db.js';

const SAFETY_BUFFER_MINUTES = 30; // Delist 30 mins before actual expiry

export const startExpirySweeper = () => {
  // Runs every 60 seconds
  cron.schedule('* * * * *', async () => {
    const now = Date.now();
    let delistedCount = 0;

    const cutoff = new Date(now + SAFETY_BUFFER_MINUTES * 60 * 1000);
    const expiringItems = await FoodListing.find({ status: 'Available', expiresAt: { $lte: cutoff } });
    for (const item of expiringItems) {
      item.status = 'Delisted / Expired';
      await item.save();
      delistedCount++;
      console.log(`🚫 [SWEEPER] "${item.title}" delisted for food safety.`);
    }

    if (delistedCount > 0) {
      console.log(`⏱️ [EXPIRY SWEEPER] Completed — ${delistedCount} listing(s) delisted for food safety.`);
    }
  });

  console.log('✅ [EXPIRY SWEEPER] Started — checking every 60 seconds for expiring listings...');
};

