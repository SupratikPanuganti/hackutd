import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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

export interface SupportTicketData {
  userEmail: string;
  userName?: string;
  subject: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private configured: boolean = false;
  private readonly senderEmail = 'ngoat27@gmail.com';
  private readonly senderPassword = 'wvsu hgch vqgq svqe';
  private readonly recipientEmail = 'calhackwinners@gmail.com';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // Create transporter using Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.senderEmail,
          pass: this.senderPassword,
        },
      });

      this.configured = true;
      console.log('[EmailService] Email service configured successfully');

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('[EmailService] Connection verification failed:', error);
          this.configured = false;
        } else {
          console.log('[EmailService] Server is ready to send emails');
        }
      });
    } catch (error) {
      console.error('[EmailService] Failed to initialize email transporter:', error);
      this.configured = false;
    }
  }

  public isServiceConfigured(): boolean {
    return this.configured && this.transporter !== null;
  }

  /**
   * Send SOS emergency notification email
   */
  public async sendSOSNotification(data: SOSEmailData): Promise<EmailResult> {
    if (!this.isServiceConfigured() || !this.transporter) {
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const urgencyEmoji = this.getUrgencyEmoji(data.urgencyLevel);
      const urgencyLabel = (data.urgencyLevel || 'medium').toUpperCase();

      // Build location info
      let locationInfo = 'Location not provided';
      if (data.location) {
        locationInfo = `
          <p><strong>📍 Location:</strong></p>
          <ul>
            <li><strong>Coordinates:</strong> ${data.location.latitude}, ${data.location.longitude}</li>
            ${data.location.address ? `<li><strong>Address:</strong> ${data.location.address}</li>` : ''}
            <li><strong>Google Maps:</strong> <a href="https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}" target="_blank">View on Map</a></li>
          </ul>
        `;
      }

      // Compose HTML email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #5A0040 0%, #E20074 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .urgency-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .urgency-critical {
              background: #dc3545;
              color: white;
            }
            .urgency-high {
              background: #ff6b6b;
              color: white;
            }
            .urgency-medium {
              background: #ffa500;
              color: white;
            }
            .urgency-low {
              background: #28a745;
              color: white;
            }
            .info-section {
              background: white;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #E20074;
              border-radius: 4px;
            }
            .timestamp {
              color: #666;
              font-size: 14px;
            }
            ul {
              list-style: none;
              padding-left: 0;
            }
            ul li {
              padding: 5px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 SOS EMERGENCY ALERT 🚨</h1>
            <p>T-Care Emergency Notification System</p>
          </div>

          <div class="content">
            <div class="urgency-badge urgency-${data.urgencyLevel || 'medium'}">
              ${urgencyEmoji} URGENCY: ${urgencyLabel}
            </div>

            <div class="info-section">
              <h2>📋 User Information</h2>
              <ul>
                ${data.userName ? `<li><strong>Name:</strong> ${data.userName}</li>` : ''}
                ${data.userEmail ? `<li><strong>Email:</strong> ${data.userEmail}</li>` : ''}
                ${data.phoneNumber ? `<li><strong>Phone:</strong> ${data.phoneNumber}</li>` : ''}
                <li class="timestamp"><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</li>
              </ul>
            </div>

            <div class="info-section">
              ${locationInfo}
            </div>

            ${data.message ? `
              <div class="info-section">
                <h2>💬 Message</h2>
                <p>${data.message}</p>
              </div>
            ` : ''}

            <div class="info-section">
              <h2>⚡ Recommended Actions</h2>
              <ul>
                <li>✓ Contact user immediately via phone</li>
                <li>✓ Verify user's safety status</li>
                <li>✓ Check network connectivity in user's area</li>
                <li>✓ Dispatch support if needed</li>
                ${data.urgencyLevel === 'critical' || data.urgencyLevel === 'high' ? '<li style="color: #dc3545;"><strong>⚠️ High priority - immediate response required</strong></li>' : ''}
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated emergency notification from T-Care</p>
            <p>Please respond promptly to ensure user safety</p>
          </div>
        </body>
        </html>
      `;

      // Plain text version
      const textContent = `
🚨 SOS EMERGENCY ALERT 🚨
T-Care Emergency Notification System

URGENCY: ${urgencyLabel} ${urgencyEmoji}

USER INFORMATION:
${data.userName ? `Name: ${data.userName}` : ''}
${data.userEmail ? `Email: ${data.userEmail}` : ''}
${data.phoneNumber ? `Phone: ${data.phoneNumber}` : ''}
Time: ${new Date(data.timestamp).toLocaleString()}

LOCATION:
${data.location ? `Coordinates: ${data.location.latitude}, ${data.location.longitude}` : 'Location not provided'}
${data.location?.address ? `Address: ${data.location.address}` : ''}
${data.location ? `Google Maps: https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}` : ''}

${data.message ? `MESSAGE:\n${data.message}` : ''}

RECOMMENDED ACTIONS:
- Contact user immediately via phone
- Verify user's safety status
- Check network connectivity in user's area
- Dispatch support if needed
${data.urgencyLevel === 'critical' || data.urgencyLevel === 'high' ? '⚠️ High priority - immediate response required' : ''}

---
This is an automated emergency notification from T-Care
Please respond promptly to ensure user safety
      `;

      // Send email
      const info = await this.transporter.sendMail({
        from: `"T-Care Emergency System" <${this.senderEmail}>`,
        to: this.recipientEmail,
        subject: `🚨 URGENT: SOS Alert ${data.userName ? `from ${data.userName}` : ''} - ${urgencyLabel}`,
        text: textContent,
        html: htmlContent,
        priority: data.urgencyLevel === 'critical' || data.urgencyLevel === 'high' ? 'high' : 'normal',
      });

      console.log('[EmailService] SOS email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('[EmailService] Failed to send SOS email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send support ticket notification email
   */
  public async sendSupportTicket(data: SupportTicketData): Promise<EmailResult> {
    if (!this.isServiceConfigured() || !this.transporter) {
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const priorityEmoji = this.getPriorityEmoji(data.priority);
      const priorityLabel = (data.priority || 'medium').toUpperCase();

      // Compose HTML email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #5A0040 0%, #E20074 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .priority-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .priority-high {
              background: #ff6b6b;
              color: white;
            }
            .priority-medium {
              background: #ffa500;
              color: white;
            }
            .priority-low {
              background: #28a745;
              color: white;
            }
            .info-section {
              background: white;
              padding: 15px;
              margin: 15px 0;
              border-left: 4px solid #E20074;
              border-radius: 4px;
            }
            .ticket-subject {
              font-size: 20px;
              font-weight: bold;
              color: #5A0040;
              margin: 10px 0;
            }
            .description-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 10px 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .timestamp {
              color: #666;
              font-size: 14px;
            }
            ul {
              list-style: none;
              padding-left: 0;
            }
            ul li {
              padding: 5px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎫 New Support Ticket</h1>
            <p>T-Care Customer Support System</p>
          </div>

          <div class="content">
            <div class="priority-badge priority-${data.priority || 'medium'}">
              ${priorityEmoji} PRIORITY: ${priorityLabel}
            </div>

            <div class="info-section">
              <h2>📋 Ticket Information</h2>
              <div class="ticket-subject">${data.subject}</div>
              ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
              <p class="timestamp"><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            </div>

            <div class="info-section">
              <h2>👤 Customer Information</h2>
              <ul>
                ${data.userName ? `<li><strong>Name:</strong> ${data.userName}</li>` : ''}
                <li><strong>Email:</strong> ${data.userEmail}</li>
              </ul>
            </div>

            <div class="info-section">
              <h2>📝 Issue Description</h2>
              <div class="description-box">${data.description}</div>
            </div>

            <div class="info-section">
              <h2>⚡ Next Steps</h2>
              <ul>
                <li>✓ Review ticket details</li>
                <li>✓ Respond to customer within 24 hours</li>
                <li>✓ Assign to appropriate support team member</li>
                <li>✓ Track resolution progress</li>
                ${data.priority === 'high' ? '<li style="color: #ff6b6b;"><strong>⚠️ High priority - expedite response</strong></li>' : ''}
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated support ticket notification from T-Care</p>
            <p>Please respond to the customer promptly</p>
          </div>
        </body>
        </html>
      `;

      // Plain text version
      const textContent = `
🎫 NEW SUPPORT TICKET
T-Care Customer Support System

PRIORITY: ${priorityLabel} ${priorityEmoji}

TICKET INFORMATION:
Subject: ${data.subject}
${data.category ? `Category: ${data.category}` : ''}
Submitted: ${new Date(data.timestamp).toLocaleString()}

CUSTOMER INFORMATION:
${data.userName ? `Name: ${data.userName}` : ''}
Email: ${data.userEmail}

ISSUE DESCRIPTION:
${data.description}

NEXT STEPS:
- Review ticket details
- Respond to customer within 24 hours
- Assign to appropriate support team member
- Track resolution progress
${data.priority === 'high' ? '⚠️ High priority - expedite response' : ''}

---
This is an automated support ticket notification from T-Care
Please respond to the customer promptly
      `;

      // Send email to support team
      const info = await this.transporter.sendMail({
        from: `"T-Care Support System" <${this.senderEmail}>`,
        to: this.recipientEmail,
        replyTo: data.userEmail,
        subject: `🎫 New Support Ticket: ${data.subject}`,
        text: textContent,
        html: htmlContent,
        priority: data.priority === 'high' ? 'high' : 'normal',
      });

      console.log('[EmailService] Support ticket email sent successfully:', info.messageId);

      // Send confirmation email to user
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #5A0040 0%, #E20074 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .confirmation-box {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-left: 4px solid #28a745;
              border-radius: 4px;
            }
            .ticket-details {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Support Ticket Received</h1>
            <p>T-Care Customer Support</p>
          </div>

          <div class="content">
            <div class="confirmation-box">
              <h2>Thank you for contacting T-Care Support!</h2>
              <p>We've received your support ticket and our team will get back to you within 24 hours.</p>
            </div>

            <div class="ticket-details">
              <h3>Your Ticket Details:</h3>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
              ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
              <br>
              <p><strong>Description:</strong></p>
              <p style="white-space: pre-wrap;">${data.description}</p>
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your ticket</li>
              <li>You'll receive a response via email within 24 hours</li>
              <li>We'll keep you updated on the progress</li>
            </ul>

            <p>If you have any urgent concerns, please don't hesitate to contact us.</p>
          </div>

          <div class="footer">
            <p>T-Care Customer Support</p>
            <p>This is an automated confirmation email</p>
          </div>
        </body>
        </html>
      `;

      // Send confirmation to user
      await this.transporter.sendMail({
        from: `"T-Care Support" <${this.senderEmail}>`,
        to: data.userEmail,
        subject: `✅ Support Ticket Received: ${data.subject}`,
        html: confirmationHtml,
        text: `Thank you for contacting T-Care Support!\n\nWe've received your support ticket and our team will get back to you within 24 hours.\n\nTicket Details:\nSubject: ${data.subject}\nSubmitted: ${new Date(data.timestamp).toLocaleString()}\n\nOur support team will review your ticket and respond via email.`,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('[EmailService] Failed to send support ticket email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send test email to verify configuration
   */
  public async sendTestEmail(): Promise<EmailResult> {
    if (!this.isServiceConfigured() || !this.transporter) {
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"T-Care Test" <${this.senderEmail}>`,
        to: this.recipientEmail,
        subject: '✅ T-Care Email Service Test',
        text: 'This is a test email from T-Care. If you received this, the email service is working correctly!',
        html: '<b>This is a test email from T-Care.</b><p>If you received this, the email service is working correctly!</p>',
      });

      console.log('[EmailService] Test email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('[EmailService] Failed to send test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getPriorityEmoji(level?: string): string {
    switch (level) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🟡';
    }
  }

  private getUrgencyEmoji(level?: string): string {
    switch (level) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🟡';
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
