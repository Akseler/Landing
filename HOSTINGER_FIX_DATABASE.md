# Fix Database Connection on Hostinger

## Quick Fix - Set Environment Variable

SSH into your Hostinger server and run these commands:

### Option 1: Create .env file (Recommended)

```bash
cd ~/Landing
nano .env
```

Add this content (replace with your actual DATABASE_URL if different):

```bash
DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
ANALYTICS_PASSWORD=Akseler500*
PORT=3000
NODE_ENV=production
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Option 2: Export in current session (Temporary)

```bash
export DATABASE_URL="postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
export ANALYTICS_PASSWORD="Akseler500*"
export PORT=3000
export NODE_ENV=production
```

## If using Docker Compose:

Edit your `docker-compose.yml` or ensure `.env` file exists in the project directory.

Then restart:

```bash
docker-compose down
docker-compose up -d
```

## If using PM2 or npm start:

1. Stop the current process
2. Set environment variables
3. Restart

```bash
pm2 stop landing-vol69  # or whatever your process name is
export DATABASE_URL="postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
export ANALYTICS_PASSWORD="Akseler500*"
pm2 restart landing-vol69 --update-env
```

## If using systemd service:

Create/edit `/etc/systemd/system/landing.service`:

```ini
[Unit]
Description=Landing App
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/Landing
Environment="DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
Environment="ANALYTICS_PASSWORD=Akseler500*"
Environment="PORT=3000"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl restart landing
sudo systemctl status landing
```

## Verify Database Connection

After restarting, check the logs:

```bash
# If using PM2
pm2 logs landing-vol69

# If using Docker
docker-compose logs -f

# If using systemd
sudo journalctl -u landing -f
```

You should see: **"Database connection successful"**

## Test the connection manually

SSH into Hostinger and test:

```bash
cd ~/Landing
export DATABASE_URL="postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
curl http://localhost:3000/api/health
```

This should return: `{"status":"ok","timestamp":"..."}`




