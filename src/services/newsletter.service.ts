import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300';

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
