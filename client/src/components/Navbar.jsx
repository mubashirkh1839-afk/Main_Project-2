import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, setIsLoginModalOpen, setIsRoleModalOpen } = useAuth();

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', textDecoration: 'none' }}>
        🥗 FoodRescue
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>Home</Link>
        <Link to="/map" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>🗺️ Live Map</Link>
        
        {user.phone && (
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#374151', fontWeight: '500' }}>
            📊 Dashboard
          </Link>
        )}

        {!user.phone ? (
          <button className="btn btn-primary" onClick={() => setIsRoleModalOpen(true)}>
            Get Started
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              👤 {user.name} ({user.role})
            </span>
            <button className="btn btn-outline" onClick={logout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;