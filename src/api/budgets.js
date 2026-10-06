import { apiRequest } from './api';

export const getBudgets = async () => {
  return apiRequest('/budgets', {
    method: 'GET',
  });
};

export const getBudget = async (month) => {
  return apiRequest(`/budgets/${month}`, {
    method: 'GET',
  });
};

export const createBudget = async (data) => {
  return apiRequest('/budgets', {
    method: 'POST',
    body: data,
  });
};

export const updateBudget = async (month, data) => {
  return apiRequest(`/budgets/${month}`, {
    method: 'PUT',
    body: data,
  });
};

export const deleteBudget = async (month) => {
  return apiRequest(`/budgets/${month}`, {
    method: 'DELETE',
  });
};
