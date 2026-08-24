require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error('ADMIN_API_KEY is not set. Exiting.');
  process.exit(1);
}

/**
 * Minimal CSP — only the external origins the site actually uses.
 * - Google Fonts CSS + font files (Fraunces, Work Sans)
 * - Content images hosted on lightcyan-elephant-814869.hostingersite.com
 * - Google Maps embed for the location section
 * Videos are served same-origin from /videos, so media-src 'self' suffices.
 * Inline <style> blocks are required by the React components.
 */
const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  imgSrc: [
    "'self'",
    'data:',
    'https://lightcyan-elephant-814869.hostingersite.com',
  ],
  mediaSrc: ["'self'"],
  connectSrc: ["'self'"],
  frameSrc: ["'self'", 'https://maps.google.com'],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'self'"],
};

const MAX_LENGTHS = {
  firstName: 100,
  lastName: 100,
  mobileNumber: 20,
  email: 255,
  churchName: 255,
  pastorName: 255,
  churchLocation: 255,
};

const AGE_GROUPS = ['15-21', '21-30', '30 Above'];
const GENDERS = ['Male', 'Female', 'Third Choice'];
const ROLES = [
  'Registration', 'Ushers', 'Parking', 'Security', 'Hospitality',
  'Prayers & Counselling', 'Production', 'Media', 'Stage',
  'Medical', 'Logistics', 'Leadership',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9+()\-\s]{7,20}$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function tooLong(field, value) {
  return value.length > MAX_LENGTHS[field];
}

function validateSignup(body) {
  const errors = {};

  const firstName = cleanString(body.firstName);
  const lastName = cleanString(body.lastName);
  const mobileNumber = cleanString(body.mobileNumber);
  const email = cleanString(body.email);
  const ageGroup = cleanString(body.ageGroup);
  const gender = cleanString(body.gender);
  const churchName = cleanString(body.churchName);
  const pastorName = cleanString(body.pastorName);
  const churchLocation = cleanString(body.churchLocation);
  const volunteerRole = cleanString(body.volunteerRole);

  if (!firstName) errors.firstName = 'First name is required.';
  else if (tooLong('firstName', firstName)) errors.firstName = `First name must be at most ${MAX_LENGTHS.firstName} characters.`;
  if (!lastName) errors.lastName = 'Last name is required.';
  else if (tooLong('lastName', lastName)) errors.lastName = `Last name must be at most ${MAX_LENGTHS.lastName} characters.`;
  if (!email) errors.email = 'Email address is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  else if (tooLong('email', email)) errors.email = `Email must be at most ${MAX_LENGTHS.email} characters.`;
  if (mobileNumber) {
    if (!MOBILE_RE.test(mobileNumber)) errors.mobileNumber = 'Enter a valid mobile number.';
    else if (tooLong('mobileNumber', mobileNumber)) errors.mobileNumber = `Mobile number must be at most ${MAX_LENGTHS.mobileNumber} characters.`;
  }
  if (!ageGroup) errors.ageGroup = 'Select an age group.';
  else if (!AGE_GROUPS.includes(ageGroup)) errors.ageGroup = 'Select a valid age group.';
  if (gender && !GENDERS.includes(gender)) errors.gender = 'Select a valid gender.';
  if (!churchName) errors.churchName = "Church name is required.";
  else if (tooLong('churchName', churchName)) errors.churchName = `Church name must be at most ${MAX_LENGTHS.churchName} characters.`;
  if (!pastorName) errors.pastorName = "Pastor's name is required.";
  else if (tooLong('pastorName', pastorName)) errors.pastorName = `Pastor's name must be at most ${MAX_LENGTHS.pastorName} characters.`;
  if (!churchLocation) errors.churchLocation = 'Church location is required.';
  else if (tooLong('churchLocation', churchLocation)) errors.churchLocation = `Church location must be at most ${MAX_LENGTHS.churchLocation} characters.`;
  if (!volunteerRole) errors.volunteerRole = 'Select a preferred volunteer role.';
  else if (!ROLES.includes(volunteerRole)) errors.volunteerRole = 'Select a valid volunteer role.';

  return {
    errors,
    data: {
      firstName, lastName, mobileNumber, email, ageGroup, gender,
      churchName, pastorName, churchLocation, volunteerRole,
    },
  };
}

