import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initial State: direct localStorage se load karo
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('food_rescue_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Login Function: User profile + localStorage sync
  const loginWithOtp = (userData) => {
    const userPayload = userData || {
      name: 'Mubashir Ahmad',
      role: 'Volunteer',
      phone: '+919876543210'
    };
    setUser(userPayload);
    localStorage.setItem('food_rescue_user', JSON.stringify(userPayload));
  };

  // 3. Logout Function: Clear state & localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('food_rescue_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);