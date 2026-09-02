import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, Search, MapPin, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';

// Fix Default Leaflet Marker Icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🟢 Custom Pulse Live Location Marker
const createLiveIcon = (label = 'You') =>
  L.divIcon({
    className: 'custom-live-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <span style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #10b981;
          border-radius: 50%;
          opacity: 0.6;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>
        <span style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          background-color: #059669;
          border: 2.5px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        "></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

// 📍 Custom Food Marker by Status & Type
const createFoodIcon = (item) => {
  const isUrgent = item.isUrgent || (item.expiryHours && item.expiryHours <= 2);
  const isClaimed = item.status === 'Claimed';
  const isDelivered = item.status === 'Delivered';

  const bgColor = isDelivered ? '#059669' : isClaimed ? '#d97706' : isUrgent ? '#dc2626' : '#2563eb';
  const emoji = item.type === 'Non-Veg' ? '🍗' : item.type === 'Packaged' ? '📦' : '🥗';

  return L.divIcon({
    className: 'custom-food-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        border: 2px solid white;
        border-radius: 9999px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span>${emoji}</span>
        <span>${item.quantity || 'Food'}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [0, 0],
  });
};

// 🎮 Controller to smoothly fly to updated coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

function MapView({ foodItems = [], currentUser, onClaimFood, activeClaimItem, radiusFilter = 10 }) {
  // Default fallback center (Kanpur, India or general coordinates)
  const defaultCenter = [26.4499, 80.3319];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Detecting GPS...');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [remoteVolunteerLocation, setRemoteVolunteerLocation] = useState(null);

  useEffect(() => {
    if (!activeClaimItem?.id) return undefined;

    const socket = io(window.location.origin);
    const missionId = activeClaimItem.id;
    socket.emit('join_mission_room', missionId);
    socket.on('volunteer_position', (position) => {
      setRemoteVolunteerLocation([position.lat, position.lng]);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeClaimItem?.id]);

  useEffect(() => {
    if (currentUser?.role !== 'Volunteer' || !activeClaimItem?.id || !navigator.geolocation) return undefined;

    const socket = io(window.location.origin);
    const watchId = navigator.geolocation.watchPosition((position) => {
      socket.emit('volunteer_location_update', {
        missionId: activeClaimItem.id,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
      });
    }, undefined, { enableHighAccuracy: true, maximumAge: 5000 });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.disconnect();
    };
  }, [activeClaimItem?.id, currentUser?.role]);

  // 1. Get accurate location on mount
  const locateUser = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('GPS not supported');
      return;
    }

    setLocationStatus('Locating GPS...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setLocationStatus('GPS Locked (High Accuracy)');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationStatus('Using fallback location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  // 2. Search address using OpenStreetMap Nominatim
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const newCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(newCoords);
        setUserLocation(newCoords);
        setLocationStatus(`Pushed to: ${data[0].display_name.split(',')[0]}`);
      } else {
        alert('Location not found. Please try a different locality name.');
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100">
      {/* 🔍 Top Floating HUD Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Address Search Form */}
        <form
          onSubmit={handleSearchAddress}
          className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200 max-w-sm w-full"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search your area / landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 outline-hidden bg-transparent"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="ml-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-xl transition-all disabled:opacity-50"
          >
            {isSearching ? '...' : 'Go'}
          </button>
        </form>

        {/* GPS Status & Locate Me Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{locationStatus}</span>
          </div>

          <button
            onClick={locateUser}
            title="Recenter to my live GPS location"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-md transition-all active:scale-95"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Locate Me</span>
          </button>
        </div>
      </div>

      {/* 🗺️ Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} zoom={14} />

        {/* 🟢 Live User Location Marker & Radius Circle */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createLiveIcon(currentUser?.name || 'You')}>
              <Popup>
                <div className="p-1 text-xs">
                  <div className="flex items-center gap-1 text-emerald-600 font-bold mb-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Your Location</span>
                  </div>
                  <p className="text-slate-600">
                    {currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Active GPS Signal'}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Radius Coverage Visualizer */}
            {radiusFilter && (
              <Circle
                center={userLocation}
                radius={radiusFilter * 1000}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 8',
                }}
              />
            )}
          </>
        )}

        {remoteVolunteerLocation && (
          <Marker position={remoteVolunteerLocation} icon={createLiveIcon('Volunteer')}>
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-blue-600">Live Volunteer Location</strong>
                <p className="text-slate-600">Updated in real time</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 🏢 Food Listings Markers */}
        {foodItems.map((item) => {
          if (!item.coords || !Array.isArray(item.coords) || item.coords.length !== 2) return null;
          return (
            <Marker
              key={item.id}
              position={item.coords}
              icon={createFoodIcon(item)}
              eventHandlers={{
                click: () => setSelectedListing(item),
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs font-sans text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-900 truncate">{item.title}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        item.type === 'Non-Veg'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Donor: {item.donor}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-emerald-700 font-bold">{item.quantity}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Claimed'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {item.status === 'Available' && onClaimFood && (
                    <button
                      onClick={() => onClaimFood(item)}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-xl text-center shadow-xs transition-all"
                    >
                      ⚡ Claim for Pickup
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 🛣️ Live Route Line for Active Delivery */}
        {activeClaimItem?.coords && userLocation && (
          <Polyline
            positions={[userLocation, activeClaimItem.coords]}
            color="#2563eb"
            weight={4}
            dashArray="6, 8"
          />
        )}
      </MapContainer>

      {/* 🧭 Bottom Left Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Claimed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Urgent</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;