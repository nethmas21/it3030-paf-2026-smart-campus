import axios from "axios";



const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  withCredentials: true, // needed for Spring Session/OAuth2 cookies
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap ApiResponse wrapper & handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    }
    return Promise.reject(error);
  }
);

export default apiClient;