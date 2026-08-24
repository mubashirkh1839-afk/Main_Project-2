import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, Building2, X, ArrowRight, Shield } from 'lucide-react';

const RoleSelectionModal = () => {
  const { isRoleModalOpen, setIsRoleModalOpen, setRole, setIsLoginModalOpen } = useAuth();

  if (!isRoleModalOpen) return null;

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsRoleModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const roles = [
    {
      id: 'Donor',
      title: 'Food Donor',
      subtitle: 'Restaurants, Banquets, Caterers & Host',
      desc: 'Post surplus edible meals with pickup location, photos, and get 4-digit pickup OTP.',
      icon: Utensils,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Reduce Waste',
    },
    {
      id: 'Volunteer',
      title: 'Volunteer Driver',
      subtitle: 'Community Heroes & Drivers',
      desc: 'Discover nearby food on live GPS map, claim pickups, verify OTP, and transport to NGOs.',
      icon: HeartHandshake,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Make an Impact',
    },
    {
      id: 'NGO Receiver',
      title: 'NGO / Community Kitchen',
      subtitle: 'Shelters, Orphanages & Food Banks',
      desc: 'Accept verified food deliveries, issue drop-off OTP, and feed needy families.',
      icon: Building2,
      color: 'from-purple-500 to-pink-600',
      badge: 'Feed Communities',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsRoleModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Join Verified Network</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How would you like to contribute?
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Choose your role to get tailored dashboards, GPS routing, and instant verification tools.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectRole(item.id)}
                className="group relative cursor-pointer bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-emerald-500 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Continue as {item.id}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an active account?{' '}
          <button
            onClick={() => {
              setIsRoleModalOpen(false);
              setIsLoginModalOpen(true);
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            Quick Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;