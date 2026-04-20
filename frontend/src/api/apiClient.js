import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Full browser redirect for OAuth — never use axios for this
      window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    }
    return Promise.reject(error);
  }
);

export default apiClient;