import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { Utensils, MapPin, LayoutDashboard, PlusCircle, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenPostModal, onOpenESGModal }) => {
  const { user, setIsLoginModalOpen, setIsRoleModalOpen } = useAuth();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1">
                FoodRescue <span className="text-emerald-600 font-extrabold text-sm px-1.5 py-0.5 bg-emerald-50 rounded-md border border-emerald-200">LIVE</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-400 -mt-0.5">Surplus Redistribution</p>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-600">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl transition-all ${
                isCurrent('/') ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Surplus Feed
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  isCurrent('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user?.role === 'Donor' && onOpenPostModal && (
            <button
              onClick={onOpenPostModal}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Surplus</span>
            </button>
          )}

          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          ) : (
            /* 👤 Instagram Style Profile Dropdown Trigger */
            <ProfileDropdown onOpenESGModal={onOpenESGModal} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;