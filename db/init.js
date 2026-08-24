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
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
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