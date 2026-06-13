import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api/v1",
  baseURL: "https://projuct-oju.onrender.com/api/v1",
});

// 1. Request Interceptor: Attach token IF the user has one
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

// 2. Response Interceptor: Handle 401 errors SMARTLY
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");

      // 🔴 CHECK CURRENT URL BEFORE REDIRECTING
      const currentPath = window.location.pathname;
      const publicRoutes = ["/", "/login", "/assessment"];

      // If the user is NOT on a public page, kick them to login
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
