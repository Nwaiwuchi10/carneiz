import adminApiClient from './apiClient';

export const settingsService = {
  getSettings: async () => {
    const response = await adminApiClient.get('/settings');
    return response.data;
  },
  updateSettings: async (section: string, payload: any) => {
    const response = await adminApiClient.put(`/settings/${section}`, payload);
    return response.data;
  }
};
