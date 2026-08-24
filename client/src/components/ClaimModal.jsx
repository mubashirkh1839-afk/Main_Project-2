import React, { useState } from 'react';

function ClaimModal({ isOpen, onClose, foodItem, onConfirmClaim }) {
  const [eta, setEta] = useState('30 mins');
  const [notes, setNotes] = useState('');

  if (!isOpen || !foodItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmClaim(foodItem.id, { eta, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🙋‍♂️</span> Confirm Food Claim
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-1">
          <h4 className="font-bold text-slate-900 text-sm">{foodItem.title}</h4>
          <p className="text-xs text-slate-600">🏢 Donor: {foodItem.donor}</p>
          <p className="text-xs text-slate-600">📍 Pickup: {foodItem.location}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Estimated Arrival Time (ETA)</label>
            <select 
              value={eta} 
              onChange={(e) => setEta(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="15 mins">15 Minutes</option>
              <option value="30 mins">30 Minutes</option>
              <option value="45 mins">45 Minutes</option>
              <option value="1 hour+">1 Hour or more</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Pickup Details / Vehicle</label>
            <input
              type="text"
              placeholder="e.g., Arriving on bike / NGO Van"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm">Confirm & Reserve</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimModal;