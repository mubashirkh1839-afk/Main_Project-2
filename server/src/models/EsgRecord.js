import mongoose from 'mongoose';

const esgRecordSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  donorId: { type: String, index: true },
  foodListingId: String,
  donorName: String,
  mealsCount: Number,
  weightKg: Number,
  co2OffsetKg: Number,
  certificateId: String,
  issuedAt: Date,
}, { collection: 'esg_records' });

export default mongoose.models.EsgRecord || mongoose.model('EsgRecord', esgRecordSchema);
