import React from 'react';
import { Bike, Truck, Navigation, ShieldCheck, Clock, MapPin, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

function VolunteerDashboard({ foodItems = [], user, onClaimFood, onOpenVerifyModal, onClaimClick }) {
  const handleClaim = onClaimFood || onClaimClick;

  const claimedMissions = foodItems.filter((i) => i.status === 'Claimed' || i.status === 'In-Transit');
  const availableItems = foodItems.filter((i) => i.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold mb-2">
            <Bike className="w-3.5 h-3.5" />
            <span>Volunteer Logistics Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.name ? `${user.name}'s Missions` : 'Volunteer Dispatch Center'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Claim urgent surplus food nearby, navigate pickup routes with Leaflet GPS, and secure custody with Two-Tier OTPs.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
          <div className="text-center px-3 border-r border-white/20">
            <p className="text-[10px] uppercase font-bold text-blue-200">Active Missions</p>
            <p className="text-2xl font-black">{claimedMissions.length}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-[10px] uppercase font-bold text-blue-200">Available Nearby</p>
            <p className="text-2xl font-black text-emerald-300">{availableItems.length}</p>
          </div>
        </div>
      </div>

      {/* 🚀 Active Ongoing Missions Tracker */}
      {claimedMissions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <h3 className="text-lg font-black text-slate-900">Active Pickup in Progress</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimedMissions.map((item) => (
              <div
                key={item.id}
                className="bg-amber-50/70 rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-3 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md uppercase">
                      In Progress ({item.status})
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">{item.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
                    {item.quantity}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pickup: <strong className="text-slate-800">{item.location}</strong></span>
                  </p>
                  <p className="text-slate-500">🏢 Donor Contact: <strong className="text-slate-700">{item.donor}</strong></p>
                </div>

                {/* Verification CTA */}
                <button
                  onClick={() => onOpenVerifyModal && onOpenVerifyModal(item)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP (Donor Handoff & NGO Drop-off)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Food Listings */}
      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-black text-slate-900">Available Surplus to Claim</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      item.type === 'Non-Veg'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.type || 'Veg'}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.expiry}</span>
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </p>
                <p className="text-xs text-slate-500">🏢 Donor: {item.donor}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-700">{item.quantity}</span>
                <button
                  onClick={() => handleClaim(item)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>Claim</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;