import React from 'react';

function DonorDashboard({ foodItems, onOpenAddModal }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🏢 Donor Management Panel</h2>
          <p className="text-xs text-slate-500">Manage surplus food posts and track incoming NGO requests</p>
        </div>
        <button 
          onClick={onOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm"
        >
          + Post New Surplus Food
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foodItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <h4 className="font-bold text-slate-900">{item.title}</h4>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">{item.status}</span>
            </div>
            <p className="text-xs text-slate-600">📍 Location: {item.location}</p>
            <p className="text-xs text-slate-600">📦 Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonorDashboard;