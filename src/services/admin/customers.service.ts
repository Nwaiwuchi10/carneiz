import adminApiClient from './apiClient';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const customersService = {
  getStats: async () => {
    const response = await adminApiClient.get('/customers/stats');
    return response.data;
  },
  getCustomers: async (params?: GetCustomersParams) => {
    const response = await adminApiClient.get('/customers', { params });
    return response.data;
  },
  getCustomerById: async (id: string) => {
    const response = await adminApiClient.get(`/customers/${id}`);
    return response.data;
  },
  updateCustomer: async (id: string, payload: any) => {
    const response = await adminApiClient.put(`/customers/${id}`, payload);
    return response.data;
  }
};
