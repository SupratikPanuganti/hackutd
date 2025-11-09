import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface SOSEmailData {
  userEmail?: string;
  userName?: string;
  phoneNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  message?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SOSEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SOS emergency notification email
 */
export const sendSOSEmail = async (data: SOSEmailData): Promise<SOSEmailResult> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/notifications/email/sos`, data);
    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    console.error('Failed to send SOS email:', error);
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

/**
 * Send a test email to verify the email service is working
 */
export const sendTestEmail = async (): Promise<SOSEmailResult> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/notifications/email/test`);
    return {
      success: true,
      messageId: response.data.messageId,
    };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return {
      success: false,
      error: axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Unknown error',
    };
  }
};

/**
 * Get user's current location using browser Geolocation API
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Helper function to send an SOS with current location
 * This is a convenience function that combines location retrieval and email sending
 */
export const sendSOSWithLocation = async (
  userData: Omit<SOSEmailData, 'timestamp' | 'location'>,
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'high'
): Promise<SOSEmailResult> => {
  try {
    // Try to get current location
    let location;
    try {
      location = await getCurrentLocation();
    } catch (error) {
      console.warn('Could not get location:', error);
      // Continue without location
    }

    // Send SOS email
    const sosData: SOSEmailData = {
      ...userData,
      location,
      timestamp: new Date().toISOString(),
      urgencyLevel,
    };

    return await sendSOSEmail(sosData);
  } catch (error) {
    console.error('Failed to send SOS with location:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
