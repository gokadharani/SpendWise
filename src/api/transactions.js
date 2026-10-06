import { apiRequest } from './api';

export const getTransactions = async () => {
  return apiRequest('/transactions', {
    method: 'GET',
  });
};

export const getTransaction = async (id) => {
  return apiRequest(`/transactions/${id}`, {
    method: 'GET',
  });
};

export const createTransaction = async (transaction) => {
  return apiRequest('/transactions', {
    method: 'POST',
    body: transaction,
  });
};

export const updateTransaction = async (id, transaction) => {
  return apiRequest(`/transactions/${id}`, {
    method: 'PUT',
    body: transaction,
  });
};

export const deleteTransaction = async (id) => {
  return apiRequest(`/transactions/${id}`, {
    method: 'DELETE',
  });
};
