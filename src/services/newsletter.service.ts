import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export interface SubscribeResponse {
  success: boolean;
  isExisting?: boolean;
  message: string;
  discountCode: string;
  email: string;
  syncedWhatsApp?: boolean;
}

export const newsletterService = {
  async subscribe(email: string, phone?: string): Promise<SubscribeResponse> {
    const response = await axios.post(`${API_URL}/newsletter/subscribe`, {
      email,
      phone,
    });
    return response.data;
  },
};
