require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 4000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error('ADMIN_API_KEY is not set. Exiting.');
  process.exit(1);
}

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

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
  if (!lastName) errors.lastName = 'Last name is required.';
  if (!email) errors.email = 'Email address is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (mobileNumber && !MOBILE_RE.test(mobileNumber)) {
    errors.mobileNumber = 'Enter a valid mobile number.';
  }
  if (!ageGroup) errors.ageGroup = 'Select an age group.';
  else if (!AGE_GROUPS.includes(ageGroup)) errors.ageGroup = 'Select a valid age group.';
  if (gender && !GENDERS.includes(gender)) errors.gender = 'Select a valid gender.';
  if (!churchName) errors.churchName = "Church name is required.";
  if (!pastorName) errors.pastorName = "Pastor's name is required.";
  if (!churchLocation) errors.churchLocation = 'Church location is required.';
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

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this device. Please try again later.' },
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

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
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

app.get('/api/volunteers', requireAdmin, async (req, res) => {
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

app.get('/api/volunteers/summary', requireAdmin, async (_req, res) => {
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

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path === '/health') return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`Arise site + API listening on port ${PORT}`);
});
