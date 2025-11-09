# SOS Email Integration - Usage Examples

## Overview
The SOS email notification system is now fully integrated with Nodemailer. It sends formatted emergency emails to `calhackswinners@gmail.com` when triggered.

## Backend Setup ✅

The backend email service is configured with:
- **Sender Email:** ngoat27@gmail.com
- **App Password:** wvsu hgch vqgq svqe (Google App Password)
- **Recipient:** calhackswinners@gmail.com

## API Endpoints

### 1. Send SOS Email
```
POST http://localhost:3001/api/notifications/email/sos
```

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "phoneNumber": "+1234567890",
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "San Francisco, CA"
  },
  "timestamp": "2025-01-09T12:00:00.000Z",
  "message": "Emergency help needed!",
  "urgencyLevel": "high"
}
```

**Urgency Levels:**
- `low` 🟢 - Low priority
- `medium` 🟡 - Medium priority (default)
- `high` 🟠 - High priority
- `critical` 🔴 - Critical emergency

### 2. Check Email Service Status
```
GET http://localhost:3001/api/notifications/email/status
```

### 3. Send Test Email
```
POST http://localhost:3001/api/notifications/email/test
```

## Frontend Usage Examples

### Example 1: Simple SOS Button

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendSOSWithLocation } from '@/lib/sosEmail';
import { useToast } from '@/hooks/use-toast';

export const SOSButton = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSOS = async () => {
    setIsSending(true);

    try {
      const result = await sendSOSWithLocation(
        {
          userEmail: 'user@example.com',
          userName: 'John Doe',
          phoneNumber: '+1234567890',
          message: 'Emergency SOS triggered from app',
        },
        'critical' // urgency level
      );

      if (result.success) {
        toast({
          title: 'SOS Sent!',
          description: 'Emergency notification has been sent.',
        });
      } else {
        toast({
          title: 'Failed to Send SOS',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send SOS notification',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={handleSOS}
      disabled={isSending}
      className="bg-red-600 hover:bg-red-700"
    >
      {isSending ? 'Sending SOS...' : '🚨 EMERGENCY SOS'}
    </Button>
  );
};
```

### Example 2: SOS with Form

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { sendSOSWithLocation } from '@/lib/sosEmail';

export const SOSForm = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    phoneNumber: '',
    message: '',
    urgencyLevel: 'high' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const result = await sendSOSWithLocation(
        {
          userName: formData.userName,
          userEmail: formData.userEmail,
          phoneNumber: formData.phoneNumber,
          message: formData.message,
        },
        formData.urgencyLevel
      );

      if (result.success) {
        alert('SOS notification sent successfully!');
        // Reset form
        setFormData({
          userName: '',
          userEmail: '',
          phoneNumber: '',
          message: '',
          urgencyLevel: 'high',
        });
      } else {
        alert(`Failed to send SOS: ${result.error}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Your Name"
        value={formData.userName}
        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
        required
      />
      <Input
        type="email"
        placeholder="Your Email"
        value={formData.userEmail}
        onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
        required
      />
      <Input
        type="tel"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
      />
      <Textarea
        placeholder="Describe your emergency..."
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <Button
        type="submit"
        disabled={isSending}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        {isSending ? 'Sending...' : '🚨 Send Emergency SOS'}
      </Button>
    </form>
  );
};
```

### Example 3: Quick SOS with User Context

```tsx
import { useUser } from '@/contexts/UserContext';
import { sendSOSWithLocation } from '@/lib/sosEmail';

export const QuickSOS = () => {
  const { user } = useUser();

  const sendQuickSOS = async () => {
    if (!user) return;

    const result = await sendSOSWithLocation(
      {
        userName: `${user.first_name} ${user.last_name}`,
        userEmail: user.email,
        phoneNumber: user.phone_number,
        message: 'Quick SOS triggered - immediate assistance needed',
      },
      'critical'
    );

    if (result.success) {
      console.log('SOS sent successfully');
    }
  };

  return (
    <button onClick={sendQuickSOS}>
      🚨 Quick SOS
    </button>
  );
};
```

## Email Content

The SOS email includes:
- ✅ Styled HTML email with T-Mobile branding
- ✅ User information (name, email, phone)
- ✅ Location with Google Maps link
- ✅ Urgency level with color coding
- ✅ Timestamp
- ✅ Custom message
- ✅ Recommended actions for responders
- ✅ Plain text fallback

## Testing

### Test the email service:
```bash
curl -X POST http://localhost:3001/api/notifications/email/test
```

### Send a test SOS:
```bash
curl -X POST http://localhost:3001/api/notifications/email/sos \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Test User",
    "userEmail": "test@example.com",
    "phoneNumber": "+1234567890",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "San Francisco, CA"
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "message": "This is a test SOS",
    "urgencyLevel": "high"
  }'
```

## Security Notes

⚠️ **IMPORTANT:** The email credentials are currently hardcoded in the backend. For production:
1. Move credentials to environment variables
2. Use a secure secret management system
3. Implement rate limiting to prevent abuse
4. Add authentication to the SOS endpoint
5. Consider using a dedicated email service (SendGrid, AWS SES, etc.)

## Next Steps

1. Add SOS button to your Help or Network Status pages
2. Integrate with user authentication to auto-fill user details
3. Add confirmation dialog before sending
4. Implement SOS history tracking
5. Add admin dashboard to view SOS requests
