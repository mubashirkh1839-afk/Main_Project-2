import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  foodListingId: { type: String, required: true, index: true },
  volunteerId: { type: String, required: true, index: true },
  receiverId: String,
  vehicle: String,
  eta: String,
  notes: String,
  status: String,
  claimedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
}, { collection: 'claims' });

export default mongoose.models.Claim || mongoose.model('Claim', claimSchema);
