import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';
export const ADMIN_API_BASE_URL = `${API_URL}/admin`;

export const adminApiClient = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApiClient;
