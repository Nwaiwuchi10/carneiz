import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export const productService = {
  async getProducts(params: any = {}) {
    // Allows any user to fetch products without auth
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data;
  },

  async getProduct(id: string) {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await axios.get(`${API_URL}/admin/categories`);
    return response.data;
  },

  async submitReview(id: string, reviewData: { user: string; rating: number; comment: string }) {
    const response = await axios.post(`${API_URL}/products/${id}/review`, reviewData);
    return response.data;
  }
};
