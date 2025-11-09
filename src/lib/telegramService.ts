// Normalize backend URL (remove trailing slash if present)
const getBackendUrl = () => {
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const BACKEND_URL = getBackendUrl();

export interface SendTowerNotificationRequest {
  chatId: string | number;
  towerId: string;
  towerRegion: string;
  status: 'degraded' | 'ok';
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface TelegramStatusResponse {
  configured: boolean;
  botInfo: {
    username?: string;
    first_name?: string;
    id?: number;
  } | null;
}

/**
 * Send Telegram notification for tower status change
 */
export async function sendTowerStatusNotification(
  request: SendTowerNotificationRequest
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const url = `${BACKEND_URL}/api/notifications/telegram/tower-status`;
  console.log('📡 Backend URL from env:', import.meta.env.VITE_BACKEND_URL);
  console.log('📡 Normalized BACKEND_URL:', BACKEND_URL);
  console.log('📡 Full request URL:', url);
  console.log('📡 Request payload:', JSON.stringify(request, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON BEFORE reading the body
    const contentType = response.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    
    console.log('📡 Response content-type:', contentType, '| Is JSON:', isJSON);
    
    if (!isJSON) {
      // Response is not JSON - read as text to see what we got
      const text = await response.text();
      console.error('❌ API returned non-JSON response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url,
        responsePreview: text.substring(0, 500), // First 500 chars
      });
      
      // Try to provide helpful error message
      let errorMessage = `Server returned ${response.status} ${response.statusText}. `;
      if (response.status === 404) {
        errorMessage += `Endpoint not found. Check if backend is running on ${BACKEND_URL}`;
      } else if (contentType.includes('text/html')) {
        errorMessage += `Received HTML instead of JSON. This usually means the request hit the wrong server (e.g., Vite dev server) or the endpoint doesn't exist.`;
      } else {
        errorMessage += `Expected JSON but got ${contentType || 'unknown content-type'}.`;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    // Response is JSON - parse it
    let data;
    try {
      data = await response.json();
      console.log('📡 Response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return {
        success: false,
        error: `Failed to parse server response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      };
    }

    if (!response.ok) {
      // If it's a 503 (service unavailable), silently fail - telegram is optional
      if (response.status === 503) {
        console.log('ℹ️ Telegram service not configured (this is optional)');
        return {
          success: false,
          error: data.error || 'Telegram service not configured',
        };
      }

      console.error('❌ API returned error status:', response.status, data);
      return {
        success: false,
        error: data.error || `Server returned ${response.status} ${response.statusText}`,
      };
    }

    console.log('✅ Telegram notification API call successful');
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('❌ Network error sending Telegram notification:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url,
    });
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        success: false,
        error: `Failed to parse server response as JSON. Backend may be returning HTML error page. Check backend server logs.`,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Telegram service is configured and get bot info
 */
export async function checkTelegramStatus(): Promise<TelegramStatusResponse> {
  try {
    const url = `${BACKEND_URL}/api/notifications/telegram/status`;
    console.log('📡 Checking Telegram status at:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Telegram status check failed:', response.status, response.statusText);
      return {
        configured: false,
        botInfo: null,
      };
    }
    
    const data: TelegramStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error checking Telegram status:', error);
    return {
      configured: false,
      botInfo: null,
    };
  }
}

/**
 * Get chat ID from localStorage
 */
export function getChatId(): string | null {
  return localStorage.getItem('telegramChatId');
}

/**
 * Save chat ID to localStorage
 */
export function saveChatId(chatId: string): void {
  localStorage.setItem('telegramChatId', chatId);
}

/**
 * Validate chat ID format (basic validation)
 */
export function validateChatId(chatId: string): boolean {
  // Chat ID can be a number (as string) or username starting with @
  const trimmed = chatId.trim();
  if (trimmed.startsWith('@')) {
    // Username format: @username (3-32 characters after @)
    return trimmed.length >= 4 && trimmed.length <= 33 && /^@[a-zA-Z0-9_]+$/.test(trimmed);
  } else {
    // Numeric chat ID
    return /^\d+$/.test(trimmed);
  }
}

