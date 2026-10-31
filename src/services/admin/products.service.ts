import adminApiClient from './apiClient';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const productsService = {
  getStats: async () => {
    const response = await adminApiClient.get('/products/stats');
    return response.data;
  },
  getProducts: async (params?: GetProductsParams) => {
    const response = await adminApiClient.get('/products', { params });
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await adminApiClient.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (formData: FormData) => {
    const response = await adminApiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  updateProduct: async (id: string, formData: FormData) => {
    const response = await adminApiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await adminApiClient.delete(`/products/${id}`);
    return response.data;
  }
};
