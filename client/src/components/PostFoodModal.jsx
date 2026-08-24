import React, { useState } from 'react';

function AddFoodModal({ isOpen, onClose, onAddFood }) {
  const [formData, setFormData] = useState({
    title: '',
    donor: 'Hotel Landmark, Kanpur',
    location: '',
    quantity: '',
    expiry: '2 Hours',
    lat: '26.4600',
    lng: '80.3200'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;

    onAddFood({
      id: Date.now(),
      title: formData.title,
      donor: formData.donor,
      location: formData.location,
      coords: [parseFloat(formData.lat), parseFloat(formData.lng)],
      quantity: formData.quantity || '10 Packs',
      expiry: formData.expiry,
      status: 'Available',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🍲</span> Post Surplus Food
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food Title</label>
            <input
              type="text"
              required
              placeholder="e.g., 25 Packs Surplus Veg Thali"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity</label>
              <input
                type="text"
                placeholder="e.g., 20 Servings"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry</label>
              <select
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
              >
                <option value="1 Hour">1 Hour</option>
                <option value="2 Hours">2 Hours</option>
                <option value="4 Hours">4 Hours</option>
                <option value="6 Hours">6 Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Location (Kanpur Area)</label>
            <input
              type="text"
              required
              placeholder="e.g., Kakadeo, Kanpur"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm">Publish Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFoodModal;