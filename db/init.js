/**
 * Reproducible, idempotent, non-destructive database initialization.
 *
 * Usage:
 *   node db/init.js
 *
 * This will:
 *   - Create the `volunteers` table if it does not exist (never drops/alters existing data).
 *   - Create the supporting indexes if they do not already exist.
 *
 * Run from the repo root after setting DB_* or DATABASE_URL environment variables.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = process.env.DATABASE_URL
    ? mysql.createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: 2,
      })
    : mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || process.env.DB_DATABASE,
        connectionLimit: 2,
      });

  try {
    const connection = await pool.getConnection();
    try {
      console.log('Connected to MySQL. Ensuring schema...');

      // Non-destructive: CREATE TABLE IF NOT EXISTS preserves any existing table/data.
      await connection.query(`
        CREATE TABLE IF NOT EXISTS volunteers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          mobile_number VARCHAR(20),
          email VARCHAR(255) NOT NULL,
          age_group ENUM('15-21', '21-30', '30 Above') NOT NULL,
          gender ENUM('Male', 'Female', 'Third Choice'),
          church_name VARCHAR(255) NOT NULL,
          pastor_name VARCHAR(255) NOT NULL,
          church_location VARCHAR(255) NOT NULL,
          volunteer_role ENUM(
            'Registration', 'Ushers', 'Parking', 'Security', 'Hospitality',
            'Prayers & Counselling', 'Production', 'Media', 'Stage',
            'Medical', 'Logistics', 'Leadership'
          ) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      // Create indexes only if they don't already exist (idempotent).
      await connection.query(
        'CREATE INDEX idx_volunteers_role ON volunteers (volunteer_role)'
      ).catch(() => {}); // Ignore "index already exists"
      await connection.query(
        'CREATE INDEX idx_volunteers_created_at ON volunteers (created_at)'
      ).catch(() => {}); // Ignore "index already exists"

      await connection.query(
        'ALTER TABLE volunteers ADD COLUMN registration_id VARCHAR(20) NULL'
      ).catch(() => {}); // Ignore "duplicate column"
      await connection.query(
        'CREATE UNIQUE INDEX idx_volunteers_registration_id ON volunteers (registration_id)'
      ).catch(() => {}); // Ignore "index already exists"

      await connection.query(`
        CREATE TABLE IF NOT EXISTS registration_counters (
          registration_type VARCHAR(32) NOT NULL,
          registration_year SMALLINT UNSIGNED NOT NULL,
          next_number INT UNSIGNED NOT NULL DEFAULT 1,
          PRIMARY KEY (registration_type, registration_year)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS registration_ids (
          registration_id VARCHAR(20) PRIMARY KEY,
          registration_type VARCHAR(32) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_registration_ids_type (registration_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS event_registrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          registration_id VARCHAR(20) NOT NULL UNIQUE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          area VARCHAR(255) NOT NULL,
          city VARCHAR(255) NOT NULL,
          consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
          registration_type VARCHAR(32) NOT NULL DEFAULT 'event_attendee',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_event_registrations_email (email),
          INDEX idx_event_registrations_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS donations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          provider VARCHAR(32) NOT NULL,
          provider_order_id VARCHAR(64) NOT NULL UNIQUE,
          provider_payment_id VARCHAR(64) UNIQUE,
          status ENUM('verified') NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_donations_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      console.log('Schema is up to date.');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();