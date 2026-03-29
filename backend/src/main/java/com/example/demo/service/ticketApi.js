import apiClient from "./apiClient";

export const createTicket = (data) => {
  return apiClient.post("/tickets", data);
};

export const getTickets = () => {
  return apiClient.get("/tickets");
};

export const getTicketById = (id) => {
  return apiClient.get(`/tickets/${id}`);
};

export const updateTicketStatus = (id, data) => {
  return apiClient.patch(`/tickets/${id}/status`, data);
};

export const assignTechnician = (id, data) => {
  return apiClient.patch(`/tickets/${id}/assign-technician`, data);
};