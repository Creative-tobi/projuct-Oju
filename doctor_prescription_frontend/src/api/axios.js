import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api/v1",
  baseURL: "https://projuct-oju.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle global 401 (Unauthorized) redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
