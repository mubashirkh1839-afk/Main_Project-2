import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['Donor', 'Volunteer', 'NGO Receiver'], default: 'Volunteer' },
  orgName: String,
  city: { type: String, default: 'Kanpur' },
  trustScore: { type: Number, default: 5 },
  totalMealsRescued: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
}, { timestamps: true, collection: 'users' });

export default mongoose.models.User || mongoose.model('User', userSchema);
