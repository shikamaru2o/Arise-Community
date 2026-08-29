require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!ADMIN_API_KEY) {
  console.error('ADMIN_API_KEY is not set. Exiting.');
  process.exit(1);
}

/**
 * Minimal CSP — only the external origins the site actually uses.
 * - Google Fonts CSS + font files (Fraunces, Work Sans)
 * - Content images served from this app's same-origin public directory
 * - Google Maps embed for the location section
 * Videos are served same-origin from /videos, so media-src 'self' suffices.
 * Inline <style> blocks are required by the React components.
 */
const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  imgSrc: [
    "'self'",
    'data:',
  ],
  mediaSrc: ["'self'"],
  connectSrc: ["'self'", 'https://checkout.razorpay.com', 'https://api.razorpay.com'],
  frameSrc: ["'self'", 'https://maps.google.com', 'https://www.google.com', 'https://checkout.razorpay.com'],
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
const GENDERS = ['Male', 'Female'];
const ROLES = [
  'Registration', 'Ushers', 'Parking', 'Security', 'Hospitality',
  'Prayer and Counselling', 'Production', 'Media', 'Stage',
  'Medical', 'Logistics',
];
const REGISTRATION_TYPES = {
  EVENT: { code: 'EVT', label: 'event_attendee' },
  VOLUNTEER: { code: 'VOL', label: 'volunteer' },
  CHURCH_MEMBER: { code: 'CHR', label: 'church_member' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9+()\-\s]{7,20}$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function razorpayRequest(pathname, method, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const request = https.request({
      hostname: 'api.razorpay.com',
      path: pathname,
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(responseBody); } catch { parsed = {}; }
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(parsed);
        const error = new Error('Razorpay request failed.');
        error.statusCode = response.statusCode;
        reject(error);
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
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
  if (!mobileNumber) errors.mobileNumber = 'Mobile number is required.';
  else if (!MOBILE_RE.test(mobileNumber)) errors.mobileNumber = 'Enter a valid mobile number.';
  else if (tooLong('mobileNumber', mobileNumber)) errors.mobileNumber = `Mobile number must be at most ${MAX_LENGTHS.mobileNumber} characters.`;
  if (!ageGroup) errors.ageGroup = 'Select an age group.';
  else if (!AGE_GROUPS.includes(ageGroup)) errors.ageGroup = 'Select a valid age group.';
  if (gender && !GENDERS.includes(gender)) errors.gender = 'Select a valid gender.';
  if (!churchName) errors.churchName = 'Church name is required.';
  else if (tooLong('churchName', churchName)) errors.churchName = `Church name must be at most ${MAX_LENGTHS.churchName} characters.`;
  if (pastorName && tooLong('pastorName', pastorName)) errors.pastorName = `Pastor's name must be at most ${MAX_LENGTHS.pastorName} characters.`;
  if (churchLocation && tooLong('churchLocation', churchLocation)) errors.churchLocation = `Church location must be at most ${MAX_LENGTHS.churchLocation} characters.`;
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

function validateEventRegistration(body) {
  const errors = {};
  const data = {
    firstName: cleanString(body.firstName),
    lastName: cleanString(body.lastName),
    mobileNumber: cleanString(body.mobileNumber),
    email: cleanString(body.email),
    area: cleanString(body.area),
    city: cleanString(body.city),
    consentConfirmed: body.consentConfirmed === true,
  };

  if (!data.firstName) errors.firstName = 'First name is required.';
  else if (tooLong('firstName', data.firstName)) errors.firstName = `First name must be at most ${MAX_LENGTHS.firstName} characters.`;
  if (!data.lastName) errors.lastName = 'Last name is required.';
  else if (tooLong('lastName', data.lastName)) errors.lastName = `Last name must be at most ${MAX_LENGTHS.lastName} characters.`;
  if (!data.mobileNumber) errors.mobileNumber = 'Mobile number is required.';
  else if (!MOBILE_RE.test(data.mobileNumber) || tooLong('mobileNumber', data.mobileNumber)) errors.mobileNumber = 'Enter a valid mobile number.';
  if (!data.email) errors.email = 'Email address is required.';
  else if (!EMAIL_RE.test(data.email) || tooLong('email', data.email)) errors.email = 'Enter a valid email address.';
  if (!data.area) errors.area = 'Area is required.';
  else if (tooLong('churchLocation', data.area)) errors.area = `Area must be at most ${MAX_LENGTHS.churchLocation} characters.`;
  if (!data.city) errors.city = 'City is required.';
  else if (tooLong('churchLocation', data.city)) errors.city = `City must be at most ${MAX_LENGTHS.churchLocation} characters.`;
  if (!data.consentConfirmed) errors.consentConfirmed = 'You must confirm that registration is voluntary.';
  return { errors, data };
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
      user: process.env.DB_USER || process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      maxIdle: parseInt(process.env.DB_POOL_IDLE, 10) || 10,
      idleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 60000,
      queueLimit: parseInt(process.env.DB_POOL_QUEUE_LIMIT, 10) || 0,
      enableKeepAlive: true,
    });

async function createRegistrationId(connection, registrationType) {
  const year = new Date().getFullYear();
  const { code, label } = registrationType;
  await connection.query(
    `INSERT INTO registration_counters (registration_type, registration_year, next_number)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE next_number = next_number`,
    [label, year]
  );
  const [counterRows] = await connection.query(
    `SELECT next_number FROM registration_counters
     WHERE registration_type = ? AND registration_year = ? FOR UPDATE`,
    [label, year]
  );
  const number = counterRows[0].next_number;
  await connection.query(
    `UPDATE registration_counters SET next_number = next_number + 1
     WHERE registration_type = ? AND registration_year = ?`,
    [label, year]
  );
  const registrationId = `${code}-${year}-${String(number).padStart(6, '0')}`;
  await connection.query(
    `INSERT INTO registration_ids (registration_id, registration_type)
     VALUES (?, ?)`,
    [registrationId, label]
  );
  return registrationId;
}

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

app.get('/api/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ success: true, database: 'connected' });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    return res.status(503).json({
      success: false,
      database: 'unreachable',
      error: 'Database connection failed.',
    });
  }
});

