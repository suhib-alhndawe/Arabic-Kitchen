import { isDatabaseConfigured, markDatabaseUnavailable, pool } from "./index";
import { logger } from "../logger";

export async function ensureDatabaseSchema() {
  if (!isDatabaseConfigured || !pool) {
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_ar TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL DEFAULT '🍖',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_ar TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        description_ar TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    markDatabaseUnavailable();
    logger.warn(
      { err },
      "Database is unavailable or DATABASE_URL is invalid. Falling back to read-only mode.",
    );
  }
}
