import adminApiClient from './apiClient';

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
}

export const transactionsService = {
  getStats: async () => {
    const response = await adminApiClient.get('/transactions/stats');
    return response.data;
  },
  getTransactions: async (params?: GetTransactionsParams) => {
    const response = await adminApiClient.get('/transactions', { params });
    return response.data;
  },
  getTransactionById: async (id: string) => {
    const response = await adminApiClient.get(`/transactions/${id}`);
    return response.data;
  },
  refundTransaction: async (id: string) => {
    const response = await adminApiClient.put(`/transactions/${id}/refund`);
    return response.data;
  },
  updateTransactionStatus: async (id: string, status: string) => {
    const response = await adminApiClient.put(`/transactions/${id}/status`, { status });
    return response.data;
  }
};
