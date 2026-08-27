import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('food_rescue_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Volunteer');

  const login = (userData) => {
    const userPayload = {
      id: userData?.id || 'usr_' + Date.now(),
      name: userData?.fullName || userData?.name || 'Mubashir Ahmad',
      role: userData?.role || selectedRole || 'Volunteer',
      phone: userData?.phone || '+919876543210',
      token: userData?.token || '',
      email: userData?.email || 'user@foodrescue.org',
      orgName: userData?.orgName || '',
      city: userData?.city || 'Kanpur',
      stats: {
        mealsRescued: userData?.stats?.mealsRescued || 45,
        totalWeightKg: userData?.stats?.totalWeightKg || 68,
        carbonSavedKg: userData?.stats?.carbonSavedKg || 112,
      },
    };
    setUser(userPayload);
    localStorage.setItem('food_rescue_user', JSON.stringify(userPayload));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('food_rescue_user');
  };

  const setRole = (role) => {
    setSelectedRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithOtp: login,
        logout,
        setRole,
        selectedRole,
        setSelectedRole,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isRoleModalOpen,
        setIsRoleModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};