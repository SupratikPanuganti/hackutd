import TelegramBot from 'node-telegram-bot-api';

export interface TelegramNotification {
  towerId: string;
  towerRegion: string;
  status: 'degraded' | 'ok';
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface TelegramResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

class TelegramService {
  private bot: TelegramBot | null = null;
  private configured: boolean = false;
  private botToken: string | undefined;

  constructor() {
    // Do NOT initialize the bot here. Initialization will be done explicitly
    // after environment variables are loaded (see server/src/index.ts).
    this.botToken = undefined;
    this.bot = null;
    this.configured = false;
  }

  /**
   * Initialize the Telegram bot using environment variables.
   * Call this after dotenv.config() has run (e.g. from server entrypoint).
   */
  public init() {
    if (this.configured) return;

    this.botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (this.botToken) {
      try {
        this.bot = new TelegramBot(this.botToken, { polling: false });
        this.configured = true;
        console.log('[TelegramService] Telegram bot initialized');
      } catch (error) {
        console.error('[TelegramService] Failed to initialize bot:', error);
        this.configured = false;
      }
    } else {
      console.log('[TelegramService] Telegram bot token not configured');
      this.configured = false;
    }
  }

  public isServiceConfigured(): boolean {
    return this.configured && this.bot !== null;
  }

  public async sendMessage(chatId: string | number, message: string): Promise<TelegramResult> {
    if (!this.isServiceConfigured() || !this.bot) {
      return {
        success: false,
        error: 'Telegram service not configured',
      };
    }

    try {
      const result = await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });

      return {
        success: true,
        messageId: result.message_id,
      };
    } catch (error) {
      console.error('[TelegramService] Failed to send message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async sendTowerDegradedNotification(
    chatId: string | number,
    notification: TelegramNotification
  ): Promise<TelegramResult> {
    const message = `
🔴 <b>Tower Status Alert</b>

Tower ID: ${notification.towerId}
Region: ${notification.towerRegion}
Status: DEGRADED

Location: ${notification.userLocation.latitude}, ${notification.userLocation.longitude}
    `.trim();

    return this.sendMessage(chatId, message);
  }

  public async sendTowerRestoredNotification(
    chatId: string | number,
    notification: TelegramNotification
  ): Promise<TelegramResult> {
    const message = `
✅ <b>Tower Status Restored</b>

Tower ID: ${notification.towerId}
Region: ${notification.towerRegion}
Status: OK

Location: ${notification.userLocation.latitude}, ${notification.userLocation.longitude}
    `.trim();

    return this.sendMessage(chatId, message);
  }

  public async getBotInfo() {
    if (!this.isServiceConfigured() || !this.bot) {
      return null;
    }

    try {
      const me = await this.bot.getMe();
      return {
        username: me.username,
        first_name: me.first_name,
        id: me.id,
      };
    } catch (error) {
      console.error('[TelegramService] Failed to get bot info:', error);
      return null;
    }
  }
}

export const telegramService = new TelegramService();
