import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Phone, User, Building2, MapPin, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { isLoginModalOpen, setIsLoginModalOpen, selectedRole, login } = useAuth();
  const show = isOpen !== undefined ? isOpen : isLoginModalOpen;
  const handleClose = onClose || (() => setIsLoginModalOpen(false));

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: selectedRole || 'Volunteer',
    orgName: '',
    city: 'Kanpur',
    address: '',
    otp: '',
  });

  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    }
  }, [selectedRole]);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (formData.phone.length === 10 && formData.fullName) {
      setOtpSent(true);
    } else {
      alert('Please enter your Full Name and 10-digit Mobile Number.');
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (formData.otp.length === 4) {
      const userPayload = {
        name: formData.fullName,
        role: formData.role,
        phone: '+91' + formData.phone,
        email: formData.email || 'contact@foodrescue.org',
        orgName: formData.orgName,
        city: formData.city,
        address: formData.address,
      };

      if (onLoginSuccess) {
        onLoginSuccess(formData.phone, formData.role, userPayload);
      } else {
        login(userPayload);
      }
      setOtpSent(false);
      handleClose();
    } else {
      alert('Please enter the 4-digit verification OTP (Demo OTP: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {otpSent ? 'Enter Security OTP' : 'Join Food Rescue Network'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {otpSent
              ? `We sent a 4-digit verification code to +91 ${formData.phone}`
              : 'Complete your profile to start donating or claiming surplus meals.'}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                {[
                  { id: 'Donor', label: '🏢 Donor' },
                  { id: 'Volunteer', label: '🛵 Volunteer' },
                  { id: 'NGO Receiver', label: '🤝 NGO' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`py-2 px-1 rounded-xl transition-all text-center ${
                      formData.role === r.id
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Details Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Mubashir Ahmad"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Organization & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {formData.role === 'Donor'
                    ? 'Restaurant / Banquet'
                    : formData.role === 'NGO Receiver'
                    ? 'NGO / Trust Name'
                    : 'Volunteer Team'}
                </label>
                <input
                  type="text"
                  name="orgName"
                  placeholder={
                    formData.role === 'Donor'
                      ? 'e.g. Royal Palace'
                      : 'e.g. Robin Hood Army'
                  }
                  value={formData.orgName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Kanpur"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Local Area / Landmark *
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. Swaroop Nagar / Civil Lines, Kanpur"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Mobile Number *
              </label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-slate-50">
                <span className="bg-slate-100 text-slate-700 px-3.5 py-2.5 text-sm font-bold border-r border-slate-200 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-98"
            >
              Verify Profile & Get OTP
            </button>
          </form>
        ) : (
          /* OTP Verification View */
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{formData.fullName}</span>
                <span className="px-2 py-0.5 bg-emerald-200/60 text-emerald-800 rounded-md font-bold text-[10px]">
                  {formData.role}
                </span>
              </div>
              <p className="text-slate-500">OTP dispatched to +91 {formData.phone}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 text-center">
                Enter 4-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength="4"
                placeholder="1234"
                value={formData.otp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otp: e.target.value.replace(/\D/g, ''),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-center text-3xl font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo OTP: <strong className="text-emerald-700 font-bold">1234</strong></span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-2xl transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginModal;