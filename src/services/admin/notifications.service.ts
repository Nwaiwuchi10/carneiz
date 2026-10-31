import axios from 'axios';
import { API_URL } from './apiClient';

export const notificationsService = {
  getAdminNotifications: async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('token')) : null;
    const response = await axios.get(`${API_URL}/notifications/admin`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
  markAllAsRead: async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('token')) : null;
    const response = await axios.patch(
      `${API_URL}/notifications/read-all`,
      { recipientRole: 'admin' },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
  },
  markAsRead: async (id: string) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || localStorage.getItem('token')) : null;
    const response = await axios.patch(
      `${API_URL}/notifications/${id}/read`,
      {},
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
  },
};
