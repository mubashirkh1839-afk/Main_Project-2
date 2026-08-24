import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DonorDashboard from '../components/DonorDashboard';
import VolunteerDashboard from '../components/VolunteerDashboard';
import ESGCertificateModal from '../components/ESGCertificateModal';
import PostFoodModal from '../components/PostFoodModal';
import DeliveryVerificationModal from '../components/DeliveryVerificationModal';
import { 
  LayoutDashboard, 
  Utensils, 
  Bike, 
  Award, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  Heart, 
  Leaf, 
  Package, 
  Clock, 
  Sparkles,
  Phone,
  Building2,
  MapPin
} from 'lucide-react';

function Dashboard({ foodItems = [], onAddFood, onConfirmClaim, onPickupSuccess, onDeliverySuccess }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isESGModalOpen, setIsESGModalOpen] = useState(false);
  const [selectedVerifyItem, setSelectedVerifyItem] = useState(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
          🔐
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please log in to view your personalized dashboard and ESG sustainability metrics.
        </p>
        <Link
          to="/"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all hover:bg-emerald-700"
        >
          Return to Home & Login
        </Link>
      </div>
    );
  }

  // Calculate user stats
  const totalMeals = foodItems.reduce((acc, i) => acc + (i.servings || 20), 0);
  const totalWeight = foodItems.reduce((acc, i) => acc + (i.weightKg || 10), 0);
  const co2Saved = (totalWeight * 2.5).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Live Map</span>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Personal Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Manage your food rescue missions, pickup OTPs, and verified ESG certificates.
            </p>
          </div>
        </div>

        {user.role === 'Donor' && (
          <button
            onClick={() => setIsESGModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 hover:scale-105 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Generate ESG Certificate</span>
          </button>
        )}
      </div>

      {/* 📑 Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview & Stats', icon: LayoutDashboard },
          { 
            id: 'missions', 
            label: user.role === 'Donor' ? '🏢 My Surplus Listings' : '🛵 Active Missions', 
            icon: user.role === 'Donor' ? Utensils : Bike 
          },
          { id: 'esg', label: '📜 ESG & Tax Certificate', icon: Award },
          { id: 'profile', label: '👤 Profile Settings', icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchParams({ tab: tab.id });
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Welcome Card */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified {user.role} Account</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">{user.name}</h2>
              <p className="text-xs text-slate-300 max-w-lg">
                {user.orgName ? `${user.orgName} • ` : ''}{user.city || 'Kanpur, UP'} • Mobile: {user.phone}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center px-6">
              <p className="text-[10px] uppercase font-bold text-emerald-300">Trust & Safety Rating</p>
              <p className="text-3xl font-black text-white">4.9 ★</p>
              <span className="text-[10px] text-slate-300">100% On-Time Delivery</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Meals Rescued</p>
                <h3 className="text-2xl font-black text-slate-900">{totalMeals} Servings</h3>
                <span className="text-[11px] text-emerald-600 font-semibold">Fed needy families</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waste Prevented</p>
                <h3 className="text-2xl font-black text-slate-900">{totalWeight} kg</h3>
                <span className="text-[11px] text-teal-600 font-semibold">Zero waste to landfill</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-600 flex items-center justify-center font-bold">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CO₂ Carbon Offset</p>
                <h3 className="text-2xl font-black text-slate-900">{co2Saved} kg CO₂</h3>
                <span className="text-[11px] text-lime-600 font-semibold">Tax eligible offset</span>
              </div>
            </div>
          </div>

          {/* Embedded Role Panel */}
          {user.role === 'Donor' ? (
            <DonorDashboard
              foodItems={foodItems}
              user={user}
              onOpenPostModal={() => setIsPostModalOpen(true)}
            />
          ) : (
            <VolunteerDashboard
              foodItems={foodItems}
              user={user}
              onOpenVerifyModal={(item) => setSelectedVerifyItem(item)}
            />
          )}
        </div>
      )}

      {/* TAB 2: MISSIONS / LISTINGS */}
      {activeTab === 'missions' && (
        <div>
          {user.role === 'Donor' ? (
            <DonorDashboard
              foodItems={foodItems}
              user={user}
              onOpenPostModal={() => setIsPostModalOpen(true)}
            />
          ) : (
            <VolunteerDashboard
              foodItems={foodItems}
              user={user}
              onOpenVerifyModal={(item) => setSelectedVerifyItem(item)}
            />
          )}
        </div>
      )}

      {/* TAB 3: ESG CERTIFICATES */}
      {activeTab === 'esg' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">ESG Sustainability & Tax Certification</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Download your verified corporate/individual sustainability certificate proving {totalMeals} meals rescued and {co2Saved} kg carbon offset.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
            <p className="flex items-center justify-between">
              <strong className="text-slate-700">Recipient Organization:</strong>
              <span>{user.orgName || user.name}</span>
            </p>
            <p className="flex items-center justify-between">
              <strong className="text-slate-700">Audit Status:</strong>
              <span className="text-emerald-700 font-bold">✓ 100% 2-Tier OTP Verified</span>
            </p>
            <p className="flex items-center justify-between">
              <strong className="text-slate-700">Tax Exemption:</strong>
              <span className="text-slate-600">Eligible under Section 80G / CSR</span>
            </p>
          </div>

          <button
            onClick={() => setIsESGModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Open & Download Official Certificate (PDF)</span>
          </button>
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
          <h3 className="text-xl font-black text-slate-900">Profile Information</h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-400 uppercase">Full Name</p>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-400 uppercase">Registered Mobile</p>
                <p className="text-sm font-bold text-slate-900">{user.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-400 uppercase">Account Role</p>
                <p className="text-sm font-bold text-emerald-700">{user.role}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="font-bold text-slate-400 uppercase">City / Location</p>
                <p className="text-sm font-bold text-slate-900">{user.city || 'Kanpur'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <p className="font-bold text-slate-400 uppercase">Organization / Venue</p>
              <p className="text-sm font-bold text-slate-900">{user.orgName || 'Independent Contributor'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ESGCertificateModal
        isOpen={isESGModalOpen}
        onClose={() => setIsESGModalOpen(false)}
        user={user}
      />

      <PostFoodModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitFood={onAddFood}
      />

      <DeliveryVerificationModal
        isOpen={Boolean(selectedVerifyItem)}
        onClose={() => setSelectedVerifyItem(null)}
        foodItem={selectedVerifyItem}
        onPickupSuccess={onPickupSuccess}
        onDeliverySuccess={onDeliverySuccess}
      />
    </div>
  );
}

export default Dashboard;

