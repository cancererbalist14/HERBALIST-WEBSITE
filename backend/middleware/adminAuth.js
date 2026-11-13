const crypto = require('crypto');

const COOKIE_NAME = 'admin_token';

function parseCookies(header = '') {
  const cookies = {};
  header.split(';').forEach((part) => {
    const index = part.indexOf('=');
    if (index === -1) return;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  });
  return cookies;
}

function generateAdminToken() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not configured.');
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const payload = String(expiry);
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expiry = Number.parseInt(payload, 10);
  if (!Number.isSafeInteger(expiry) || expiry < Date.now()) return false;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const suppliedBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return suppliedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function verifyAdminRequest(req) {
  const token = parseCookies(req.headers.cookie || '')[COOKIE_NAME];
  return verifyAdminToken(token);
}

module.exports = { COOKIE_NAME, parseCookies, generateAdminToken, verifyAdminToken, verifyAdminRequest };
