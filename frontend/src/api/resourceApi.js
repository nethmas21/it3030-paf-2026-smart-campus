const BASE_URL = "http://localhost:8081/api/resources";

// Helper — builds fetch options consistently
const opts = (method, data) => ({
  method,
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  ...(data ? { body: JSON.stringify(data) } : {}),
});

export const resourceApi = {

  // GET all resources with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.location) params.append("location", filters.location);
    if (filters.minCapacity) params.append("minCapacity", filters.minCapacity);
    if (filters.status) params.append("status", filters.status);

    const response = await fetch(`${BASE_URL}?${params}`, opts("GET"));
    if (!response.ok) throw new Error("Failed to fetch resources");
    return response.json();
  },

  // GET single resource by ID
  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts("GET"));
    if (!response.ok) throw new Error("Resource not found");
    return response.json();
  },

  // POST create new resource
  create: async (data) => {
    const response = await fetch(BASE_URL, opts("POST", data));

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Failed to create resource");
      error.response = { data: errorData };
      throw error;
    }

    return response.json();
  },

  // PUT update resource
  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts("PUT", data));

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || "Failed to update resource");
      error.response = { data: errorData };
      throw error;
    }

    return response.json();
  },

  // DELETE resource
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, opts("DELETE"));
    if (!response.ok) throw new Error("Failed to delete resource");
    return response.json();
  },
};