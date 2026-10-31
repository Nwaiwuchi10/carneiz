import adminApiClient from './apiClient';

export const categoriesService = {
  getCategories: async () => {
    const response = await adminApiClient.get('/categories');
    return response.data;
  },
  createCategory: async (data: any) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await adminApiClient.post('/categories', data, { headers });
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await adminApiClient.put(`/categories/${id}`, data, { headers });
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await adminApiClient.delete(`/categories/${id}`);
    return response.data;
  }
};
