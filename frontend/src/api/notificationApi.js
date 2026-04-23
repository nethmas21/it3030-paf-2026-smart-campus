import apiClient from './apiClient';

const NOTIFICATION_URL = 'http://localhost:8081/api/notifications';

export const getNotifications = () =>
  apiClient.get(NOTIFICATION_URL);

export const markNotificationAsRead = (id) =>
  apiClient.patch(`${NOTIFICATION_URL}/${id}/read`);

export const deleteNotification = (id) =>
  apiClient.delete(`${NOTIFICATION_URL}/${id}`);
