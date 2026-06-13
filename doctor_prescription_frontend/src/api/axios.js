import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  // baseURL: "https://projuct-oju.onrender.com/api/v1",
  // 🔴 REMOVED: "Content-Type": "application/json" 
  // Axios will automatically set the correct boundary for FormData uploads
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;