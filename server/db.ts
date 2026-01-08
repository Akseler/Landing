import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL or SUPABASE_DATABASE_URL environment variable is not set.");
  console.error("Please ensure the database is properly configured.");
  console.error("For Supabase, use the connection string from Settings > Database > Connection string > URI");
}

export const pool = databaseUrl 
  ? new Pool({ 
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export const db = pool 
  ? drizzle(pool, { schema })
  : null;

export async function testDatabaseConnection(): Promise<boolean> {
  if (!pool) {
    console.error("Database pool is not initialized - DATABASE_URL may be missing");
    return false;
  }
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
