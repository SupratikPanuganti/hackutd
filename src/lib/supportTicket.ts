import axios from 'axios';

// Ensure BACKEND_URL does not end with a trailing slash to avoid double-slash in requests
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface SupportTicketData {
  userEmail: string;
  userName?: string;
  subject: string;
  description: string;
  timestamp?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface SupportTicketResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Submit a support ticket via email
 */
export const submitSupportTicket = async (
  data: SupportTicketData
): Promise<SupportTicketResult> => {
  try {
    // Add timestamp if not provided
    const ticketData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/notifications/email/support-ticket`,
      ticketData
    );

    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    console.error('Failed to submit support ticket:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Unknown error',
    };
  }
};

/**
 * Check if the email service is configured and ready
 */
export const checkEmailServiceStatus = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/notifications/email/status`);
    return response.data.configured && response.data.ready;
  } catch (error) {
    console.error('Failed to check email service status:', error);
    return false;
  }
};
