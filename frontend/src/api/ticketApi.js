import apiClient from './apiClient';

// ── Tickets ───────────────────────────────────────────────────────────────────

export const createTicket = (data) =>
  apiClient.post('/tickets', data);

export const getTickets = (params) =>
  apiClient.get('/tickets', { params });

export const getTicketById = (id) =>
  apiClient.get(`/tickets/${id}`);

export const updateTicketStatus = (id, data) =>
  apiClient.patch(`/tickets/${id}/status`, data);

export const assignTechnician = (id, data) =>
  apiClient.patch(`/tickets/${id}/assign-technician`, data);

export const deleteTicket = (id) =>
  apiClient.delete(`/tickets/${id}`);

// ── Attachments ───────────────────────────────────────────────────────────────

export const uploadAttachments = (id, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return apiClient.post(`/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const addComment = (id, data) =>
  apiClient.post(`/tickets/${id}/comments`, data);

export const updateComment = (ticketId, commentId, data) =>
  apiClient.put(`/tickets/${ticketId}/comments/${commentId}`, data);

export const deleteComment = (ticketId, commentId) =>
  apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`);