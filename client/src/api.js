const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const sendOtp = (phone) => request('/api/auth/send-otp', {
  method: 'POST',
  body: JSON.stringify({ phone }),
});

export const verifyOtp = (payload) => request('/api/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const getFoodListings = () => request('/api/food');

export const createFoodListing = (payload, token) => request('/api/food', {
  method: 'POST',
  token,
  body: JSON.stringify(payload),
});

export const reserveFoodListing = (payload, token) => request('/api/claims/reserve', {
  method: 'POST',
  token,
  body: JSON.stringify(payload),
});

export const verifyPickupOtp = (payload, token) => request('/api/claims/verify-pickup-otp', {
  method: 'POST',
  token,
  body: JSON.stringify(payload),
});

export const verifyDropoffOtp = (payload, token) => request('/api/claims/verify-dropoff-otp', {
  method: 'POST',
  token,
  body: JSON.stringify(payload),
});

export default API_BASE_URL;
