const BASE_URL = 'http://localhost:8081/api/resources';

export const resourceApi = {

  // Get all resources (with optional filters)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.location) params.append('location', filters.location);
    if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch resources');
    return response.json();
  },

  // Get one resource by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Resource not found');
    return response.json();
  },

  // Create new resource
  create: async (data) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create resource');
    return response.json();
  },

  // Update existing resource
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update resource');
    return response.json();
  },

  // Delete resource
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete resource');
  }
};