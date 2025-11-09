# 🚨 SOS Email Service - Quick Setup Guide

## ✅ Setup Complete!

Your Nodemailer SOS email service is fully configured and ready to use!

### Configuration
- **Sender:** ngoat27@gmail.com
- **Recipient:** calhackswinners@gmail.com
- **Service:** Gmail SMTP with App Password

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
npm run dev
```

The email service will automatically initialize and verify the connection.

### 2. Test the Email Service
```bash
curl -X POST http://localhost:3001/api/notifications/email/test
```

You should receive a test email at `calhackswinners@gmail.com`.

### 3. Send an SOS Email (from frontend)
```typescript
import { sendSOSWithLocation } from '@/lib/sosEmail';

const handleEmergency = async () => {
  const result = await sendSOSWithLocation({
    userName: 'John Doe',
    userEmail: 'user@example.com',
    phoneNumber: '+1234567890',
    message: 'Emergency help needed!'
  }, 'critical');

  if (result.success) {
    console.log('SOS sent!', result.messageId);
  }
};
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/email/sos` | Send SOS email |
| GET | `/api/notifications/email/status` | Check service status |
| POST | `/api/notifications/email/test` | Send test email |

## 📧 Email Features

The SOS email includes:
- ✅ **Professional HTML Design** - T-Mobile branded email template
- ✅ **User Information** - Name, email, phone number
- ✅ **Location Data** - GPS coordinates + Google Maps link
- ✅ **Urgency Levels** - Color-coded priority (🟢🟡🟠🔴)
- ✅ **Timestamp** - When the SOS was triggered
- ✅ **Custom Message** - User's emergency description
- ✅ **Action Items** - Recommended response steps
- ✅ **Plain Text Fallback** - For email clients that don't support HTML

## 🎨 Urgency Levels

```typescript
'low'      // 🟢 Low priority
'medium'   // 🟡 Medium priority (default)
'high'     // 🟠 High priority
'critical' // 🔴 Critical emergency
```

## 📝 Example SOS Request

```json
{
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "phoneNumber": "+1-555-0123",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "San Francisco, CA"
  },
  "timestamp": "2025-01-09T12:00:00.000Z",
  "message": "Network down, need immediate assistance",
  "urgencyLevel": "high"
}
```

## 🔧 Files Created

### Backend
- `server/src/services/emailService.ts` - Email service with Nodemailer
- `server/src/index.ts` - Added email API endpoints

### Frontend
- `src/lib/sosEmail.ts` - Helper functions for sending SOS emails

### Documentation
- `EXAMPLE_SOS_USAGE.md` - Detailed usage examples
- `SOS_EMAIL_README.md` - This file

## 🧪 Testing

### Backend Test (Terminal)
```bash
# Test email service
curl -X POST http://localhost:3001/api/notifications/email/test

# Send test SOS
curl -X POST http://localhost:3001/api/notifications/email/sos \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Test User",
    "userEmail": "test@example.com",
    "timestamp": "2025-01-09T12:00:00.000Z",
    "urgencyLevel": "high",
    "message": "Test SOS"
  }'
```

### Frontend Test
```typescript
import { sendTestEmail, sendSOSEmail } from '@/lib/sosEmail';

// Test email service
const testResult = await sendTestEmail();
console.log(testResult);

// Send SOS
const sosResult = await sendSOSEmail({
  userName: 'Test User',
  userEmail: 'test@example.com',
  timestamp: new Date().toISOString(),
  urgencyLevel: 'high',
  message: 'Test emergency'
});
```

## 📦 Dependencies Installed

- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types

## ⚠️ Important Notes

1. **Gmail App Password**: The app password is already configured in the backend
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Authentication**: Add user authentication before deploying to production
4. **Environment Variables**: Move credentials to `.env` for production
5. **Error Handling**: Emails may fail if network issues occur

## 🚀 Next Steps

1. **Add SOS Button** to your Help or Network Status page
2. **Integrate with User Context** to auto-fill user details
3. **Add Confirmation Dialog** before sending SOS
4. **Create Admin Dashboard** to view and manage SOS requests
5. **Add SOS History** tracking for users

## 📞 Support

If you encounter any issues:
1. Check that the backend server is running
2. Verify email service status: `GET /api/notifications/email/status`
3. Check server logs for error messages
4. Ensure Gmail App Password is correct

---

**Status:** ✅ Ready to Use
**Last Updated:** January 9, 2025
