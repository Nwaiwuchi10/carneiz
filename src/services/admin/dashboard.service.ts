import adminApiClient from './apiClient';

export const dashboardService = {
  getStats: async () => {
    const response = await adminApiClient.get('/dashboard/stats');
    return response.data;
  }
};
