import apiClient from './apiClient';

export const loginWithPassword = (data) =>
  apiClient.post('/auth/login', data);

export const registerWithPassword = (data) =>
  apiClient.post('/auth/register', data);
