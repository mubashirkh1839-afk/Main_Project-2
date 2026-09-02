import dns from 'node:dns';
import mongoose from 'mongoose';
import User from './models/User.js';
import FoodListing from './models/FoodListing.js';
import Claim from './models/Claim.js';
import EsgRecord from './models/EsgRecord.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore
}

export const otpStore = {};
export const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
export const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

let isMongoConnected = false;

// In-memory fallback stores
const memoryStore = {
  users: [
    {
      id: 'u1',
      name: 'Mubashir Ahmad',
      phone: '9876543210',
      role: 'Donor',
      orgName: 'Royal Palace Banquet',
      city: 'Kanpur',
      trustScore: 4.9,
    },
  ],
  foodListings: [
    {
      id: 'fl1',
      donorId: 'u1',
      donor: 'Royal Palace Banquet',
      donorPhone: '9876543210',
      title: 'Surplus Lunch Thalis (25 Portions)',
      type: 'Veg',
      category: 'Cooked Meals',
      servings: 25,
      weightKg: 12.5,
      location: 'Swaroop Nagar, Kanpur',
      landmark: 'Opposite Metro Station Pillar 124',
      lat: 26.4722,
      lng: 80.3090,
      expiryHours: 3,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      pickupOtp: '4821',
      dropoffOtp: '5678',
      status: 'Available',
      packagingStatus: 'Packed in Disposable Containers',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(),
    },
    {
      id: 'fl2',
      donorId: 'u1',
      donor: 'Spicy Grill Restaurant',
      donorPhone: '9876543213',
      title: 'Chicken Biryani & Curries (30 Portions)',
      type: 'Non-Veg',
      category: 'Cooked Meals',
      servings: 30,
      weightKg: 15.0,
      location: 'Civil Lines, Kanpur',
      landmark: 'Behind Z Square Mall',
      lat: 26.4680,
      lng: 80.3508,
      expiryHours: 1,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      pickupOtp: '3349',
      dropoffOtp: '9012',
      status: 'Available',
      packagingStatus: 'Large Buffet Pots',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(),
    },
  ],
  claims: [],
  esgRecords: [],
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('ℹ️ Running in fast in-memory mode.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('🌿 [MONGODB ATLAS] Connected to Cloud Database!');

    // Seed initial food if empty
    const count = await FoodListing.countDocuments().catch(() => 1);
    if (count === 0) {
      await FoodListing.insertMany(memoryStore.foodListings).catch(() => {});
      console.log('🌱 Seeded sample food items into MongoDB Atlas.');
    }
  } catch (error) {
    console.warn('⚠️ Cloud MongoDB not reachable, seamlessly using in-memory store:', error.message);
    isMongoConnected = false;
  }
};

// Resilient DB Access Layer
export const dbService = {
  // Users
  async findUserByPhone(phone) {
    if (isMongoConnected) {
      try {
        return await User.findOne({ phone }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    return memoryStore.users.find((u) => u.phone === phone) || null;
  },

  async findUserById(id) {
    if (isMongoConnected) {
      try {
        return await User.findOne({ id }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    return memoryStore.users.find((u) => u.id === id) || null;
  },

  async createUser(userData) {
    if (isMongoConnected) {
      try {
        return await User.create(userData);
      } catch {
        isMongoConnected = false;
      }
    }
    memoryStore.users.push(userData);
    return userData;
  },

  // Food Listings
  async getFoodListings(filter = {}) {
    if (isMongoConnected) {
      try {
        return await FoodListing.find(filter).sort({ createdAt: -1 }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    let res = [...memoryStore.foodListings];
    if (filter.status) res = res.filter((f) => f.status === filter.status);
    if (filter.type) res = res.filter((f) => f.type === filter.type);
    return res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getFoodListingById(id) {
    if (isMongoConnected) {
      try {
        return await FoodListing.findOne({ id }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    return memoryStore.foodListings.find((f) => f.id === id) || null;
  },

  async createFoodListing(foodData) {
    if (isMongoConnected) {
      try {
        return await FoodListing.create(foodData);
      } catch {
        isMongoConnected = false;
      }
    }
    memoryStore.foodListings.unshift(foodData);
    return foodData;
  },

  async updateFoodListing(id, updates) {
    if (isMongoConnected) {
      try {
        return await FoodListing.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    const idx = memoryStore.foodListings.findIndex((f) => f.id === id);
    if (idx !== -1) {
      memoryStore.foodListings[idx] = { ...memoryStore.foodListings[idx], ...updates };
      return memoryStore.foodListings[idx];
    }
    return null;
  },

  // Claims
  async createClaim(claimData) {
    if (isMongoConnected) {
      try {
        return await Claim.create(claimData);
      } catch {
        isMongoConnected = false;
      }
    }
    memoryStore.claims.push(claimData);
    return claimData;
  },

  async updateClaim(foodListingId, updates) {
    if (isMongoConnected) {
      try {
        await Claim.updateOne({ foodListingId }, { $set: updates });
      } catch {
        isMongoConnected = false;
      }
    }
    const claim = memoryStore.claims.find((c) => c.foodListingId === foodListingId);
    if (claim) Object.assign(claim, updates);
  },

  async getMyClaims(volunteerId) {
    if (isMongoConnected) {
      try {
        const claims = await Claim.find({ volunteerId }).lean();
        const listingIds = claims.map((c) => c.foodListingId);
        const listings = await FoodListing.find({ id: { $in: listingIds } }).lean();
        return claims.map((claim) => ({
          ...claim,
          listing: listings.find((l) => l.id === claim.foodListingId),
        }));
      } catch {
        isMongoConnected = false;
      }
    }
    const myClaims = memoryStore.claims.filter((c) => c.volunteerId === volunteerId);
    return myClaims.map((claim) => ({
      ...claim,
      listing: memoryStore.foodListings.find((l) => l.id === claim.foodListingId),
    }));
  },

  // ESG Records
  async createEsgRecord(esgData) {
    if (isMongoConnected) {
      try {
        return await EsgRecord.create(esgData);
      } catch {
        isMongoConnected = false;
      }
    }
    memoryStore.esgRecords.push(esgData);
    return esgData;
  },

  async getEsgRecords(donorId) {
    if (isMongoConnected) {
      try {
        return await EsgRecord.find({ donorId }).sort({ issuedAt: -1 }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    return memoryStore.esgRecords.filter((r) => r.donorId === donorId);
  },

  async getEsgRecordById(id) {
    if (isMongoConnected) {
      try {
        return await EsgRecord.findOne({ id }).lean();
      } catch {
        isMongoConnected = false;
      }
    }
    return memoryStore.esgRecords.find((r) => r.id === id) || null;
  },

  // Expiry sweeper check
  async expireOldFood(cutoffDate) {
    if (isMongoConnected) {
      try {
        return await FoodListing.updateMany(
          { status: 'Available', expiresAt: { $lte: cutoffDate } },
          { status: 'Delisted / Expired' }
        );
      } catch {
        isMongoConnected = false;
      }
    }
    let count = 0;
    memoryStore.foodListings.forEach((f) => {
      if (f.status === 'Available' && new Date(f.expiresAt) <= cutoffDate) {
        f.status = 'Delisted / Expired';
        count++;
      }
    });
    return { modifiedCount: count };
  },
};
