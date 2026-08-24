import React from 'react';
import { Utensils, PlusCircle, ShieldCheck, Leaf, Heart, Package, Clock, MapPin, CheckCircle, FileText } from 'lucide-react';

function DonorDashboard({ foodItems = [], user, onOpenPostModal, onOpenAddModal }) {
  const handleOpen = onOpenPostModal || onOpenAddModal;

  // Filter donor's own listings (or demo listings)
  const donorItems = foodItems;

  const totalMeals = donorItems.reduce((acc, item) => acc + (item.servings || 20), 0);
  const totalWeight = donorItems.reduce((acc, item) => acc + (item.weightKg || 10), 0);
  const co2Saved = (totalWeight * 2.5).toFixed(1); // Estimated CO2 offset factor

  return (
    <div className="space-y-6">
      {/* Top Banner with Action */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold mb-2">
            <Utensils className="w-3.5 h-3.5" />
            <span>Donor Control Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.orgName || user?.name || 'Grand Banquet & Caterers'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Track active surplus food requests, display Pickup OTPs to incoming volunteers, and view your verified ESG impact.
          </p>
        </div>

        <button
          onClick={handleOpen}
          className="shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 text-sm"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>+ Post Surplus Food</span>
        </button>
      </div>

      {/* ESG Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meals Provided</p>
            <h3 className="text-2xl font-black text-slate-900">{totalMeals} Servings</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">To local shelters</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Food Rescued</p>
            <h3 className="text-2xl font-black text-slate-900">{totalWeight} kg</h3>
            <span className="text-[11px] text-teal-600 font-semibold">Zero waste to landfill</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-600 flex items-center justify-center font-bold">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ESG CO₂ Offset</p>
            <h3 className="text-2xl font-black text-slate-900">{co2Saved} kg CO₂</h3>
            <span className="text-[11px] text-lime-600 font-semibold">Verified tax credit</span>
          </div>
        </div>
      </div>

      {/* Active Listings Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="text-lg font-black text-slate-900">Your Active Surplus Dispatches</h3>
          <p className="text-xs text-slate-500">Provide the 4-digit pickup code when the volunteer arrives at your venue.</p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          {donorItems.length} Total Posts
        </span>
      </div>

      {/* Listings Grid with OTP display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {donorItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 relative hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                    item.type === 'Non-Veg'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {item.type || 'Veg'}
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">{item.title}</h4>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === 'Claimed'
                    ? 'bg-amber-100 text-amber-800'
                    : item.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{item.location}</span>
              </p>
              <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>{item.quantity}</span>
              </p>
            </div>

            {/* 🔑 OTP Handoff Section */}
            {item.status === 'Claimed' && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-800 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Volunteer Pickup OTP:</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">Show this 4-digit code to driver</p>
                </div>
                <div className="text-xl font-mono font-black bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 text-amber-900 shadow-xs tracking-widest">
                  {item.pickupOtp || '1234'}
                </div>
              </div>
            )}

            {item.status === 'Delivered' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Rescued & Delivered to Shelter</span>
                </div>
                <button
                  onClick={() => alert(`ESG Certificate generated for "${item.title}"! Total meals: ${item.quantity}`)}
                  className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
                >
                  <FileText className="w-3 h-3" />
                  <span>ESG Receipt</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonorDashboard;