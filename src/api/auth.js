import { apiRequest } from './api';

export const registerUser = async (name, email, password) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
};

export const loginUser = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/me', {
    method: 'GET',
  });
};
