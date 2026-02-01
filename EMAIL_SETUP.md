# Email Configuration Setup

The backend uses Gmail SMTP to send profile statistics via email. Follow these steps to configure it:

## 1. Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled
4. Go to **App passwords** (search for "App passwords" in the search bar)
5. Select app: **Mail**
6. Select device: **Other (Custom name)** - enter "System Collapse Backend"
7. Click **Generate**
8. Copy the 16-character password

## 2. Update .env File

Open `system_collapse_backend/.env` and update:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-character app password
```

## 3. Restart Backend Server

```bash
npm run dev
```

## Alternative Email Services

If you don't want to use Gmail, you can modify `src/services/emailService.ts` to use:

- **SendGrid**: Professional email service
- **AWS SES**: Amazon Simple Email Service  
- **Mailgun**: Developer-friendly email API
- **Resend**: Modern email API

Just update the transporter configuration in `emailService.ts`.

## Testing

1. Start the backend: `npm run dev`
2. Go to User Profile in the frontend
3. Click "Share score to email"
4. Enter an email address
5. Click "Share" - you should receive the email within seconds
