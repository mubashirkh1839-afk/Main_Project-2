import mongoose from 'mongoose';

const foodListingSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  donorId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  donor: String,
  donorPhone: String,
  type: { type: String, default: 'Veg' },
  category: { type: String, default: 'Cooked Meals' },
  servings: { type: Number, default: 10 },
  weightKg: { type: Number, default: 5 },
  location: { type: String, required: true },
  landmark: String,
  lat: Number,
  lng: Number,
  expiryHours: Number,
  expiresAt: Date,
  pickupOtp: String,
  dropoffOtp: String,
  status: { type: String, default: 'Available', index: true },
  claimedBy: String,
  packagingStatus: String,
  imageUrl: String,
  pickedUpAt: Date,
  deliveredAt: Date,
}, { timestamps: true, collection: 'food_listings' });

export default mongoose.models.FoodListing || mongoose.model('FoodListing', foodListingSchema);
