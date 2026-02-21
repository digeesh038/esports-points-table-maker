import axios from 'axios';
import { toast } from 'react-toastify';


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ================= REQUEST INTERCEPTOR =================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // 🚫 DO NOT FORCE REDIRECT FOR LOGIN/SIGNUP ERRORS
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if NOT already on auth pages
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/login';
      }

      toast.error('Session expired. Please login again.');
    }
    else if (status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    else if (status === 404) {
      toast.error('Resource not found');
    }
    else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
