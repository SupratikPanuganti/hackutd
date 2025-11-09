# Telegram Notifications Debugging Guide

## Quick Troubleshooting Steps

### 1. Check Backend Server is Running

Make sure your backend server is running:
```bash
npm run dev:backend
```

You should see:
```
Backend server running on http://localhost:3001
[Telegram Service] Bot initialized successfully
```

### 2. Check Telegram Bot Token

Verify your `.env` file has the token:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Check backend logs** - if you see:
```
[Telegram Service] Telegram bot token not configured
```
→ Your token is missing or incorrect

### 3. Test Telegram Connection

Test if the bot can send messages:

```bash
curl -X POST http://localhost:3001/api/notifications/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"chatId": "5367833555"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Test message sent successfully",
  "messageId": 123
}
```

### 4. Check Browser Console

Open browser console (F12) and look for:
- `🔧 Telegram Chat ID configured: 5367833555`
- `🔧 Telegram service status: { configured: true, botInfo: {...} }`
- `📱 Attempting to send Telegram notification...`
- `✅ Telegram notification sent successfully` OR error messages

### 5. Check Backend Logs

Watch your backend server logs for:
- `[Telegram Service] Sending message to chatId: 5367833555`
- `[Telegram Service] ✅ Message sent successfully` OR error details

### 6. Common Issues

#### Issue: "Telegram service not configured"
**Solution:**
- Check `.env` file exists in project root
- Verify `TELEGRAM_BOT_TOKEN` is set
- Restart backend server after adding token

#### Issue: "User has blocked the bot or not started it"
**Solution:**
1. Open Telegram
2. Search for your bot
3. Start a conversation
4. Send `/start` to the bot
5. Try again

#### Issue: "Invalid chat ID"
**Solution:**
- Verify Chat ID: `5367833555`
- Make sure you've started the bot first
- Check if Chat ID is correct (use @userinfobot to verify)

#### Issue: "Invalid bot token"
**Solution:**
- Get a new token from @BotFather
- Update `.env` file
- Restart backend server

#### Issue: Network errors
**Solution:**
- Check backend server is running on port 3001
- Verify `VITE_BACKEND_URL` in frontend (defaults to `http://localhost:3001`)
- Check browser console for CORS errors

### 7. Manual Test

Test sending a message directly:

```bash
# Test endpoint
curl -X POST http://localhost:3001/api/notifications/telegram/tower-status \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "5367833555",
    "towerId": "eNB-TX-001",
    "towerRegion": "Dallas",
    "status": "degraded",
    "userLocation": {
      "latitude": 32.7767,
      "longitude": -96.7970
    }
  }'
```

### 8. Check Telegram Status

Check if service is configured:
```bash
curl http://localhost:3001/api/notifications/telegram/status
```

**Expected:**
```json
{
  "configured": true,
  "botInfo": {
    "username": "your_bot_username",
    "first_name": "Your Bot Name",
    "id": 123456789
  }
}
```

## Step-by-Step Debugging

1. **Start backend server**
   ```bash
   npm run dev:backend
   ```

2. **Check backend logs** for Telegram initialization

3. **Open browser console** (F12) on Network Status page

4. **Check for errors** in console:
   - Look for `⚠️ Telegram service not configured`
   - Look for network errors
   - Look for API errors

5. **Test manually** using curl command above

6. **Check Telegram** - make sure bot is started

## Still Not Working?

1. Check backend server logs for detailed error messages
2. Check browser console for network/API errors
3. Verify bot token is correct
4. Make sure you've started the bot on Telegram
5. Verify Chat ID is correct: `5367833555`

