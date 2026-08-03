const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto    = require('crypto');

const createOrderRoute    = require('./routes/createOrder');
const verifyPaymentRoute  = require('./routes/verifyPayment');
const validateVpaRoute    = require('./routes/validateVpa');
const submitOrderRoute    = require('./routes/submitOrder');
const bookAppointmentRoute = require('./routes/bookAppointment');
const dynamicContentRoute  = require('./routes/dynamicContent');
const orderActionsRoute    = require('./routes/orderActions');
const adminOrdersRoute     = require('./routes/adminOrders');
const shiprocketWebhookRoute = require('./routes/shiprocketWebhook');
const zohoSignRoute          = require('./routes/zohoSign');
const zohoCampaignsRoute     = require('./routes/zohoCampaigns');
const zohoDeskRoute          = require('./routes/zohoDesk');

const app  = express();
app.set('trust proxy', 1); // Trust proxy for accurate rate limiting
const PORT = process.env.PORT || 5001;

// ── Resolve the built React frontend (dist/) ──────────────────
// Try multiple possible locations for dist/ to handle different
// working directory setups on various hosting platforms.
const possibleDistDirs = [
  path.join(__dirname, '..', 'dist'),   // Normal: backend/../dist
  path.join(process.cwd(), 'dist'),     // Fallback: cwd/dist
];
const DIST_DIR = possibleDistDirs.find(d => fs.existsSync(path.join(d, 'index.html')))
  || possibleDistDirs[0]; // default even if not found yet


/* ── Security headers ──────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false,
}));

/* ── CORS ───────────────────────────────────────────────────── */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cancer-herbalist-s1bz.vercel.app',
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

const isLocalOrigin = (origin) => {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    );
  } catch (e) {
    return false;
  }
};

const isVercelOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.vercel.app');
  } catch (e) {
    return false;
  }
};

const isHostingerOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return (
      url.hostname.endsWith('.hostingersite.com') ||
      url.hostname.endsWith('.hostinger.site') ||
      url.hostname.endsWith('.hostinger.com')
    );
  } catch (e) {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow: no origin (server-to-server), whitelisted, local, Vercel, Hostinger
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isLocalOrigin(origin) ||
      isVercelOrigin(origin) ||
      isHostingerOrigin(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

/* ── Rate limiting ──────────────────────────────────────────── */
const isLocalRequest = (req) => {
  if (process.env.NODE_ENV === 'development') return true;
  const ip = req.ip || req.connection?.remoteAddress || '';
  return ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost');
};

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

// Moderate limits on public endpoints
const publicLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: Number(process.env.RATE_LIMIT_MAX_PUBLIC) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isLocalRequest(req) || req.path.startsWith('/admin') || req.path === '/appointments',
  message: { error: 'Too many requests. Please try again later.' },
});

// Tighter limit on order creation/submission
const orderLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: Number(process.env.RATE_LIMIT_MAX_CHECKOUT) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalRequest,
  message: { error: 'Too many order requests. Please wait before trying again.' },
});

// Looser limits on authenticated admin dashboard actions
const adminLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: Number(process.env.RATE_LIMIT_MAX_ADMIN) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalRequest,
  message: { error: 'Too many admin dashboard requests. Please try again later.' },
});

/* ── Body parser ────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' })); // Support Base64 image uploads in admin copy editor

/* ── Serve React static files (EARLY — before API routes) ───── */
// Must be placed here so /assets/*.css and /assets/*.js are served
// directly without going through any API middleware.
console.log('[server] DIST_DIR:', DIST_DIR);
console.log('[server] dist/index.html exists:', fs.existsSync(path.join(DIST_DIR, 'index.html')));
app.use(express.static(DIST_DIR));

/* ── Health check ───────────────────────────────────────────── */
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'Cancer Herbalist Payment API' })
);

/* ── Admin Cookie Verification & Helpers ─────────────────────── */
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  const list = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

const generateAdminToken = () => {
  const secret = process.env.ADMIN_SECRET || 'ch-admin-2024';
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = expiry.toString();
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
};

const verifyAdminToken = (token) => {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expiry = parseInt(payload, 10);
  if (isNaN(expiry) || expiry < Date.now()) return false;
  
  const secret = process.env.ADMIN_SECRET || 'ch-admin-2024';
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expectedSignature;
};

const loginLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: 15, // Max 15 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

/* ── Admin Page & Auth Endpoints ────────────────────────────── */
app.get('/admin', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['admin_token'];

  if (!verifyAdminToken(token)) {
    // Return 404 if not authenticated
    return res.status(404).send('Not Found');
  }

  // Serve React index.html directly from the local dist/ folder
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  return res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[server] Error serving admin index.html:', err.message);
      res.status(500).send('Internal Server Error. Admin UI loading failed.');
    }
  });
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  const adminSecret = process.env.ADMIN_SECRET || 'ch-admin-2024';

  if (password !== adminSecret) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  const token = generateAdminToken();

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  return res.json({ success: true, key: adminSecret });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({ success: true });
});

/* ── Routes ─────────────────────────────────────────────────── */
app.use('/api', publicLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api/appointments', adminLimiter);
app.use('/api/create-order', orderLimiter);
app.use('/api/submit-order', orderLimiter);
app.use('/api', createOrderRoute);
app.use('/api', verifyPaymentRoute);
app.use('/api', validateVpaRoute);
app.use('/api', submitOrderRoute);
app.use('/api', bookAppointmentRoute);
app.use('/api', dynamicContentRoute);
app.use('/api', orderActionsRoute);
app.use('/api', shiprocketWebhookRoute);
app.use('/api', zohoSignRoute);
app.use('/api', zohoCampaignsRoute);
app.use('/api', zohoDeskRoute);
app.use('/api', adminOrdersRoute);

/* ── Serve React static files (production) ──────────────────── */
// Serves built CSS, JS, images from dist/
app.use(express.static(DIST_DIR));

// Catch-all: for any route not matched above, send React's index.html
// This lets React Router handle client-side navigation (e.g. /products, /checkout)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application.');
    }
  });
});

/* ── Global error handler (must be LAST middleware) ─────────── */
// Catches any error thrown in async route handlers (e.g. unexpected throws
// that bypass per-route try/catch). Returns JSON instead of Express HTML.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});


// Server listening port
app.listen(PORT, () => {
  console.log(`\n✅  Cancer Herbalist API running on port ${PORT}`);

  // Validate all critical env vars at startup
  const required = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'FRONTEND_URL'];
  const missing  = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('\n❌  Missing required env vars:', missing.join(', '));
    console.error('   Set these in backend/.env or in your Vercel project settings.\n');
  }

  const shiprocketMissing = !process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD;
  if (shiprocketMissing) {
    console.warn('⚠️   SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD not set — orders will NOT be pushed to Shiprocket.');
  } else {
    console.log('✅  Shiprocket credentials found.');
  }

  const zohoMissing = !process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_REFRESH_TOKEN;
  if (zohoMissing) {
    console.warn('⚠️   ZOHO_CLIENT_ID / ZOHO_REFRESH_TOKEN not set — Zoho integrations disabled.');
  } else {
    console.log('✅  Zoho CRM / Books / Sign credentials found.');
    // Optional Zoho configs skipped warning-less if not set
  }

  if (process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
    console.warn('⚠️   Running with RAZORPAY TEST keys — do NOT use in production.');
  }
});

module.exports = app;
// Force redeploy: 2026-08-03-product-images-sync

