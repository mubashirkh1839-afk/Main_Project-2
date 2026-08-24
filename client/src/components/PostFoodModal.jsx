import React, { useState } from 'react';
import { X, Utensils, Clock, MapPin, Camera, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function PostFoodModal({ isOpen, onClose, onSubmitFood }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooked Meals',
    type: 'Veg',
    servings: '25',
    weightKg: '12',
    preparedTime: '1 hour ago',
    expiryHours: 3,
    packagingStatus: 'Packed in Disposable Containers',
    location: user?.address || 'Swaroop Nagar, Kanpur',
    landmark: 'Near Central Bank',
    coords: [26.4722, 80.3090],
    notes: 'Kept warm in insulated thermal box. Clean and freshly prepared.',
    imagePreview: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  });

  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleAutoLocate = () => {
    if (!('geolocation' in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          coords: [pos.coords.latitude, pos.coords.longitude],
        }));
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleImageMock = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imagePreview: url }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;

    // Generate unique 4-digit pickup OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newFoodItem = {
      id: 'food_' + Date.now(),
      title: formData.title,
      donor: user?.orgName || user?.name || 'Grand Banquet Hall',
      donorPhone: user?.phone || '+919876543210',
      category: formData.category,
      type: formData.type,
      quantity: `${formData.servings} Servings (~${formData.weightKg} kg)`,
      servings: parseInt(formData.servings, 10),
      weightKg: parseFloat(formData.weightKg),
      preparedTime: formData.preparedTime,
      expiryHours: parseInt(formData.expiryHours, 10),
      expiry: `Expires in ${formData.expiryHours} hours`,
      packagingStatus: formData.packagingStatus,
      location: formData.location,
      landmark: formData.landmark,
      coords: formData.coords,
      notes: formData.notes,
      imageUrl: formData.imagePreview,
      status: 'Available',
      pickupOtp: generatedOtp,
      createdAt: new Date().toISOString(),
      claimedBy: null,
    };

    onSubmitFood(newFoodItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Post Surplus Food</h3>
            <p className="text-xs text-slate-500">
              List extra edible food to notify nearby volunteers & NGOs in real time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Food Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Food Title / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 25 Fresh Thalis (Paneer Curry, Dal, Rice, Rotis)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dietary Type
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                {['Veg', 'Non-Veg', 'Packaged'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`py-1.5 rounded-lg transition-all text-center ${
                      formData.type === t
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {t === 'Veg' ? '🥗 Veg' : t === 'Non-Veg' ? '🍗 Non-Veg' : '📦 Dry'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              >
                <option value="Cooked Meals">Cooked Meals / Buffet</option>
                <option value="Bakery / Breads">Bakery & Breads</option>
                <option value="Fresh Fruits / Veggies">Fresh Fruits & Raw Produce</option>
                <option value="Packaged / Canned">Packaged & Dry Rations</option>
              </select>
            </div>
          </div>

          {/* Quantity & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Servings *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Approx Weight (kg)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
          </div>

          {/* Shelf Life & Prepared Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Prepared Time
              </label>
              <input
                type="text"
                placeholder="e.g. 1 hour ago (1:30 PM)"
                value={formData.preparedTime}
                onChange={(e) => setFormData({ ...formData, preparedTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Safe Consumption Window
              </label>
              <select
                value={formData.expiryHours}
                onChange={(e) => setFormData({ ...formData, expiryHours: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              >
                <option value={1}>1 Hour (Urgent Priority)</option>
                <option value={2}>2 Hours (High Priority)</option>
                <option value={3}>3 Hours (Standard)</option>
                <option value={5}>5 Hours</option>
                <option value={12}>12+ Hours (Dry / Packaged)</option>
              </select>
            </div>
          </div>

          {/* Packaging & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Packaging Condition
              </label>
              <select
                value={formData.packagingStatus}
                onChange={(e) => setFormData({ ...formData, packagingStatus: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              >
                <option value="Packed in Disposable Containers">Packed in Boxes / Containers</option>
                <option value="Large Buffet Pots (Bring Vessels)">Large Pots (Bring Vessels)</option>
                <option value="Sealed Packets">Factory Sealed Packets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Landmark / Gate Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Gate 2, Kitchen Loading Bay"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-medium focus:outline-hidden"
              />
            </div>
          </div>

          {/* Location with Auto-GPS Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Pickup Location Address *
              </label>
              <button
                type="button"
                onClick={handleAutoLocate}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>{isLocating ? 'Pinning...' : 'Use Current GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Swaroop Nagar, Mall Road, Kanpur"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:outline-hidden"
            />
          </div>

          {/* Image Upload Simulator */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              Food Condition Proof (Photo)
            </label>
            <div className="flex items-center gap-3">
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              )}
              <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-600 font-semibold text-center transition-all">
                <span>Upload Food Photo</span>
                <input type="file" accept="image/*" onChange={handleImageMock} className="hidden" />
              </label>
            </div>
          </div>

          {/* Notice & Security */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              When a volunteer claims this post, a **4-digit Pickup OTP** will be assigned to you.
              Only hand over food after matching the OTP.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-98 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Surplus Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostFoodModal;