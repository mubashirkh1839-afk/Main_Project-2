import React, { useState } from 'react';
import { X, Clock, Truck, ShieldCheck, MapPin, CheckCircle, Bike, Car } from 'lucide-react';

function ClaimModal({ isOpen, onClose, foodItem, onConfirmClaim }) {
  const [eta, setEta] = useState('30 mins');
  const [vehicle, setVehicle] = useState('Motorbike / Scooter');
  const [notes, setNotes] = useState('');

  if (!isOpen || !foodItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmClaim(foodItem.id, {
      eta,
      vehicle,
      notes: notes || `${vehicle} - ETA ${eta}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Claim Surplus Food</h3>
            <p className="text-xs text-slate-500">
              Reserve this batch for immediate pickup and delivery to a verified shelter.
            </p>
          </div>
        </div>

        {/* Food Item Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm truncate">{foodItem.title}</h4>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              {foodItem.quantity}
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{foodItem.location}</span>
            </p>
            <p className="text-slate-500">🏢 Donated by: <strong className="text-slate-700">{foodItem.donor}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ETA Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Estimated Arrival Time (ETA)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['15 mins', '30 mins', '45 mins'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setEta(time)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    eta === time
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚡ {time}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transport Vehicle
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Two Wheeler', val: 'Motorbike / Scooter' },
                { label: 'Auto / E-Rick', val: 'Auto / E-Rickshaw' },
                { label: 'Car / Van', val: 'Car / Delivery Van' },
              ].map((v) => (
                <button
                  key={v.val}
                  type="button"
                  onClick={() => setVehicle(v.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    vehicle === v.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Volunteer Notes / NGO Name
            </label>
            <input
              type="text"
              placeholder="e.g. Robin Hood Army Volunteer Team"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>

          {/* OTP Briefing */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Once confirmed, this listing is locked for you. When you reach the donor,
              ask for their **4-digit Pickup OTP** to start the delivery.
            </p>
          </div>

          {/* Actions */}
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
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-98"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Lock Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimModal;