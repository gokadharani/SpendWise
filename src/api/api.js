const API_URL = import.meta.env.VITE_API_URL || 'https://spendwise-5t2s.onrender.com/api';

const TOKEN_KEY = 'spendwise_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Return early throwing if unauthorized to handle centrally in AuthContext
    if (response.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