app.get('/api/health/db/table', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('Database table connection check failed:', err.message);
    return res.status(503).json({
      success: false,
      database: 'unreachable',
      table: 'volunteers',
      tableAccessible: false,
      error: 'Database connection failed.',
    });
  }

  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM volunteers');
    return res.json({
      success: true,
      database: 'connected',
      table: 'volunteers',
      tableAccessible: true,
      rowCount: Number(rows[0].count),
    });
  } catch (err) {
    console.error('Database table check failed:', err.message);
    return res.status(503).json({
      success: false,
      database: 'connected',
      table: 'volunteers',
      tableAccessible: false,
      error: 'Database table check failed.',
    });
  }
});

app.post('/api/donations/orders', async (req, res) => {
  const amount = Number(req.body && req.body.amount);
  if (!Number.isInteger(amount) || amount < 100 || amount > 10000000) {
    return res.status(400).json({ error: 'Enter a donation between INR 100 and INR 100,000.' });
  }
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Online donations are not configured yet.' });
  }

  try {
    const order = await razorpayRequest('/v1/orders', 'POST', {
      amount: amount * 100,
      currency: 'INR',
      receipt: `arise_${Date.now()}`,
    });
    return res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err.message);
    return res.status(502).json({ error: 'Could not start online donation. Please try again.' });
  }
});

