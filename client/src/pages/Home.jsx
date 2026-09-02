import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PostFoodModal from '../components/PostFoodModal';
import ClaimModal from '../components/ClaimModal';
import DeliveryVerificationModal from '../components/DeliveryVerificationModal';
import ESGCertificateModal from '../components/ESGCertificateModal';
import RoleSelectionModal from '../components/RoleSelectionModal';
import LoginModal from '../components/LoginModal';
import DonorDashboard from '../components/DonorDashboard';
import VolunteerDashboard from '../components/VolunteerDashboard';
import MapView from '../components/MapView';
import {
  createFoodListing,
  getFoodListings,
  reserveFoodListing,
  verifyPickupOtp,
  verifyDropoffOtp,
} from '../api';
import { 
  Utensils, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Search, 
  SlidersHorizontal, 
  AlertTriangle,
  Package,
  Bike,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Award,
  TimerOff
} from 'lucide-react';

const INITIAL_FOOD_ITEMS = [
  {
    id: 1,
    title: 'Surplus Lunch Thalis (25 Portions)',
    donor: 'Royal Palace Banquet',
    donorPhone: '+919876543210',
    type: 'Veg',
    category: 'Cooked Meals',
    servings: 25,
    weightKg: 12.5,
    location: 'Swaroop Nagar, Kanpur',
    landmark: 'Opposite Metro Station Pillar 124',
    coords: [26.4722, 80.3090],
    expiryHours: 2,
    expiry: 'Expires in 2 hours',
    isUrgent: true,
    packagingStatus: 'Packed in Disposable Containers',
    status: 'Available',
    pickupOtp: '4821',
    dropoffOtp: '5678',
    claimedBy: null,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Fresh Packaged Sandwiches & Fruit Boxes',
    donor: 'Green Cafe & Bakery',
    donorPhone: '+919876543211',
    type: 'Veg',
    category: 'Bakery / Breads',
    servings: 18,
    weightKg: 8.0,
    location: 'Kalyanpur, Kanpur',
    landmark: 'Near IIT Kanpur Main Gate',
    coords: [26.5123, 80.2326],
    expiryHours: 5,
    expiry: 'Expires in 5 hours',
    isUrgent: false,
    packagingStatus: 'Sealed Packets',
    status: 'Available',
    pickupOtp: '7193',
    dropoffOtp: '5678',
    claimedBy: null,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Chicken Biryani & Side Curries (30 Portions)',
    donor: 'Spicy Grill Restaurant',
    donorPhone: '+919876543212',
    type: 'Non-Veg',
    category: 'Cooked Meals',
    servings: 30,
    weightKg: 15.0,
    location: 'Civil Lines, Kanpur',
    landmark: 'Behind Z Square Mall',
    coords: [26.4680, 80.3508],
    expiryHours: 1,
    expiry: 'Expires in 1 hour',
    isUrgent: true,
    packagingStatus: 'Large Buffet Pots (Bring Vessels)',
    status: 'Available',
    pickupOtp: '3349',
    dropoffOtp: '5678',
    claimedBy: null,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: '50 Boxes Dry Ration & Biscuits',
    donor: 'Metro Supermart CSR',
    donorPhone: '+919876543213',
    type: 'Packaged',
    category: 'Packaged / Canned',
    servings: 50,
    weightKg: 25.0,
    location: 'Mall Road, Kanpur',
    landmark: 'Loading Dock C',
    coords: [26.4670, 80.3500],
    expiryHours: 24,
    expiry: 'Expires in 24 hours',
    isUrgent: false,
    packagingStatus: 'Factory Sealed Packets',
    status: 'Claimed',
    pickupOtp: '8912',
    dropoffOtp: '5678',
    claimedBy: 'Robin Hood Army (ETA: 20 mins)',
    imageUrl: 'https://images.unsplash.com/photo-1584473457406-624048518851?auto=format&fit=crop&w=600&q=80',
  }
];

