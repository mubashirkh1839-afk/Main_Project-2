import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { Heart, ShieldCheck, Leaf } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Clean Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-sm">
              🥗
            </span>
            <div>
              <p className="font-bold text-slate-200 text-sm">FoodRescue Platform</p>
              <p className="text-[11px] text-slate-500">Zero Waste • Zero Hunger Community Logistics</p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              2-Tier OTP Verified
            </span>
            <span className="flex items-center gap-1 text-teal-400">
              <Leaf className="w-3.5 h-3.5" />
              ESG Certified
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <Heart className="w-3.5 h-3.5" />
              Community Driven
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} FoodRescue Network. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;