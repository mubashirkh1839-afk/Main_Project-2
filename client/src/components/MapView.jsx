import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔵 Custom Pulse Live Location Marker
const liveUserIcon = L.divIcon({
  className: 'custom-live-marker',
  html: `
    <div style="position: relative; width: 20px; height: 20px;">
      <span style="
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #10b981;
        border-radius: 50%;
        opacity: 0.75;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></span>
      <span style="
        position: relative;
        display: block;
        width: 14px;
        height: 14px;
        margin: 3px;
        background-color: #059669;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(0,0,0,0.4);
      "></span>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Fix Default Leaflet Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapView({ foodItems = [], currentUser }) {
  const [liveCoords, setLiveCoords] = useState(null);
  const defaultKanpurCenter = [26.4499, 80.3319];

  useEffect(() => {
    let watchId;

    if ('geolocation' in navigator) {
      // Real-time Live Tracking using watchPosition
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveCoords([latitude, longitude]);
        },
        (error) => {
          console.warn('Live GPS Error:', error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const activeCenter = liveCoords || currentUser?.coords || defaultKanpurCenter;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      
      {/* Dynamic Key so map recenters automatically on live signal */}
      <MapContainer 
        center={activeCenter} 
        zoom={14} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🟢 Live Pulsing User Location Pin */}
        {liveCoords && (
          <Marker position={liveCoords} icon={liveUserIcon}>
            <Popup>
              <div className="font-sans text-xs">
                <strong className="text-emerald-600 block font-bold">🟢 Live Location Active</strong>
                <span>{currentUser?.name || 'User'} ({currentUser?.role || 'Volunteer'})</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Updated Real-Time via GPS</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 🏢 Food Items Markers */}
        {foodItems.map((item) => (
          <Marker key={item.id} position={item.coords}>
            <Popup>
              <div className="font-sans text-xs space-y-1">
                <strong className="text-slate-900 font-bold">{item.title}</strong><br />
                <span>🏢 {item.donor}</span><br />
                <span>📍 {item.location}</span><br />
                <span className="text-emerald-600 font-semibold">Status: {item.status}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🛣️ Animated Polyline connecting Live Location to nearest Food Item */}
        {liveCoords && foodItems[0]?.coords && (
          <Polyline 
            positions={[liveCoords, foodItems[0].coords]} 
            color="#059669" 
            weight={4} 
            dashArray="6, 10" 
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;