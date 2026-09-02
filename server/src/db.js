import mongoose from 'mongoose';
import MongooseUser from './models/User.js';
import MongooseFoodListing from './models/FoodListing.js';
import MongooseClaim from './models/Claim.js';
import MongooseEsgRecord from './models/EsgRecord.js';

const otpStore = new Map();
const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

const memoryStores = {
  users: [],
  foodListings: [],
  claims: [],
  esgRecords: [],
};

const matchesMongoOperator = (actual, operatorValue) => {
  if (!operatorValue || typeof operatorValue !== 'object' || Array.isArray(operatorValue)) {
    return actual === operatorValue;
  }

  for (const [operator, expected] of Object.entries(operatorValue)) {
    switch (operator) {
      case '$lte':
        if (!(actual <= expected)) return false;
        break;
      case '$lt':
        if (!(actual < expected)) return false;
        break;
      case '$gte':
        if (!(actual >= expected)) return false;
        break;
      case '$gt':
        if (!(actual > expected)) return false;
        break;
      case '$ne':
        if (actual === expected) return false;
        break;
      case '$in':
        if (!Array.isArray(expected) || !expected.includes(actual)) return false;
        break;
      case '$nin':
        if (Array.isArray(expected) && expected.includes(actual)) return false;
        break;
      case '$exists':
        if (((actual !== undefined) && actual !== null) !== Boolean(expected)) return false;
        break;
      default:
        return false;
    }
  }

  return true;
};

const matchesQuery = (doc, query = {}) => Object.entries(query).every(([key, value]) => {
  if (value === undefined) return true;
  if (value && typeof value === 'object' && !Array.isArray(value) && ('$lte' in value || '$lt' in value || '$gte' in value || '$gt' in value || '$ne' in value || '$in' in value || '$nin' in value || '$exists' in value)) {
    return matchesMongoOperator(doc[key], value);
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return doc[key] !== undefined && JSON.stringify(doc[key]) === JSON.stringify(value);
  }

  return doc[key] === value;
});

const withSave = (collectionName, doc) => {
  const saved = doc ? { ...doc } : {};

  saved.save = async () => {
    if (!saved.id) return saved;
    const index = memoryStores[collectionName].findIndex((item) => item.id === saved.id);
    if (index !== -1) {
      memoryStores[collectionName][index] = { ...memoryStores[collectionName][index], ...saved };
    }
    return saved;
  };

  saved.lean = () => (doc ? { ...saved } : null);
  return saved;
};

const makeQueryResult = (collectionName, data) => {
  const items = [...data];

  return {
    sort(sorter) {
      if (!sorter) return this;
      const entries = Object.entries(sorter);
      items.sort((a, b) => {
        for (const [key, direction] of entries) {
          const valueA = a[key] ?? '';
          const valueB = b[key] ?? '';
          const cmp = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
          if (cmp !== 0) return direction === -1 ? -cmp : cmp;
        }
        return 0;
      });
      return this;
    },
    lean() {
      return items.map((item) => withSave(collectionName, item));
    },
  };
};

const createMemoryModel = (collectionName) => ({
  async find(query = {}) {
    const docs = memoryStores[collectionName].filter((doc) => matchesQuery(doc, query));
    return makeQueryResult(collectionName, docs);
  },
  async findOne(query = {}) {
    const doc = memoryStores[collectionName].find((item) => matchesQuery(item, query)) ?? null;
    return doc ? withSave(collectionName, doc) : { lean: () => null, save: async () => null };
  },
  async findOneAndUpdate(query = {}, update = {}) {
    const index = memoryStores[collectionName].findIndex((item) => matchesQuery(item, query));
    if (index === -1) return null;
    memoryStores[collectionName][index] = {
      ...memoryStores[collectionName][index],
      ...update,
    };
    return withSave(collectionName, memoryStores[collectionName][index]);
  },
  async create(document) {
    const doc = { ...document };
    memoryStores[collectionName].push(doc);
    return withSave(collectionName, doc);
  },
  async insertMany(documents) {
    memoryStores[collectionName].push(...documents);
    return documents.map((doc) => withSave(collectionName, doc));
  },
  async exists(query = {}) {
    return memoryStores[collectionName].some((doc) => matchesQuery(doc, query));
  },
  async countDocuments(query = {}) {
    return memoryStores[collectionName].filter((doc) => matchesQuery(doc, query)).length;
  },
});

const User = createMemoryModel('users');
const FoodListing = createMemoryModel('foodListings');
const Claim = createMemoryModel('claims');
const EsgRecord = createMemoryModel('esgRecords');

const seedDatabase = async () => {
  if (await User.exists({})) return;

  const users = [
    { id: 'u1', name: 'Mubashir Ahmad', phone: '+919876543210', role: 'Donor', orgName: 'Royal Palace Banquet', city: 'Kanpur', trustScore: 4.9, totalMealsRescued: 250 },
    { id: 'u2', name: 'Rahul Verma', phone: '+919876543211', role: 'Volunteer', city: 'Kanpur', trustScore: 4.8, totalDeliveries: 45 },
    { id: 'u3', name: 'Priya Sharma', phone: '+919876543212', role: 'NGO Receiver', orgName: 'Robin Hood Army Kanpur', city: 'Kanpur', trustScore: 5 },
  ];

  await User.insertMany(users);

  const now = Date.now();
  await FoodListing.insertMany([
    { id: 'fl1', donorId: 'u1', title: 'Surplus Lunch Thalis (25 Portions)', donor: 'Royal Palace Banquet', donorPhone: '+919876543210', type: 'Veg', category: 'Cooked Meals', servings: 25, weightKg: 12.5, location: 'Swaroop Nagar, Kanpur', landmark: 'Opposite Metro Station Pillar 124', lat: 26.4722, lng: 80.309, expiryHours: 3, expiresAt: new Date(now + 3 * 3600000), pickupOtp: '4821', dropoffOtp: '5678', status: 'Available', packagingStatus: 'Packed in Disposable Containers', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
    { id: 'fl2', donorId: 'u1', title: 'Chicken Biryani & Curries (30 Portions)', donor: 'Spicy Grill Restaurant', donorPhone: '+919876543213', type: 'Non-Veg', category: 'Cooked Meals', servings: 30, weightKg: 15, location: 'Civil Lines, Kanpur', landmark: 'Behind Z Square Mall', lat: 26.468, lng: 80.3508, expiryHours: 1, expiresAt: new Date(now + 3600000), pickupOtp: '3349', dropoffOtp: '9012', status: 'Available', packagingStatus: 'Large Buffet Pots', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  ]);
};

const useMemoryDb = () => {
  const useFallback = !process.env.MONGO_URI;
  if (useFallback) {
    console.warn('⚠️ MONGO_URI not configured. Starting server in demo memory mode.');
  }
  return useFallback;
};

const connectDB = async () => {
  const shouldUseMemoryDb = useMemoryDb();

  if (shouldUseMemoryDb) {
    await seedDatabase();
    console.log('✅ Server started in memory demo mode.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    await seedDatabase();
    console.log('✅ MongoDB connected and database ready.');
  } catch (error) {
    console.warn(`⚠️ MongoDB unavailable (${error.message}). Falling back to in-memory demo mode.`);
    await seedDatabase();
  }
};

export {
  MongooseUser,
  MongooseFoodListing,
  MongooseClaim,
  MongooseEsgRecord,
  User,
  FoodListing,
  Claim,
  EsgRecord,
  otpStore,
  generateId,
  generateOtp,
  connectDB,
};
