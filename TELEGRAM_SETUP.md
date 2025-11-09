# Telegram Notifications Setup Guide

This guide will help you set up Telegram notifications for tower status changes using Telegram Bot API.

## Overview

The system sends Telegram messages when:
1. **Tower Degrades**: "🚨 Tower Alert - A tower near you (Region) is degraded. You might experience worse network speeds. We will keep you updated."
2. **Tower Restores**: "✅ Good News! - The tower near you (Region) is back online. Your network speeds should be back to normal."

## Prerequisites

- A Telegram account
- Access to Telegram (mobile app or web)

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a conversation with BotFather
3. Send `/newbot` command
4. Follow the prompts:
   - Choose a name for your bot (e.g., "Tower Status Bot")
   - Choose a username (must end with `bot`, e.g., `tower_status_bot`)
5. BotFather will give you a **Bot Token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. **Save this token** - you'll need it for the environment variable

### 2. Get Your Chat ID

You have two options:

#### Option A: Using @userinfobot (Easiest)
1. Search for `@userinfobot` on Telegram
2. Start a conversation
3. Send `/start`
4. The bot will reply with your Chat ID (a number like `123456789`)
5. Copy this number

#### Option B: Using Your Username
1. You can use your Telegram username (e.g., `@yourusername`)
2. Make sure your username is set in Telegram Settings > Username
3. Note: The bot must be able to message you (you may need to start the bot first)

### 3. Start Your Bot

1. Search for your bot on Telegram (using the username you created, e.g., `@tower_status_bot`)
2. Start a conversation
3. Send `/start` to the bot
4. The bot should reply (this ensures the bot can message you)

### 4. Configure Environment Variables

Add the following to your `.env` file in the project root:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Example:**
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 5. Test the Setup

1. Start your backend server:
   ```bash
   npm run dev:backend
   ```

2. Check if Telegram service is configured:
   ```bash
   curl http://localhost:3001/api/notifications/telegram/status
   ```

   You should see:
   ```json
   {
     "configured": true,
     "botInfo": {
       "username": "tower_status_bot",
       "first_name": "Tower Status Bot",
       "id": 123456789
     }
   }
   ```

3. Test sending a message (replace `YOUR_CHAT_ID` with your actual Chat ID):
   ```bash
   curl -X POST http://localhost:3001/api/notifications/telegram/tower-status \
     -H "Content-Type: application/json" \
     -d '{
       "chatId": "YOUR_CHAT_ID",
       "towerId": "eNB-TX-001",
       "towerRegion": "Dallas",
       "status": "degraded",
       "userLocation": {
         "latitude": 32.7767,
         "longitude": -96.7970
       }
     }'
   ```

   You should receive a message on Telegram!

## How It Works

### Frontend Flow

1. User grants location permission
2. System detects user is in Dallas area
3. Telegram dialog appears (if no Chat ID is saved)
4. User enters their Telegram Chat ID or username
5. Chat ID is saved to localStorage
6. When a tower status changes:
   - System detects the change
   - Sends Telegram message via backend API
   - User receives message on Telegram

### Backend Flow

1. Frontend calls `/api/notifications/telegram/tower-status`
2. Backend validates request
3. Telegram service sends message via Bot API
4. Response is returned to frontend

## API Endpoints

### POST `/api/notifications/telegram/tower-status`

Send a tower status notification.

**Request Body:**
```json
{
  "chatId": "123456789",
  "towerId": "eNB-TX-001",
  "towerRegion": "Dallas",
  "status": "degraded" | "ok",
  "userLocation": {
    "latitude": 32.7767,
    "longitude": -96.7970
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telegram notification sent successfully",
  "messageId": 123
}
```

### GET `/api/notifications/telegram/status`

Check if Telegram service is configured and get bot info.

**Response:**
```json
{
  "configured": true,
  "botInfo": {
    "username": "tower_status_bot",
    "first_name": "Tower Status Bot",
    "id": 123456789
  }
}
```

## Troubleshooting

### Telegram Service Not Configured

If `configured: false`, check:
- `TELEGRAM_BOT_TOKEN` is set in `.env`
- `.env` file is in the project root
- Backend server has been restarted after adding env var
- Bot token is correct (no extra spaces)

### Messages Not Sending

1. **"User has blocked the bot"**
   - Make sure you've started the bot (sent `/start`)
   - Check that the bot is not blocked in your Telegram settings

2. **"Invalid chat ID"**
   - Verify your Chat ID is correct
   - Make sure you've started the bot first
   - Try using your username instead (e.g., `@yourusername`)

3. **Bot not responding**
   - Check that the bot token is correct
   - Verify the bot exists on Telegram
   - Check backend logs for errors

### Getting Your Chat ID

If you can't find your Chat ID:
1. Use `@userinfobot` - it will show your Chat ID
2. Use your username (e.g., `@yourusername`) - make sure it's set in Telegram
3. Check backend logs when you send a message - it may log the Chat ID

## Advantages of Telegram

✅ **Free** - No cost for sending messages  
✅ **Fast** - Instant delivery  
✅ **Reliable** - High uptime  
✅ **Rich formatting** - Supports HTML, emojis, etc.  
✅ **Interactive** - Users can interact with the bot  
✅ **No phone number required** - Uses Chat ID or username  
✅ **Works everywhere** - Available on all platforms  

## Security Notes

- Never commit `.env` file to version control
- Keep bot token secure
- Bot tokens can be regenerated in BotFather if compromised
- Users must start the bot before receiving messages

## Next Steps

1. Create a bot via @BotFather
2. Get your Chat ID
3. Add `TELEGRAM_BOT_TOKEN` to `.env`
4. Start the bot on Telegram
5. Test notifications
6. Enjoy free tower status updates!

## Support

- Telegram Bot API Docs: https://core.telegram.org/bots/api
- BotFather: @BotFather on Telegram
- Project Issues: Create an issue in the repository

## Example Messages

### Tower Degraded
```
🚨 Tower Alert

A tower near you (Dallas) is degraded.

You might experience worse network speeds. We will keep you updated.

Tower ID: eNB-TX-001
```

### Tower Restored
```
✅ Good News!

The tower near you (Dallas) is back online.

Your network speeds should be back to normal.

Tower ID: eNB-TX-001
```