// Configurable MySQL connection pool. Never create a connection per request.
const pool = process.env.DATABASE_URL
  ? mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      maxIdle: parseInt(process.env.DB_POOL_IDLE, 10) || 10,
      idleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 60000,
      queueLimit: parseInt(process.env.DB_POOL_QUEUE_LIMIT, 10) || 0,
      enableKeepAlive: true,
    })
  : mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      maxIdle: parseInt(process.env.DB_POOL_IDLE, 10) || 10,
      idleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 60000,
      queueLimit: parseInt(process.env.DB_POOL_QUEUE_LIMIT, 10) || 0,
      enableKeepAlive: true,
    });

pool.on('error', (err) => {
  console.error('MySQL pool error:', err.message);
});

const app = express();

app.set('trust proxy', 1); // Hostinger/load balancer: use real client IP for rate limiting

app.use(
  helmet({
    contentSecurityPolicy: { directives: CSP_DIRECTIVES },
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.use(express.json({ limit: '20kb' }));

// CORS is only needed if the frontend is hosted separately from the API.
// Same-origin deployments (Hostinger) don't need it. Configure via CORS_ORIGIN.
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (corsOrigins.length > 0) {
  const cors = require('cors');
  app.use(
    cors({
      origin(origin, callback) {
        // Allow requests without an Origin (same-origin fetch, curl, health checks).
        if (!origin || corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by CORS.'));
      },
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'x-admin-key'],
      maxAge: 86400,
    })
  );
}

/** Constant-time comparison to mitigate timing side-channels on the admin key. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this device. Please try again later.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests. Please try again later.' },
});

app.get('/health', async (_req, res) => {
  let db = 'ok';
  try {
    await pool.query('SELECT 1');
  } catch {
    db = 'unreachable';
  }
  const healthy = db === 'ok';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/volunteers', submitLimiter, async (req, res) => {
  const { errors, data } = validateSignup(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO volunteers
        (first_name, last_name, mobile_number, email, age_group, gender,
         church_name, pastor_name, church_location, volunteer_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.firstName, data.lastName, data.mobileNumber || null, data.email,
        data.ageGroup, data.gender || null, data.churchName, data.pastorName,
        data.churchLocation, data.volunteerRole,
      ]
    );
    return res.status(201).json({ id: result.insertId, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Insert failed:', err.message);
    return res.status(500).json({ error: 'Could not save your registration. Please try again.' });
  }
});

function requireAdmin(req, res, next) {
  const key = req.header('x-admin-key');
  if (!key || !safeEqual(key, ADMIN_API_KEY)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  res.set('Cache-Control', 'no-store');
  next();
}

app.get('/api/volunteers', adminLimiter, requireAdmin, async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 50, 1), 200);
  const offset = (page - 1) * pageSize;

  const roleFilter = cleanString(req.query.role);
  const hasRoleFilter = roleFilter && ROLES.includes(roleFilter);
  const whereClause = hasRoleFilter ? 'WHERE volunteer_role = ?' : '';
  const whereParams = hasRoleFilter ? [roleFilter] : [];

  try {
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM volunteers ${whereClause}`,
      whereParams
    );
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, mobile_number, email, age_group, gender,
              church_name, pastor_name, church_location, volunteer_role, created_at
       FROM volunteers ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...whereParams, pageSize, offset]
    );
    return res.json({
      total: countRows[0].count,
      page,
      pageSize,
      volunteers: rows,
    });
  } catch (err) {
    console.error('Fetch failed:', err.message);
    return res.status(500).json({ error: 'Could not load registrations.' });
  }
});

app.get('/api/volunteers/summary', adminLimiter, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT volunteer_role, COUNT(*) AS count
       FROM volunteers GROUP BY volunteer_role ORDER BY count DESC`
    );
    return res.json({ summary: rows });
  } catch (err) {
    console.error('Summary failed:', err.message);
    return res.status(500).json({ error: 'Could not load summary.' });
  }
});

// Serve the production React build (generated into /public by `npm run build`).
const publicDir = path.join(__dirname, 'public');
app.use(
  express.static(publicDir, {
    maxAge: '7d',
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.set('Cache-Control', 'no-store');
      }
    },
  })
);

// SPA fallback — any non-API path serves the React app entry.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

// Centralized error handler.
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Please check your input.' });
  }
  if (err.message === 'Origin not allowed by CORS.') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  console.error('Unhandled error:', err.message);
  return res.status(500).json({ error: 'Internal server error.' });
});

const server = app.listen(PORT, () => {
  console.log(`Arise site + API listening on port ${PORT} (${NODE_ENV})`);
});

// Graceful shutdown: stop accepting connections, drain and close the pool.
function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    pool.end().then(
      () => process.exit(0),
      (err) => {
        console.error('Error closing pool:', err.message);
        process.exit(1);
      }
    );
  });
  // Force-exit if connections hang after 10s.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));