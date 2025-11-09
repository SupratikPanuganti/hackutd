import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }) || dotenv.config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Telegram bot (only if token is available)
let telegramBot: TelegramBot | null = null;

if (telegramBotToken) {
  try {
    telegramBot = new TelegramBot(telegramBotToken, { polling: false });
    console.log('[Telegram Service] Bot initialized successfully');
  } catch (error) {
    console.error('[Telegram Service] Failed to initialize bot:', error);
  }
} else {
  console.warn('[Telegram Service] Telegram bot token not configured. Notifications will be logged only.');
  console.warn('[Telegram Service] Required env var: TELEGRAM_BOT_TOKEN');
}

export interface TelegramNotification {
  towerId: string;
  towerRegion: string;
  status: 'degraded' | 'ok';
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export class TelegramService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(telegramBotToken && telegramBot);
    
    if (!this.isConfigured) {
      console.warn('[Telegram Service] Telegram not configured. Notifications will be logged only.');
      console.warn('[Telegram Service] Required env var: TELEGRAM_BOT_TOKEN');
    } else {
      console.log('[Telegram Service] Telegram configured successfully');
    }
  }

  /**
   * Send a Telegram message
   */
  async sendMessage(chatId: string | number, message: string): Promise<{ success: boolean; messageId?: number; error?: string }> {
    if (!this.isConfigured || !telegramBot) {
      console.log('[Telegram Service] [MOCK] Would send Telegram message:', {
        chatId,
        message: message.substring(0, 50) + '...',
      });
      return { success: true, messageId: Math.floor(Math.random() * 1000000) };
    }

    try {
      // Ensure chatId is treated as a number if it's a numeric string
      const normalizedChatId = typeof chatId === 'string' && /^\d+$/.test(chatId) 
        ? parseInt(chatId, 10) 
        : chatId;
      
      console.log('[Telegram Service] Sending message to chatId:', normalizedChatId, '(type:', typeof normalizedChatId, ')');
      console.log('[Telegram Service] Message preview:', message.substring(0, 100) + '...');
      
      const sentMessage = await telegramBot.sendMessage(normalizedChatId, message, {
        parse_mode: 'HTML',
      });

      console.log('[Telegram Service] ✅ Message sent successfully:', {
        chatId: normalizedChatId,
        messageId: sentMessage.message_id,
        date: sentMessage.date,
      });

      return {
        success: true,
        messageId: sentMessage.message_id,
      };
    } catch (error: any) {
      console.error('[Telegram Service] ❌ Error sending message:', error);
      console.error('[Telegram Service] Error details:', {
        message: error?.message,
        code: error?.response?.body?.error_code,
        description: error?.response?.body?.description,
        parameters: error?.response?.body?.parameters,
        chatId: chatId,
        chatIdType: typeof chatId,
      });
      
      // Handle specific Telegram errors
      if (error.response?.body?.error_code === 403) {
        return {
          success: false,
          error: 'User has blocked the bot or not started it. Please start the bot first by sending /start to your bot on Telegram.',
        };
      } else if (error.response?.body?.error_code === 400) {
        return {
          success: false,
          error: `Invalid chat ID: ${chatId}. Please make sure you have started the bot by sending /start. Error: ${error.response?.body?.description || error.message}`,
        };
      } else if (error.response?.body?.error_code === 401) {
        return {
          success: false,
          error: 'Invalid bot token. Please check TELEGRAM_BOT_TOKEN in .env file.',
        };
      }

      return {
        success: false,
        error: error?.response?.body?.description || error?.message || 'Unknown error',
      };
    }
  }

  /**
   * Send tower degradation notification
   */
  async sendTowerDegradedNotification(chatId: string | number, notification: TelegramNotification): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const message = `🚨 <b>Tower Alert</b>\n\n` +
      `A tower near you (<b>${notification.towerRegion}</b>) is <b>degraded</b>.\n\n` +
      `You might experience worse network speeds. We will keep you updated.\n\n` +
      `Tower ID: <code>${notification.towerId}</code>`;
    
    return this.sendMessage(chatId, message);
  }

  /**
   * Send tower restored notification
   */
  async sendTowerRestoredNotification(chatId: string | number, notification: TelegramNotification): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const message = `✅ <b>Good News!</b>\n\n` +
      `The tower near you (<b>${notification.towerRegion}</b>) is <b>back online</b>.\n\n` +
      `Your network speeds should be back to normal.\n\n` +
      `Tower ID: <code>${notification.towerId}</code>`;
    
    return this.sendMessage(chatId, message);
  }

  /**
   * Check if Telegram service is configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get bot info (username, etc.)
   */
  async getBotInfo(): Promise<{ username?: string; first_name?: string; id?: number } | null> {
    if (!this.isConfigured || !telegramBot) {
      return null;
    }

    try {
      const me = await telegramBot.getMe();
      return {
        username: me.username,
        first_name: me.first_name,
        id: me.id,
      };
    } catch (error) {
      console.error('[Telegram Service] Error getting bot info:', error);
      return null;
    }
  }
}

export const telegramService = new TelegramService();

