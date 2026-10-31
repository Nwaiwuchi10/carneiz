import adminApiClient from './apiClient';

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const ordersService = {
  getOrders: async (params?: GetOrdersParams) => {
    const response = await adminApiClient.get('/orders', { params });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await adminApiClient.get(`/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id: string, payload: { status: string; notes?: string }) => {
    const response = await adminApiClient.put(`/orders/${id}/status`, payload);
    return response.data;
  },
  verifyOrderPin: async (id: string, payload: { pin: string; receivedBy?: string }) => {
    const response = await adminApiClient.post(`/orders/${id}/verify-pin`, payload);
    return response.data;
  }
};
