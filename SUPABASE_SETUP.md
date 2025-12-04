# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Wait for the database to be provisioned
3. Note your project URL and API keys

## 2. Get Database Connection String

1. In Supabase Dashboard, go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

## 3. Set Environment Variables

Create a `.env` file in the root directory (or set environment variables):

```bash
# Use either DATABASE_URL or SUPABASE_DATABASE_URL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Or use the pooler connection (recommended for production)
# DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password and `[PROJECT-REF]` with your project reference.

## 4. Push Database Schema

Run the following command to create all tables in Supabase:

```bash
npm run db:push
```

This will create the following tables:
- `users` - User accounts
- `registrations` - Registration submissions
- `analytics_sessions` - User session tracking
- `analytics_events` - Analytics events
- `quiz_responses` - Quiz/survey responses
- `call_funnel_submissions` - Call funnel submissions (survey -> email)

## 5. Verify Connection

Start the development server:

```bash
npm run dev
```

The server will automatically test the database connection on startup. Check the console for "Database connection successful" message.

## 6. Database Tables Overview

### `analytics_sessions`
Tracks user sessions with IP address, user agent, and visit timestamps.

### `analytics_events`
Tracks page views, button clicks, and other events per session.

### `quiz_responses`
Stores quiz/survey responses linked to sessions.

### `call_funnel_submissions`
Stores survey submissions from the `/survey` page (leads, value, closeRate, speed, email).

### `registrations`
Stores registration data from quiz submissions.

## 7. Connection Pooler (Recommended for Production)

For production, use Supabase's connection pooler:
- Port: `6543` (pooler) instead of `5432` (direct)
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

This allows more concurrent connections and better performance.

## Troubleshooting

### SSL Connection Issues
If you encounter SSL errors, the code automatically handles SSL for Supabase connections. Make sure your connection string includes `?sslmode=require` if needed.

### Connection Timeout
- Check that your IP is not blocked in Supabase Dashboard > Settings > Database > Connection Pooling
- Verify the connection string is correct
- Try using the pooler connection (port 6543) instead of direct connection (port 5432)

### Schema Push Fails
- Make sure you have the correct database password
- Check that the database is fully provisioned
- Verify your connection string format

