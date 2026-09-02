import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, CheckCircle2, ArrowRight, Truck, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

function DeliveryVerificationModal({ isOpen, onClose, foodItem, onPickupSuccess, onDeliverySuccess }) {
  const [pickupInputOtp, setPickupInputOtp] = useState('');
  const [dropoffInputOtp, setDropoffInputOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !foodItem) return null;

  const isPickedUp = foodItem.isPickedUp || foodItem.status === 'In-Transit';

  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await onPickupSuccess(foodItem.id, pickupInputOtp);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleVerifyDropoff = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await onDeliverySuccess(foodItem.id, dropoffInputOtp);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log('Confetti trigger', err);
      }
      onClose();
    } catch (error) {
      setErrorMsg(error.message);
    }
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            2-Tier Verification Security
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Ensure tamper-proof food custody from Donor handoff to Receiver drop-off.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                isPickedUp ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
              }`}
            >
              {isPickedUp ? '✓' : '1'}
            </div>
            <span className="text-[11px] font-bold text-slate-700">Donor Pickup</span>
          </div>

          <div className={`flex-1 h-1 mx-2 rounded-full ${isPickedUp ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                isPickedUp ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50' : 'bg-slate-100 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-slate-500">NGO Drop-off</span>
          </div>
        </div>

        {/* Item Summary */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm truncate">{foodItem.title}</h4>
            <span className="font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px]">
              {foodItem.quantity}
            </span>
          </div>
          <p className="text-slate-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{foodItem.location}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: PICKUP OTP VERIFICATION */}
        {!isPickedUp ? (
          <form onSubmit={handleVerifyPickup} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
              <strong className="block font-bold mb-0.5">Step 1: Ask Donor for Pickup OTP</strong>
              <span>The food donor ({foodItem.donor}) has a 4-digit code on their screen. Enter it below to begin transit.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter Donor 4-Digit Pickup OTP
              </label>
              <input
                type="text"
                required
                maxLength="4"
                placeholder={foodItem.pickupOtp || '1234'}
                value={pickupInputOtp}
                onChange={(e) => setPickupInputOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center text-3xl font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="block text-center text-[11px] text-slate-400 mt-1">
                Demo Donor OTP: <strong className="text-emerald-700 font-bold">{foodItem.pickupOtp || '1234'}</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Verify Handoff & Start Transit</span>
            </button>
          </form>
        ) : (
          /* STEP 2: DROPOFF OTP VERIFICATION */
          <form onSubmit={handleVerifyDropoff} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900">
              <strong className="block font-bold mb-0.5">Step 2: Ask NGO Receiver for Drop-off OTP</strong>
              <span>You have reached the community shelter / NGO. Enter their 4-digit drop-off receipt code to complete delivery.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                Enter NGO 4-Digit Drop-off OTP
              </label>
              <input
                type="text"
                required
                maxLength="4"
                placeholder="5678"
                value={dropoffInputOtp}
                onChange={(e) => setDropoffInputOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center text-3xl font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="block text-center text-[11px] text-slate-400 mt-1">
                Demo NGO OTP: <strong className="text-emerald-700 font-bold">5678</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Complete Food Rescue & Verify</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default DeliveryVerificationModal;

