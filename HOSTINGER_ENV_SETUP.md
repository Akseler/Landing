# Fix Environment Variables on Hostinger

## The Problem
Docker Compose is showing warnings because the `.env` file is missing or not in the correct location.

## Quick Fix (One Command)

SSH into Hostinger and run:

```bash
cd ~/Landing && cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
ANALYTICS_PASSWORD=Akseler500*
PORT=3000
NODE_ENV=production
EOF
```

Then restart:

```bash
docker-compose down && docker-compose up -d
```

## Manual Setup

1. **SSH into Hostinger**
2. **Navigate to your project directory:**
   ```bash
   cd ~/Landing
   # or wherever your docker-compose.yml is located
   ```

3. **Create the .env file:**
   ```bash
   nano .env
   ```

4. **Paste this content:**
   ```bash
   DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
   ANALYTICS_PASSWORD=Akseler500*
   PORT=3000
   NODE_ENV=production
   ```

5. **Save the file:**
   - Press `Ctrl+X`
   - Press `Y` to confirm
   - Press `Enter` to save

6. **Verify the file exists:**
   ```bash
   cat .env
   ```
   You should see your environment variables.

7. **Restart Docker containers:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

8. **Check the logs (no more warnings!):**
   ```bash
   docker-compose logs --tail=50
   ```

   You should see:
   - ✅ No more "WARNING: The ... variable is not set" messages
   - ✅ "Database connection successful" message

## Verify It's Working

```bash
# Check container status
docker-compose ps

# Check logs for database connection
docker-compose logs | grep -i "database\|successful\|error"

# Test the API
curl http://localhost:3000/api/health
```

## Important Notes

- The `.env` file **must be in the same directory** as your `docker-compose.yml` file
- The `.env` file should **NOT** be committed to git (it's in `.gitignore`)
- If you need to add Google Calendar or GHL webhook later, just add those variables to `.env` and restart

## Optional Variables (Add Later If Needed)

If you want to use Google Calendar booking or GoHighLevel webhooks, add these to `.env`:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GHL_BOOKING_WEBHOOK_URL=your-webhook-url
```

These are optional - the app will work without them, just without those features.







