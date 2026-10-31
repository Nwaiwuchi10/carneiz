import adminApiClient from './apiClient';

export const analyticsService = {
  getAnalytics: async () => {
    const response = await adminApiClient.get('/analytics');
    return response.data;
  }
};
