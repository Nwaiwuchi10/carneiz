import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';

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
