# Telegram Notifications Setup (Optional)

The telegram notifications are **optional** and the app works fine without them. If you want to enable telegram notifications for tower status updates, follow these steps:

## Quick Setup

1. **Create a Telegram Bot**:
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` command
   - Follow the prompts to create your bot
   - Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Add Token to Environment**:
   - Open `.env` file in the project root
   - Add this line:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     ```

3. **Restart the Backend**:
   ```bash
   npm run dev
   ```

4. **Get Your Chat ID**:
   - Start a chat with your bot on Telegram
   - Send any message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` - that's your chat ID

5. **Update Chat ID in Code** (if needed):
   - The app uses a default chat ID
   - You can update it in `src/pages/NetworkStatus.tsx` if needed

## Current Status

✅ **Email Notifications**: Fully working (for support tickets and SOS)
⚠️ **Telegram Notifications**: Optional - currently not configured

The app returns HTTP 503 (Service Unavailable) when telegram is not configured, which is handled gracefully by the frontend.

## Testing

Once configured, you can test with:
```bash
curl -X POST http://localhost:3001/api/notifications/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"chatId": "YOUR_CHAT_ID"}'
```

---

**Note**: If you don't want telegram notifications, you can safely ignore this file. The app works perfectly with just email notifications!
