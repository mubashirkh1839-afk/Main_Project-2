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
import { foodListings } from './db.js';

const SAFETY_BUFFER_MINUTES = 30; // Delist 30 mins before actual expiry

export const startExpirySweeper = () => {
  // Runs every 60 seconds
  cron.schedule('* * * * *', () => {
    const now = Date.now();
    let delistedCount = 0;

    foodListings.forEach((item, idx) => {
      if (item.status !== 'Available') return;

      const expiresAt = new Date(item.expiresAt).getTime();
      const minutesUntilExpiry = (expiresAt - now) / (1000 * 60);

      if (minutesUntilExpiry <= SAFETY_BUFFER_MINUTES) {
        foodListings[idx].status = 'Delisted / Expired';
        delistedCount++;

        console.log(
          `🚫 [SWEEPER] "${item.title}" delisted (${minutesUntilExpiry.toFixed(1)} mins to expiry)`
        );
      }
    });

    if (delistedCount > 0) {
      console.log(`⏱️ [EXPIRY SWEEPER] Completed — ${delistedCount} listing(s) delisted for food safety.`);
    }
  });

  console.log('✅ [EXPIRY SWEEPER] Started — checking every 60 seconds for expiring listings...');
};

