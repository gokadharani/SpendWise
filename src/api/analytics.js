import { apiRequest } from './api';

export const getAnalyticsSummary = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/summary${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

export const getAnalyticsCategories = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/categories${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

export const getAnalyticsTrends = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/trends${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

export const getAnalyticsTypes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/analytics/types${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};
