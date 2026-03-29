import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;
const missingDatabaseUrlMessage =
  "DATABASE_URL must be set. Did you forget to provision a database?";
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
export let isDatabaseConfigured = hasDatabaseUrl;

export function markDatabaseUnavailable() {
  isDatabaseConfigured = false;
}

export const pool = hasDatabaseUrl
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(missingDatabaseUrlMessage);
        },
      },
    );

export * from "./schema";
