import cron from 'node-cron';
import { dbService } from './db.js';

const SAFETY_BUFFER_MINUTES = 30;

export const startExpirySweeper = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() + SAFETY_BUFFER_MINUTES * 60 * 1000);
      const result = await dbService.expireOldFood(cutoffTime);
      if (result.modifiedCount > 0) {
        console.log(`⏱️ [EXPIRY SWEEPER] ${result.modifiedCount} listing(s) auto-delisted for food safety.`);
      }
    } catch (err) {
      console.error('Sweeper error:', err.message);
    }
  });

  console.log('✅ [EXPIRY SWEEPER] Running every 60s...');
};
