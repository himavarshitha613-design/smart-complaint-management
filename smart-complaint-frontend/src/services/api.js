import axios from "axios";

// Base API URL: uses Vite environment variable if configured, otherwise deployed Render backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://smart-complaint-management-h52s.onrender.com/api";

// Backend Origin (without /api suffix) for serving static uploads, images, etc.
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

// Helper to resolve image paths (local /uploads/... or absolute http urls)
export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor: automatically inject JWT and handle multipart/form-data
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If payload is FormData, delete Content-Type so the browser dynamically computes boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;