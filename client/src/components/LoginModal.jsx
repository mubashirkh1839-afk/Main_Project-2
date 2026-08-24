import React, { useState } from 'react';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Volunteer',
    orgName: '', // NGO / Hotel Name
    city: 'Kanpur',
    address: '',
    otp: ''
  });

  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (formData.phone.length === 10 && formData.fullName) {
      setOtpSent(true);
    } else {
      alert('Kripya apna Full Name aur 10-digit Mobile Number dalein.');
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (formData.otp.length === 4) {
      onLoginSuccess(formData.phone, formData.role, formData);
      setOtpSent(false);
      onClose();
    } else {
      alert('4-digit OTP dalein (Demo OTP: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-3xl">🌿</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            Join FoodRescue Kanpur
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete your profile to start rescuing surplus food across Kanpur
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Volunteer' })}
                  className={`py-2 rounded-lg transition-all ${formData.role === 'Volunteer' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                >
                  🙋‍♂️ Volunteer / NGO
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'Donor' })}
                  className={`py-2 rounded-lg transition-all ${formData.role === 'Donor' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                >
                  🏢 Food Donor / Hotel
                </button>
              </div>
            </div>

            {/* Personal Details Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Mubashir Ahmad"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="mubashir@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Organization & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {formData.role === 'Donor' ? 'Hotel / Restaurant Name' : 'NGO / Team Name'}
                </label>
                <input
                  type="text"
                  name="orgName"
                  placeholder={formData.role === 'Donor' ? 'e.g. Landmark Hotel' : 'e.g. Robin Hood Army'}
                  value={formData.orgName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  disabled
                  value={formData.city}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Local Address / Locality *
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. Kakadeo / Swaroop Nagar, Kanpur"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20">
                <span className="bg-slate-100 text-slate-600 px-3.5 py-2 text-sm font-bold border-r border-slate-200 flex items-center">+91</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength="10"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all mt-2"
            >
              Verify Profile & Send OTP
            </button>
          </form>
        ) : (
          /* OTP Verification View */
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong className="text-slate-800">Name:</strong> {formData.fullName}</p>
              <p><strong className="text-slate-800">Role:</strong> {formData.role}</p>
              <p><strong className="text-slate-800">Phone:</strong> +91 {formData.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 text-center">
                Enter 4-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength="4"
                placeholder="1234"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-2xl font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="block text-center text-[11px] text-slate-400 mt-1">Demo Code: <strong className="text-slate-700">1234</strong></span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl"
              >
                Edit Info
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Complete Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginModal;