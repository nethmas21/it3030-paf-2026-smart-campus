const BASE_URL = 'http://localhost:8081/api/resources';

// Common fetch options — credentials required for session cookie
const opts = (method, data) => ({
  method,
  credentials: 'include',  // ← fixes the CORS/auth error
  headers: { 'Content-Type': 'application/json' },
  ...(data ? { body: JSON.stringify(data) } : {}),
});

export const resourceApi = {

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type)        params.append('type', filters.type);
    if (filters.location)    params.append('location', filters.location);
    if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
    if (filters.status)      params.append('status', filters.status);

    const response = await fetch(`${BASE_URL}?${params}`, opts('GET'));
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts('GET'));
    if (!response.ok) throw new Error('Resource not found');
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(BASE_URL, opts('POST', data));
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts('PUT', data));
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts('DELETE'));
    if (!response.ok) throw new Error('Failed to delete resource');
  }
};