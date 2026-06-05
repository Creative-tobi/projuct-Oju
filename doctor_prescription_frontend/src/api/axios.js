// src/api/axios.js
import axios from "axios";

// Create a custom Axios instance
const api = axios.create({
  // Vite uses import.meta.env to access .env variables
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 
  Optional but highly recommended:
  This interceptor will automatically attach the user's token 
  to every request once they log in!
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