app.post('/api/donations/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ error: 'Payment verification data is incomplete.' });
  }
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (!safeEqual(expectedSignature, razorpaySignature)) {
    return res.status(400).json({ error: 'Payment verification failed.' });
  }

  try {
    await pool.query(
      `INSERT INTO donations (provider, provider_order_id, provider_payment_id, status)
       VALUES (?, ?, ?, 'verified')
       ON DUPLICATE KEY UPDATE provider_payment_id = VALUES(provider_payment_id), status = 'verified'`,
      ['razorpay', razorpayOrderId, razorpayPaymentId]
    );
    return res.json({ success: true, paymentId: razorpayPaymentId });
  } catch (err) {
    console.error('Donation record failed:', err.message);
    return res.status(500).json({ error: 'Payment was verified but could not be recorded. Please contact us.' });
  }
});

app.post('/api/event-registrations', submitLimiter, async (req, res) => {
  const { errors, data } = validateEventRegistration(req.body || {});
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const registrationId = await createRegistrationId(connection, REGISTRATION_TYPES.EVENT);
    await connection.query(
      `INSERT INTO event_registrations
        (registration_id, first_name, last_name, mobile_number, email, area, city,
         consent_confirmed, registration_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [registrationId, data.firstName, data.lastName, data.mobileNumber, data.email,
        data.area, data.city, 1, REGISTRATION_TYPES.EVENT.label]
    );
    await connection.commit();
    return res.status(201).json({ success: true, registrationId });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Event registration failed:', err.message);
    return res.status(500).json({ error: 'Could not save your event registration. Please try again.' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/event-registrations', adminLimiter, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT registration_id, first_name, last_name, mobile_number, email,
              area, city, registration_type, created_at
       FROM event_registrations ORDER BY created_at DESC`
    );
    return res.json({ registrations: rows });
  } catch (err) {
    console.error('Event registration fetch failed:', err.message);
    return res.status(500).json({ error: 'Could not load event registrations.' });
  }
});

app.patch('/api/event-registrations/:registrationId/type', adminLimiter, requireAdmin, async (req, res) => {
  const requestedType = cleanString(req.body && req.body.registrationType);
  if (!['event_attendee', 'church_member'].includes(requestedType)) {
    return res.status(400).json({ error: 'Registration type must be event_attendee or church_member.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT registration_id FROM event_registrations
       WHERE registration_id = ? FOR UPDATE`,
      [req.params.registrationId]
    );
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Event registration not found.' });
    }

    const currentId = rows[0].registration_id;
    const currentPrefix = currentId.split('-')[0];
    const requestedRegistrationType = requestedType === 'church_member'
      ? REGISTRATION_TYPES.CHURCH_MEMBER
      : REGISTRATION_TYPES.EVENT;
    const nextId = currentPrefix === requestedRegistrationType.code
      ? currentId
      : await createRegistrationId(connection, requestedRegistrationType);
    await connection.query(
      `UPDATE event_registrations SET registration_id = ?, registration_type = ?
       WHERE registration_id = ?`,
      [nextId, requestedType, currentId]
    );
    await connection.commit();
    return res.json({ success: true, registrationId: nextId, registrationType: requestedType });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Event registration classification failed:', err.message);
    return res.status(500).json({ error: 'Could not update registration type.' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/volunteers', submitLimiter, async (req, res) => {
  const { errors, data } = validateSignup(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const registrationId = await createRegistrationId(connection, REGISTRATION_TYPES.VOLUNTEER);
    const [result] = await connection.query(
      `INSERT INTO volunteers
        (registration_id, first_name, last_name, mobile_number, email, age_group, gender,
         church_name, pastor_name, church_location, volunteer_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [registrationId,
        data.firstName, data.lastName, data.mobileNumber, data.email,
        data.ageGroup, data.gender || null, data.churchName, data.pastorName,
        data.churchLocation, data.volunteerRole,
      ]
    );
    await connection.commit();
    return res.status(201).json({ id: result.insertId, registrationId, createdAt: new Date().toISOString() });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Insert failed:', err.message);
    return res.status(500).json({ error: 'Could not save your registration. Please try again.' });
  } finally {
    if (connection) connection.release();
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
      `SELECT id, registration_id, first_name, last_name, mobile_number, email, age_group, gender,
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
