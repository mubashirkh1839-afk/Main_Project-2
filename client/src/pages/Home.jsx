import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PostFoodModal from '../components/PostFoodModal';
import ClaimModal from '../components/ClaimModal';
import DonorDashboard from '../components/DonorDashboard';
import VolunteerDashboard from '../components/VolunteerDashboard';
import MapView from '../components/MapView';

const INITIAL_FOOD_ITEMS = [
  {
    id: 1,
    title: 'Surplus Lunch Thalis (20 Portions)',
    donor: 'Royal Palace Banquet',
    type: 'Veg',
    location: 'Swaroop Nagar, Kanpur',
    coords: [26.4722, 80.3090],
    expiry: 'Expires in 3 hours',
    status: 'Available',
    claimedBy: null,
  },
  {
    id: 2,
    title: 'Fresh Packaged Sandwiches & Fruits',
    donor: 'Green Cafe',
    type: 'Veg',
    location: 'Kalyanpur, Kanpur',
    coords: [26.5123, 80.2326],
    expiry: 'Expires in 5 hours',
    status: 'Available',
    claimedBy: null,
  },
  {
    id: 3,
    title: 'Chicken Biryani & Side Dishes (15 Portions)',
    donor: 'Spicy Grill Restaurant',
    type: 'Non-Veg',
    location: 'Civil Lines, Kanpur',
    coords: [26.4680, 80.3508],
    expiry: 'Expires in 2 hours',
    status: 'Available',
    claimedBy: null,
  },
];

const Home = () => {
  const { user, setIsRoleModalOpen, setIsLoginModalOpen } = useAuth();
  const [foodItems, setFoodItems] = useState(INITIAL_FOOD_ITEMS);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedFoodForClaim, setSelectedFoodForClaim] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const handleAddFood = (newItem) => {
    // Ensuring new item matches existing object schema
    const formattedItem = {
      id: Date.now(),
      title: newItem.title || 'Surplus Food',
      donor: user?.name || 'Anonymous Donor',
      type: newItem.foodType || 'Veg',
      location: newItem.location || 'Kanpur',
      coords: [26.4722 + (Math.random() - 0.5) * 0.05, 80.3090 + (Math.random() - 0.5) * 0.05], // Random coords near Kanpur
      expiry: `Expires in ${newItem.expiry || '2 hours'}`,
      status: 'Available',
      claimedBy: null,
    };
    setFoodItems([formattedItem, ...foodItems]);
  };

  const handleClaimClick = (item) => {
    if (!user?.phone) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedFoodForClaim(item);
  };

  const handleConfirmClaim = (foodId, claimDetails) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item.id === foodId
          ? {
              ...item,
              status: 'Claimed',
              claimedBy: `${user?.name || 'Volunteer'} (ETA: ${claimDetails.eta})`,
            }
          : item
      )
    );
  };

  const handleMarkDelivered = (foodId) => {
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item.id === foodId
          ? {
              ...item,
              status: 'Delivered',
            }
          : item
      )
    );
  };

  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All' || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Bridge the Gap Between Surplus & Need
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Real-time food rescue platform connecting local donors with active volunteers and NGOs.
        </p>

        {!user?.phone ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setIsRoleModalOpen(true)}>
              I Want to Donate
            </button>
            <button className="btn btn-outline" onClick={() => setIsLoginModalOpen(true)}>
              Claim Food as NGO / Volunteer
            </button>
          </div>
        ) : (
          <p style={{ color: '#10b981', fontWeight: '600' }}>
            Logged in as: {user.name} ({user.role})
          </p>
        )}
      </div>

      {/* Render Donor Dashboard View */}
      {user?.role === 'Donor' && (
        <>
          <DonorDashboard 
            foodItems={foodItems} 
            user={user} 
            onOpenPostModal={() => setIsPostModalOpen(true)} 
          />

          <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #10b981', textAlign: 'center' }}>
            <h3>Have More Leftover Food?</h3>
            <p style={{ margin: '0.5rem 0 1rem 0' }}>Post details in under 1 minute to notify nearby volunteers.</p>
            <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>
              + Post Surplus Food
            </button>
          </div>
        </>
      )}

      {/* Render Volunteer Dashboard View */}
      {(user?.role === 'Volunteer' || user?.role === 'NGO Receiver') && (
        <VolunteerDashboard 
          foodItems={foodItems} 
          user={user} 
          onClaimFood={handleClaimClick}
          onMarkDelivered={handleMarkDelivered} 
        />
      )}

      {/* Search & Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        marginBottom: '1.5rem', 
        background: '#f9fafb', 
        padding: '1rem', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="🔍 Search by food name or location..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 2, minWidth: '220px', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
        />

        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ flex: 1, minWidth: '140px', padding: '0.6rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
        >
          <option value="All">All Food Types</option>
          <option value="Veg">Veg Only</option>
          <option value="Non-Veg">Non-Veg Only</option>
          <option value="Packaged">Packaged Items</option>
        </select>
      </div>

      {/* Live Map Showing Donors & Receiver Locations */}
      <MapView foodItems={filteredFoodItems} currentUser={user} />

      {/* Active Listings Header */}
      <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>
        Active Food Listings ({filteredFoodItems.length})
      </h2>

      {/* Food Cards Grid */}
      {filteredFoodItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredFoodItems.map((item) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem', opacity: item.status === 'Delivered' ? 0.6 : item.status === 'Claimed' ? 0.85 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ 
                  background: item.type === 'Veg' ? '#d1fae5' : item.type === 'Non-Veg' ? '#fee2e2' : '#e0e7ff', 
                  color: item.type === 'Veg' ? '#065f46' : item.type === 'Non-Veg' ? '#991b1b' : '#3730a3', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold' 
                }}>
                  {item.type}
                </span>

                <span style={{ 
                  background: item.status === 'Delivered' ? '#d1fae5' : item.status === 'Claimed' ? '#fef3c7' : '#fee2e2', 
                  color: item.status === 'Delivered' ? '#065f46' : item.status === 'Claimed' ? '#92400e' : '#dc2626', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem', 
                  fontWeight: '600' 
                }}>
                  {item.status === 'Delivered' ? '✅ Rescued' : item.status === 'Claimed' ? '⚠️ Reserved' : item.expiry}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>📍 {item.location}</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>🏢 Donated by: {item.donor}</p>

              {item.status === 'Delivered' ? (
                <div style={{ background: '#ecfdf5', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', color: '#047857', fontWeight: 'bold' }}>
                  🎉 Food Rescued Successfully
                </div>
              ) : item.status === 'Claimed' ? (
                <div style={{ background: '#f3f4f6', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', color: '#374151', fontWeight: '500' }}>
                  ✅ Claimed by: {item.claimedBy}
                </div>
              ) : (
                <button 
                  className="btn btn-primary full-width"
                  onClick={() => handleClaimClick(item)}
                >
                  {user?.role === 'Donor' ? 'View Details' : 'Request Claim'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No matching food items found.</p>
        </div>
      )}

      {/* Modals */}
      <PostFoodModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onSubmitFood={handleAddFood} 
      />

      <ClaimModal 
        isOpen={Boolean(selectedFoodForClaim)} 
        onClose={() => setSelectedFoodForClaim(null)} 
        foodItem={selectedFoodForClaim}
        onConfirmClaim={handleConfirmClaim}
      />
    </div>
  );
};

export default Home;