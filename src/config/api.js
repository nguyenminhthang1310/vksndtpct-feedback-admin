// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // URL server của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gửi token JWT nếu có
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
