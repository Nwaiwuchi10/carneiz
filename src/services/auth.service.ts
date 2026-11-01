import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export const authService = {
  async register(data: any) {
    const response = await axios.post(`\${API_URL}/auth/register`, data);
    return response.data;
  },

  async login(data: any) {
    const response = await axios.post(`\${API_URL}/auth/login`, data);
    return response.data;
  },

  async forgotPassword(data: any) {
    const response = await axios.post(`\${API_URL}/auth/forgot-password`, data);
    return response.data;
  },

  async resetPassword(data: any) {
    const response = await axios.post(`\${API_URL}/auth/reset-password`, data);
    return response.data;
  }
};
