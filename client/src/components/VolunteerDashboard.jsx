import React from 'react';

function VolunteerDashboard({ foodItems, onClaimClick }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">🛵 Volunteer Rescue Panel</h2>
        <p className="text-xs text-slate-500">Claim available listings and route to pickup locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {foodItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900">{item.title}</h4>
            <p className="text-xs text-slate-600">🏢 Donor: {item.donor}</p>
            <p className="text-xs text-slate-600">📍 Pickup: {item.location}</p>
            <button
              disabled={item.status === 'Claimed'}
              onClick={() => onClaimClick(item)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:bg-slate-100 disabled:text-slate-400"
            >
              {item.status === 'Claimed' ? 'Already Claimed' : 'Claim for Rescue'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VolunteerDashboard;