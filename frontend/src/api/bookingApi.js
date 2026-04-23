import apiClient from './apiClient';

export const createBooking = (data) =>
  apiClient.post('/bookings', data);

export const getMyBookings = (params) =>
  apiClient.get('/bookings/my', { params });

export const getAllBookings = (params) =>
  apiClient.get('/bookings', { params });

export const getBookingById = (id) =>
  apiClient.get(`/bookings/${id}`);

export const approveBooking = (id, data) =>
  apiClient.patch(`/bookings/${id}/approve`, data || {});

export const rejectBooking = (id, data) =>
  apiClient.patch(`/bookings/${id}/reject`, data || {});

export const cancelBooking = (id) =>
  apiClient.patch(`/bookings/${id}/cancel`);