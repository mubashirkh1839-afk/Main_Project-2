import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleSelectionModal = () => {
  const { isRoleModalOpen, setIsRoleModalOpen, setRole, setIsLoginModalOpen } = useAuth();

  if (!isRoleModalOpen) return null;

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setIsRoleModalOpen(false);
    setIsLoginModalOpen(true); // Role select karne ke baad direct Login / OTP modal khulega
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={() => setIsRoleModalOpen(false)}>×</button>
        <h2>Welcome to Food Rescue</h2>
        <p>Choose how you want to contribute today:</p>

        <div className="role-options">
          <div className="role-card" onClick={() => handleSelectRole('Donor')}>
            <div className="role-icon">🍲</div>
            <h3>I want to Donate Food</h3>
            <p>Restaurants, Mess, Event Hosts, Individuals with excess fresh food.</p>
          </div>

          <div className="role-card" onClick={() => handleSelectRole('Volunteer')}>
            <div className="role-icon">🤝</div>
            <h3>I am a Volunteer / NGO</h3>
            <p>Pick up verified extra food and distribute it to people in need.</p>
          </div>
        </div>

        <div className="modal-footer">
          <p>
            Already have an account?{' '}
            <button 
              className="link-btn" 
              onClick={() => {
                setIsRoleModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            >
              Sign In Directly
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;