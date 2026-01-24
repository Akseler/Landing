# Google Calendar OAuth Setup

## Current Status

Your Google Calendar integration is **not configured**. This means:
- All time slots show as available (even if they're busy in your calendar)
- You need to set up OAuth credentials to check busy times

## How to Set Up

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   - Production: `https://akseler.lt/api/calendar/oauth/callback`
   - Development: `http://localhost:3000/api/calendar/oauth/callback`
7. Copy the **Client ID** and **Client Secret**

### 2. Add to .env File on Hostinger

SSH into Hostinger and edit `.env`:

```bash
cd ~/Landing
nano .env
```

Add these lines:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id-here
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALENDAR_ID=primary
```

Save and restart:

```bash
docker-compose down && docker-compose up -d
```

### 3. Authorize the Calendar

1. Visit: `https://akseler.lt/api/calendar/auth`
2. Sign in with your Google account
3. Grant calendar access
4. You'll be redirected back and see "Google Calendar Connected!"

### 4. Verify It's Working

Check the status:

```bash
curl https://akseler.lt/api/calendar/status
```

Should return:
```json
{
  "configured": true,
  "authorized": true,
  "message": "Google Calendar is connected"
}
```

### 5. Test Busy Times

After authorization, visit the booking page and check if busy times are marked as unavailable.

## Troubleshooting

- **"OAuth Not Configured"**: Add `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` to `.env`
- **"Not authorized"**: Visit `/api/calendar/auth` to authorize
- **"Token invalid"**: Re-authorize at `/api/calendar/auth`
- **All slots still showing**: Check server logs for calendar errors

## Notes

- The calendar integration only checks for **busy times** (existing events)
- It doesn't create events automatically
- The token is stored in `/app/data/google-calendar-token.json` in the container
- Tokens are automatically refreshed when expired