const Home = () => {
  const { user, setIsRoleModalOpen, setIsLoginModalOpen } = useAuth();
  const [foodItems, setFoodItems] = useState(INITIAL_FOOD_ITEMS);

  const normalizeFoodItem = (item) => ({
    ...item,
    coords: item.coords || [item.lat, item.lng],
    quantity: item.quantity || `${item.servings || 0} Servings`,
    expiry: item.expiry || `Expires in ${item.expiryHours || 0} hours`,
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  });

  useEffect(() => {
    getFoodListings()
      .then((response) => setFoodItems(response.data.map(normalizeFoodItem)))
      .catch(() => {
        // Keep demo listings visible while the backend is unavailable.
      });
  }, []);

  // Modals State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isESGModalOpen, setIsESGModalOpen] = useState(false);
  const [selectedFoodForClaim, setSelectedFoodForClaim] = useState(null);
  const [selectedFoodForVerify, setSelectedFoodForVerify] = useState(null);
  const [selectedFoodForESG, setSelectedFoodForESG] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(10);
  const [sortUrgentFirst, setSortUrgentFirst] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'donor' | 'volunteer'

  // ⏱️ Automated Expiry Sweeper (Delists unsafe / expiring surplus automatically)
  const [sweeperNotification, setSweeperNotification] = useState(null);

  useEffect(() => {
    const sweeperInterval = setInterval(() => {
      setFoodItems((prev) =>
        prev.map((item) => {
          if (item.status === 'Available' && item.isExpired) {
            return { ...item, status: 'Delisted / Expired' };
          }
          return item;
        })
      );
    }, 12000);

    return () => clearInterval(sweeperInterval);
  }, []);

  // Post Food Handler
  const handleAddFood = async (newItem) => {
    if (!user?.token) {
      alert('Please sign in as a Donor before posting food.');
      return;
    }
    try {
      const response = await createFoodListing({
        title: newItem.title,
        type: newItem.type,
        category: newItem.category,
        servings: newItem.servings,
        weightKg: newItem.weightKg,
        location: newItem.location,
        landmark: newItem.landmark,
        lat: newItem.coords?.[0],
        lng: newItem.coords?.[1],
        expiryHours: newItem.expiryHours,
        packagingStatus: newItem.packagingStatus,
        imageUrl: newItem.imageUrl,
      }, user.token);
      setFoodItems((prev) => [normalizeFoodItem(response.data), ...prev]);
    } catch (error) {
      alert(error.message);
    }
    setActiveTab('feed');
  };

  // Claim Food Handler
  const handleClaimClick = (item) => {
    if (!user) {
      setIsRoleModalOpen(true);
      return;
    }
    setSelectedFoodForClaim(item);
  };

  const handleConfirmClaim = async (foodId, claimDetails) => {
    if (!user?.token) {
      alert('Please sign in before claiming food.');
      return;
    }
    try {
      const response = await reserveFoodListing({
        foodListingId: foodId,
        vehicle: claimDetails.vehicle,
        eta: claimDetails.eta,
        notes: claimDetails.notes,
      }, user.token);
      const claimedItem = response.claim?.foodListingId === foodId;
      setFoodItems((prev) =>
        prev.map((item) => item.id === foodId ? {
          ...item,
          status: claimedItem ? 'Claimed' : 'Claimed',
          claimedBy: `${user.name || 'Volunteer'} (ETA: ${claimDetails.eta})`,
        } : item)
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // 2-Tier OTP Handlers
  const handlePickupSuccess = async (foodId, otp) => {
    if (!user?.token) throw new Error('Please sign in before verifying pickup.');
    await verifyPickupOtp({ foodListingId: foodId, otp }, user.token);
    setFoodItems((prev) =>
      prev.map((item) =>
        item.id === foodId
          ? { ...item, status: 'In-Transit', isPickedUp: true }
          : item
      )
    );
  };

  const handleDeliverySuccess = async (foodId, otp) => {
    if (!user?.token) throw new Error('Please sign in before verifying delivery.');
    await verifyDropoffOtp({ foodListingId: foodId, otp }, user.token);
    setFoodItems((prev) =>
      prev.map((item) =>
        item.id === foodId
          ? { ...item, status: 'Delivered', deliveredAt: new Date().toLocaleTimeString() }
          : item
      )
    );
  };

  // Perishability Filtering & Sorting Queue
  const filteredFoodItems = foodItems
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.donor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortUrgentFirst) {
        // Items with shorter shelf life float to top
        return (a.expiryHours || 10) - (b.expiryHours || 10);
      }
      return 0;
    });

  // Calculate live platform impact counters
  const totalMealsRescued = foodItems.reduce((acc, i) => acc + (i.servings || 20), 0);
  const activeRescuesCount = foodItems.filter((i) => i.status === 'Available').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 🌟 HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 text-white p-8 sm:p-12 shadow-2xl border border-emerald-800/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Food Redistribution & Live Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Bridge the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Surplus Food</span> & Hungry Lives.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Real-time rescue platform connecting banquet halls, restaurants, and caterers with verified volunteers and community kitchens using live GPS and Two-Tier OTP security.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {user?.role === 'Donor' ? (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95 text-xs sm:text-sm"
              >
                <Utensils className="w-4 h-4" />
                <span>Post Surplus Food Now</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95 text-xs sm:text-sm"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Join as Donor / Volunteer</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('map-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Explore Live Map</span>
            </button>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center sm:text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">{totalMealsRescued}+</p>
              <p className="text-[11px] font-semibold text-emerald-300">Meals Rescued Today</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">&lt; 35 min</p>
              <p className="text-[11px] font-semibold text-emerald-300">Average Pickup Time</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-[11px] font-semibold text-emerald-300">2-Tier OTP Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎛️ PORTAL VIEW TOGGLE TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Surplus Feed & Map</span>
          </button>

          <button
            onClick={() => setActiveTab('donor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'donor'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Donor Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'volunteer'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Volunteer Missions</span>
          </button>
        </div>

        {/* Post Button Quick Trigger */}
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Utensils className="w-4 h-4" />
          <span>+ Post Surplus Food</span>
        </button>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVE TAB */}
      {activeTab === 'donor' && (
        <DonorDashboard
          foodItems={foodItems}
          user={user}
          onOpenPostModal={() => setIsPostModalOpen(true)}
        />
      )}

      {activeTab === 'volunteer' && (
        <VolunteerDashboard
          foodItems={foodItems}
          user={user}
          onClaimFood={handleClaimClick}
          onOpenVerifyModal={(item) => setSelectedFoodForVerify(item)}
        />
      )}

      {activeTab === 'feed' && (
        <>
          {/* 🗺️ LIVE MAP SECTION */}
          <section id="map-section" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>Real-Time GPS Food Rescue Map</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualized donor pickup pins, active volunteer routes, and coverage radius.
                </p>
              </div>

              {/* Radius Filter Pills */}
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <span className="px-2 text-slate-500 text-[11px]">Radius:</span>
                {[2, 5, 10].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusFilter(r)}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      radiusFilter === r
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            <MapView
              foodItems={filteredFoodItems}
              currentUser={user}
              onClaimFood={handleClaimClick}
              activeClaimItem={foodItems.find((item) => item.status === 'Claimed')}
              radiusFilter={radiusFilter}
            />
          </section>

          {/* 🔍 SEARCH & FILTER CONTROLS */}
          <section className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by food type, dish, restaurant, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Dietary Filter Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Veg', 'Non-Veg', 'Packaged'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedType === type
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'Veg' ? '🥗 Veg' : type === 'Non-Veg' ? '🍗 Non-Veg' : type === 'Packaged' ? '📦 Packaged' : 'All Types'}
                  </button>
                ))}
              </div>

              {/* Urgency Toggle */}
              <button
                onClick={() => setSortUrgentFirst(!sortUrgentFirst)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                  sortUrgentFirst
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Urgent First</span>
              </button>
            </div>
          </section>

          {/* 🍲 ACTIVE SURPLUS FOOD LISTINGS GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Active Food Listings</h3>
                <p className="text-xs text-slate-500">
                  Prioritized by safe consumption window. Reserve immediately for pickup.
                </p>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {filteredFoodItems.length} Available Nearby
              </span>
            </div>

            {filteredFoodItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFoodItems.map((item) => {
                  const isUrgent = item.isUrgent || (item.expiryHours && item.expiryHours <= 2);
                  const isClaimed = item.status === 'Claimed';
                  const isDelivered = item.status === 'Delivered';

                  return (
                    <div
                      key={item.id}
                      className={`group bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
                        isDelivered ? 'opacity-70' : ''
                      }`}
                    >
                      {/* Image Preview & Badges */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md uppercase shadow-xs ${
                              item.type === 'Non-Veg'
                                ? 'bg-red-900/85 text-red-100 border border-red-500/30'
                                : 'bg-emerald-900/85 text-emerald-100 border border-emerald-500/30'
                            }`}
                          >
                            {item.type} • {item.category || 'Cooked'}
                          </span>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs flex items-center gap-1 ${
                              isDelivered
                                ? 'bg-emerald-600 text-white'
                                : isClaimed
                                ? 'bg-amber-500 text-white'
                                : isUrgent
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-slate-900/80 text-white'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{isDelivered ? 'Rescued' : isClaimed ? 'Claimed' : item.expiry}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content Card Body */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                            {item.title}
                          </h4>

                          <div className="mt-2 text-xs text-slate-500 space-y-1">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate text-slate-700 font-medium">{item.location}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Donor: <strong className="text-slate-700">{item.donor}</strong></span>
                            </p>
                            {item.landmark && (
                              <p className="text-[11px] text-slate-400 italic">
                                Note: {item.landmark}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Action */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Portions</p>
                            <p className="text-sm font-black text-emerald-700">{item.quantity}</p>
                          </div>

                          {isDelivered ? (
                            <button
                              onClick={() => {
                                setSelectedFoodForESG(item);
                                setIsESGModalOpen(true);
                              }}
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-200 transition-all"
                            >
                              <Award className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ESG Certificate</span>
                            </button>
                          ) : isClaimed ? (
                            <button
                              onClick={() => setSelectedFoodForVerify(item)}
                              className="text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify OTP</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleClaimClick(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1 active:scale-95"
                            >
                              <span>Claim Food</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Matching Surplus Food Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search criteria or switch to 'All Types' to explore all available surplus batches.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* 🚀 MODALS WORKFLOW */}
      <RoleSelectionModal />
      <LoginModal />

      <PostFoodModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitFood={handleAddFood}
      />

      <ClaimModal
        isOpen={Boolean(selectedFoodForClaim)}
        onClose={() => setSelectedFoodForClaim(null)}
        foodItem={selectedFoodForClaim}
        onConfirmClaim={handleConfirmClaim}
      />

      <DeliveryVerificationModal
        isOpen={Boolean(selectedFoodForVerify)}
        onClose={() => setSelectedFoodForVerify(null)}
        foodItem={selectedFoodForVerify}
        onPickupSuccess={handlePickupSuccess}
        onDeliverySuccess={handleDeliverySuccess}
      />

      <ESGCertificateModal
        isOpen={isESGModalOpen}
        onClose={() => setIsESGModalOpen(false)}
        foodItem={selectedFoodForESG}
        user={user}
      />
    </div>
  );
};

export default Home;