const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const postmark = require('postmark');
const { Resend } = require('resend');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.provider = process.env.MAIL_PROVIDER || 'smtp';
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      switch (this.provider.toLowerCase()) {
        case 'sendgrid':
          await this.initializeSendGrid();
          break;
        case 'ses':
        case 'aws':
          await this.initializeAWSSES();
          break;
        case 'postmark':
          await this.initializePostmark();
          break;
        case 'resend':
          await this.initializeResend();
          break;
        case 'smtp':
        default:
          await this.initializeSMTP();
          break;
      }
      
      this.initialized = true;
      logger.info(`Email service initialized with provider: ${this.provider}`);
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  async initializeSendGrid() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.sendMethod = this.sendWithSendGrid.bind(this);
  }

  async initializeAWSSES() {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials are required for SES provider');
    }
    
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.sendMethod = this.sendWithSES.bind(this);
  }

  async initializePostmark() {
    if (!process.env.POSTMARK_API_KEY) {
      throw new Error('POSTMARK_API_KEY is required for Postmark provider');
    }
    
    this.postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
    this.sendMethod = this.sendWithPostmark.bind(this);
  }

  async initializeResend() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for Resend provider');
    }
    
    this.resendClient = new Resend(process.env.RESEND_API_KEY);
    this.sendMethod = this.sendWithResend.bind(this);
  }

  async initializeSMTP() {
    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    this.transporter = nodemailer.createTransporter(config);
    
    // Verify connection
    await this.transporter.verify();
    this.sendMethod = this.sendWithSMTP.bind(this);
  }

  async sendWithSendGrid(mailOptions) {
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    };

    const result = await sgMail.send(msg);
    return {
      messageId: result[0].headers['x-message-id'],
      provider: 'sendgrid'
    };
  }

  async sendWithSES(mailOptions) {
    const params = {
      Source: mailOptions.from,
      Destination: {
        ToAddresses: [mailOptions.to]
      },
      Message: {
        Subject: {
          Data: mailOptions.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: mailOptions.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: mailOptions.text,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    const result = await this.sesClient.send(command);
    
    return {
      messageId: result.MessageId,
      provider: 'ses'
    };
  }

  async sendWithPostmark(mailOptions) {
    const result = await this.postmarkClient.sendEmail({
      From: mailOptions.from,
      To: mailOptions.to,
      Subject: mailOptions.subject,
      HtmlBody: mailOptions.html,
      TextBody: mailOptions.text
    });

    return {
      messageId: result.MessageID,
      provider: 'postmark'
    };
  }

  async sendWithResend(mailOptions) {
    const result = await this.resendClient.emails.send({
      from: mailOptions.from,
      to: [mailOptions.to],
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    });

    return {
      messageId: result.data.id,
      provider: 'resend'
    };
  }

  async sendWithSMTP(mailOptions) {
    const result = await this.transporter.sendMail(mailOptions);
    return {
      messageId: result.messageId,
      provider: 'smtp'
    };
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      await this.initialize();

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@promiserealty.com',
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent)
      };

      const result = await this.sendMethod(mailOptions);
      
      logger.info('Email sent successfully', {
        to: to,
        subject: subject,
        messageId: result.messageId,
        provider: result.provider
      });

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider
      };

    } catch (error) {
      logger.error('Email sending failed', {
        to: to,
        subject: subject,
        error: error.message,
        provider: this.provider
      });

      // Don't throw error - return success to prevent user enumeration
      return {
        success: false,
        error: error.message,
        provider: this.provider
      };
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  async sendPasswordResetEmail(email, resetToken, userAgent, ipAddress) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = this.generatePasswordResetHTML(resetUrl, resetToken);
    const textContent = this.generatePasswordResetText(resetUrl);

    const result = await this.sendEmail(
      email,
      'Reset your Promise Realty password',
      htmlContent,
      textContent
    );

    // Log the attempt (without sensitive data)
    logger.info('Password reset email sent', {
      email: email,
      success: result.success,
      userAgent: userAgent,
      ipAddress: ipAddress,
      provider: result.provider
    });

    return result;
  }

  generatePasswordResetHTML(resetUrl, token) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Promise Realty</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .footer { color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px; }
        .security-info { background-color: #e0f2fe; border: 1px solid #0284c7; border-radius: 6px; padding: 16px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Password Reset Request</h1>
        <p>Promise Realty Security Team</p>
    </div>
    
    <div class="content">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your Promise Realty account password. If you made this request, click the button below to set a new password:</p>
        
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        
        <div class="security-info">
            <h3>🛡️ Security Information</h3>
            <ul>
                <li><strong>This link expires in 15 minutes</strong> for your security</li>
                <li>This link can only be used once</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
            </ul>
        </div>
        
        <div class="warning">
            <h3>⚠️ Important Security Notice</h3>
            <p>If you didn't request this password reset, someone may be trying to access your account. Please:</p>
            <ul>
                <li>Do not click the reset link</li>
                <li>Contact our support team immediately</li>
                <li>Consider enabling two-factor authentication</li>
            </ul>
        </div>
        
        <p><strong>Having trouble?</strong> Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
            ${resetUrl}
        </p>
    </div>
    
    <div class="footer">
        <p>This email was sent by Promise Realty Security System</p>
        <p>If you have questions, contact us at support@promiserealty.com</p>
        <p>© ${new Date().getFullYear()} Promise Realty. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  generatePasswordResetText(resetUrl) {
    return `
PROMISE REALTY - PASSWORD RESET REQUEST

We received a request to reset your Promise Realty account password.

If you made this request, visit this link to set a new password:
${resetUrl}

SECURITY INFORMATION:
- This link expires in 15 minutes for your security
- This link can only be used once
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

IMPORTANT SECURITY NOTICE:
If you didn't request this password reset, someone may be trying to access your account. Please:
- Do not use the reset link
- Contact our support team immediately at support@promiserealty.com
- Consider enabling two-factor authentication

This email was sent by Promise Realty Security System.
© ${new Date().getFullYear()} Promise Realty. All rights reserved.
`;
  }
}

module.exports = new EmailService();