/**
 * ============================================================
 * 🗃️ IN-MEMORY DATABASE (for Development / Demo phase)
 * ============================================================
 * 
 * Yeh file ek in-memory data store hai. Iska matlab yeh hai ki
 * jab server restart hota hai, data reset ho jata hai.
 * 
 * Yeh STEP 1 ke liye perfect hai, kyunki:
 * 1. Koi database install karne ki zaroorat nahi.
 * 2. Hum APIs aur business logic seedhi test kar sakte hain.
 * 3. Baad me sirf yeh file replace karke real MongoDB/PostgreSQL connect ho jayega.
 * ============================================================
 */

// ---- USERS TABLE ----
// Registered users (Donors, Volunteers, NGO Receivers)
let users = [
  {
    id: 'u1',
    name: 'Mubashir Ahmad',
    phone: '+919876543210',
    role: 'Donor',
    orgName: 'Royal Palace Banquet',
    city: 'Kanpur',
    trustScore: 4.9,
    totalMealsRescued: 250,
    createdAt: new Date('2026-08-01').toISOString(),
  },
  {
    id: 'u2',
    name: 'Rahul Verma',
    phone: '+919876543211',
    role: 'Volunteer',
    orgName: null,
    city: 'Kanpur',
    trustScore: 4.8,
    totalDeliveries: 45,
    createdAt: new Date('2026-08-10').toISOString(),
  },
  {
    id: 'u3',
    name: 'Priya Sharma',
    phone: '+919876543212',
    role: 'NGO Receiver',
    orgName: 'Robin Hood Army Kanpur',
    city: 'Kanpur',
    trustScore: 5.0,
    createdAt: new Date('2026-08-05').toISOString(),
  },
];

// ---- FOOD LISTINGS TABLE ----
// Active surplus food donations
let foodListings = [
  {
    id: 'fl1',
    donorId: 'u1',
    title: 'Surplus Lunch Thalis (25 Portions)',
    donor: 'Royal Palace Banquet',
    donorPhone: '+919876543210',
    type: 'Veg',
    category: 'Cooked Meals',
    servings: 25,
    weightKg: 12.5,
    location: 'Swaroop Nagar, Kanpur',
    landmark: 'Opposite Metro Station Pillar 124',
    lat: 26.4722,
    lng: 80.3090,
    expiryHours: 3,
    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    pickupOtp: '4821',
    dropoffOtp: '5678',
    status: 'Available',
    packagingStatus: 'Packed in Disposable Containers',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fl2',
    donorId: 'u1',
    title: 'Chicken Biryani & Curries (30 Portions)',
    donor: 'Spicy Grill Restaurant',
    donorPhone: '+919876543213',
    type: 'Non-Veg',
    category: 'Cooked Meals',
    servings: 30,
    weightKg: 15.0,
    location: 'Civil Lines, Kanpur',
    landmark: 'Behind Z Square Mall',
    lat: 26.4680,
    lng: 80.3508,
    expiryHours: 1,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    pickupOtp: '3349',
    dropoffOtp: '9012',
    status: 'Available',
    packagingStatus: 'Large Buffet Pots',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  },
];

// ---- CLAIMS TABLE ----
// When a volunteer reserves a food listing
let claims = [];

// ---- ESG RECORDS TABLE ----
// Auto-created when delivery is confirmed (for PDF certificate generation)
let esgRecords = [
  {
    id: 'esg1',
    donorId: 'u1',
    foodListingId: 'fl_demo',
    donorName: 'Royal Palace Banquet',
    mealsCount: 250,
    weightKg: 125,
    co2OffsetKg: 312.5,
    certificateId: 'ESG-IN-2026-948201',
    issuedAt: new Date('2026-08-20').toISOString(),
  },
];

// ---- OTP STORE ----
// Temporary phone->OTP mapping (expires after 5 minutes)
let otpStore = {};

// ---- HELPER: Generate unique ID ----
const generateId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

// ---- HELPER: Generate 4-digit OTP ----
const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

// ---- EXPORTS ----
export {
  users,
  foodListings,
  claims,
  esgRecords,
  otpStore,
  generateId,
  generateOtp,
};

