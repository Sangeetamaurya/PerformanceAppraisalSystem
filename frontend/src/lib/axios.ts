import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // ⚠️ Do NOT set a global Content-Type header here.
  // For JSON requests axios sets it automatically.
  // For FormData (file upload) it MUST NOT be pre-set — the browser/axios
  // needs to add the multipart boundary itself.
  timeout: 15000,
});

// ─── Request Interceptor: Attach JWT ────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('pas_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Ensure JSON Content-Type for non-FormData requests
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Handle 401, log errors ────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log full error details to help debugging
    if (process.env.NODE_ENV === 'development') {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();
      console.error(`[API Error] ${method} ${BASE_URL}${url} → ${status}`, error.response?.data);
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only auto-logout if not on the login page itself
      if (!window.location.pathname.includes('/login')) {
        sessionStorage.removeItem('pas_token');
        sessionStorage.removeItem('pas_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
