import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  LayoutDashboard, 
  Award, 
  Bike, 
  Utensils, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

function ProfileDropdown({ onOpenESGModal }) {
  const { user, logout, setRole, selectedRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleNavigateDashboard = (tab = 'overview') => {
    setIsOpen(false);
    navigate(`/dashboard?tab=${tab}`);
  };

  const handleRoleToggle = (newRole) => {
    setRole(newRole);
    user.role = newRole;
    localStorage.setItem('food_rescue_user', JSON.stringify({ ...user, role: newRole }));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 👤 Instagram Style Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all active:scale-95 focus:outline-hidden"
      >
        {/* Pulsing Green Ring Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>

        <div className="text-left hidden sm:block">
          <p className="font-bold text-slate-900 text-xs leading-tight truncate max-w-[110px]">
            {user.name}
          </p>
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
            {user.role}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 📱 Instagram/Google Style Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          
          {/* User Profile Header */}
          <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 border-b border-slate-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base shadow-md shadow-emerald-600/20 shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-slate-900 text-sm truncate leading-tight">
                {user.name}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">{user.phone || '+91 9876543210'}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-extrabold text-[10px]">
                {user.role}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 px-2 text-xs font-semibold text-slate-700 space-y-0.5">
            {/* 1. Open Full Dashboard */}
            <button
              onClick={() => handleNavigateDashboard('overview')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Open Full Dashboard</span>
            </button>

            {/* 2. Donor specific: ESG Certificate */}
            {user.role === 'Donor' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenESGModal) onOpenESGModal();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all text-left"
              >
                <Award className="w-4 h-4 text-teal-600" />
                <span>ESG Certificate & Tax Receipt</span>
              </button>
            )}

            {/* 3. Volunteer specific: Active Missions */}
            {user.role === 'Volunteer' && (
              <button
                onClick={() => handleNavigateDashboard('missions')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all text-left"
              >
                <Bike className="w-4 h-4 text-blue-600" />
                <span>My Active Missions</span>
              </button>
            )}

            {/* 4. Switch Role Quick Toggle */}
            <div className="pt-2 border-t border-slate-100 my-1">
              <p className="px-3.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>Quick Role Switch</span>
              </p>
              <div className="grid grid-cols-3 gap-1 px-1.5">
                {[
                  { role: 'Donor', icon: '🏢' },
                  { role: 'Volunteer', icon: '🛵' },
                  { role: 'NGO Receiver', icon: '🤝' },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleRoleToggle(item.role)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all ${
                      user.role === item.role
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{item.icon} {item.role.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Logout */}
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-red-50 text-red-600 font-bold transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;

