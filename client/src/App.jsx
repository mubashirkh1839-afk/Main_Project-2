import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MapView from './components/MapView';
import ClaimModal from './components/ClaimModal';
import AddFoodModal from './components/AddFoodModal';
import LoginModal from './components/LoginModal';

function App() {
  const { user, loginWithOtp, logout } = useAuth();
  const location = useLocation();
  const [filter, setFilter] = useState('All');

  const [foodItems, setFoodItems] = useState([
    {
      id: 1,
      title: '20 Meals (Paneer Curry & Rice)',
      donor: 'Hotel Landmark, Kanpur',
      location: 'Mall Road, Kanpur',
      coords: [26.4670, 80.3500],
      quantity: '20 Packs',
      expiry: '3 Hours',
      status: 'Available',
    },
    {
      id: 2,
      title: '15 Servings Fresh Biryani',
      donor: 'Zomato Kitchen',
      location: 'Swaroop Nagar, Kanpur',
      coords: [26.4720, 80.3180],
      quantity: '15 Packs',
      expiry: '2 Hours',
      status: 'Claimed',
      claimDetails: { eta: '20 mins', notes: 'NGO Bike Pickup' }
    }
  ]);

  const [selectedFood, setSelectedFood] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleClaimClick = (item) => {
    setSelectedFood(item);
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = (foodId, claimDetails) => {
    setFoodItems(prev =>
      prev.map(item =>
        item.id === foodId ? { ...item, status: 'Claimed', claimDetails } : item
      )
    );
  };

  const handleAddFood = (newItem) => {
    setFoodItems(prev => [newItem, ...prev]);
  };

  const filteredItems = foodItems.filter(item => {
    if (filter === 'Available') return item.status === 'Available';
    if (filter === 'Claimed') return item.status === 'Claimed';
    return true;
  });

  const isActive = (path) => location.pathname === path ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      
      {/* Header with Navigation Links */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🍲</span>
              <h1 className="text-xl font-bold text-emerald-600 tracking-tight">
                FoodRescue Kanpur
              </h1>
            </Link>

            {/* Navigation Pages Links */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold">
              <Link to="/" className={`px-3 py-2 rounded-xl transition-all ${isActive('/')}`}>
                🗺️ Live GPS Map
              </Link>
              <Link to="/donor" className={`px-3 py-2 rounded-xl transition-all ${isActive('/donor')}`}>
                🏢 Donor Dashboard
              </Link>
              <Link to="/volunteer" className={`px-3 py-2 rounded-xl transition-all ${isActive('/volunteer')}`}>
                🛵 Volunteer Dashboard
              </Link>
            </nav>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {user.role}
                </span>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {user?.name?.[0] || 'M'}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-slate-700">{user?.name}</span>
                  <button 
                    onClick={logout}
                    className="ml-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all"
              >
                Log In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages Setup */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!user ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-4">
            <span className="text-4xl">🔐</span>
            <h3 className="text-lg font-bold text-slate-900">Authentication Required</h3>
            <p className="text-sm text-slate-600">Please log in via Mobile OTP to access real-time rescue coordinates and multi-dashboard tools.</p>
            <button 
              onClick={() => setIsLoginModalOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all"
            >
              Log In / Register Profile
            </button>
          </div>
        ) : (
          <Routes>
            
            {/* PAGE 1: Home Map Page */}
            <Route path="/" element={
              <div className="space-y-6">
                <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Zero Hunger, Zero Waste 🌿</h2>
                    <p className="text-emerald-100 text-sm mt-1">Live Map showing Donor and Receiver rescue points in Kanpur.</p>
                  </div>
                </div>

                <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span>🗺️</span> Real-Time Live Rescue Coordinates Map
                  </h3>
                  <MapView foodItems={filteredItems} currentUser={user} />
                </section>
              </div>
            } />

            {/* PAGE 2: Donor Dashboard */}
            <Route path="/donor" element={
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">🏢 Donor Management Panel</h2>
                    <p className="text-xs text-slate-500">Post extra food and manage claims from local NGOs</p>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs"
                  >
                    + Post Surplus Food
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {foodItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">{item.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">📍 Location: {item.location}</p>
                      <p className="text-xs text-slate-600">📦 Quantity: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            } />

            {/* PAGE 3: Volunteer Dashboard */}
            <Route path="/volunteer" element={
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">🛵 Volunteer Rescue Panel</h2>
                    <p className="text-xs text-slate-500">Browse available food and send dispatch claims</p>
                  </div>
                  <div className="flex gap-2 text-xs font-bold">
                    {['All', 'Available', 'Claimed'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-lg border transition-all ${
                          filter === status ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                      <div className="mb-4">
                        <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-600">🏢 Donor: {item.donor}</p>
                        <p className="text-xs text-slate-600">📍 Pickup: {item.location}</p>
                      </div>
                      <button
                        disabled={item.status === 'Claimed'}
                        onClick={() => handleClaimClick(item)}
                        className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {item.status === 'Claimed' ? 'Already Claimed' : 'Claim Food'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            } />

          </Routes>
        )}
      </main>

      {/* Modals */}
      <ClaimModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} foodItem={selectedFood} onConfirmClaim={handleConfirmClaim} />
      <AddFoodModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddFood={handleAddFood} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={loginWithOtp} />
    </div>
  );
}

export default App;