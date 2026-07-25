/**
 * bookAppointment.js
 *
 * POST /api/book-appointment
 *   → Validates input, saves to Google Sheets, sends 2 emails (patient + admin)
 *
 * GET  /api/appointments?key=ADMIN_SECRET&date=YYYY-MM-DD
 *   → Returns all appointments (or filtered by date) for the admin dashboard
 */

const express = require('express');
const nodemailer = require('nodemailer');
const { validateSchema } = require('../utils/validateSchema');
const { checkAuthLockout, recordAuthFailure, recordAuthSuccess } = require('../middleware/authRateLimiter');
const router = express.Router();

/* ── Slot constants ─────────────────────────────────────────────── */
const REGULAR_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
];

const EMERGENCY_SLOTS = [
  '03:00 PM - 03:15 PM',
  '03:15 PM - 03:30 PM',
  '03:30 PM - 03:45 PM',
  '03:45 PM - 04:00 PM',
];

const DEFAULT_OPEN_REGULAR_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
];

const DEFAULT_OPEN_EMERGENCY_SLOTS = [
  '03:00 PM - 03:15 PM',
  '03:15 PM - 03:30 PM',
  '03:30 PM - 03:45 PM',
  '03:45 PM - 04:00 PM',
];

const ALL_SLOTS = [...REGULAR_SLOTS, ...EMERGENCY_SLOTS];

/* ── Slot config store (per-day enabled slots) ───────────────────── */
// slotConfigStore: { dateString → { regularSlots: Set, emergencySlots: Set } }
// If a date has no entry, ALL slots are enabled (default/open).
const slotConfigStore = {};
let lastSlotConfigSyncTime = 0;
const SLOT_CONFIG_SYNC_COOLDOWN_MS = 10000;

// Replaces commas, trims whitespace, and converts to lowercase to make date lookups robust
function normalizeDateKey(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).trim().toLowerCase().replace(/,/g, '');
}

async function syncSlotConfigFromSheets(force = false) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return false;
  const now = Date.now();
  if (!force && (now - lastSlotConfigSyncTime < SLOT_CONFIG_SYNC_COOLDOWN_MS)) return true;
  try {
    const res = await fetch(`${url}?action=getRows&sheet=slotConfig`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.success) {
      // Clear and rebuild from sheets
      Object.keys(slotConfigStore).forEach(k => delete slotConfigStore[k]);
      (data.rows || []).forEach(row => {
        if (!row || !row.date) return;
        const normalizedKey = normalizeDateKey(row.date);
        if (!slotConfigStore[normalizedKey]) {
          slotConfigStore[normalizedKey] = { regularSlots: new Set(), emergencySlots: new Set() };
        }
        if (row.slot === '[NONE]') {
          // Placeholder row for completely closed slot configs
          return;
        }
        if (row.slotType === 'emergency') {
          slotConfigStore[normalizedKey].emergencySlots.add(row.slot);
        } else {
          slotConfigStore[normalizedKey].regularSlots.add(row.slot);
        }
      });
      lastSlotConfigSyncTime = Date.now();
      return true;
    }
  } catch (err) {
    console.warn('[slotConfig] Failed to sync from Sheets:', err.message);
  }
  return false;
}

async function saveSlotConfigToSheets(date, slots, slotType) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    // First delete existing rows for this date+type
    const delUrl = new URL(url);
    delUrl.searchParams.append('action', 'deleteSlotConfig');
    delUrl.searchParams.append('date', date);
    delUrl.searchParams.append('slotType', slotType);
    await fetch(delUrl.toString()).catch(() => {});

    // Save [NONE] as placeholder if no slots are enabled to preserve closed state
    const slotsToInsert = slots.length > 0 ? slots : ['[NONE]'];
    for (const slot of slotsToInsert) {
      const rowUrl = new URL(url);
      rowUrl.searchParams.append('action', 'appendRow');
      rowUrl.searchParams.append('sheet', 'slotConfig');
      rowUrl.searchParams.append('date', date);
      rowUrl.searchParams.append('slot', slot);
      rowUrl.searchParams.append('slotType', slotType);
      await fetch(rowUrl.toString()).catch(() => {});
    }
  } catch (err) {
    console.warn('[slotConfig] Sheets save error:', err.message);
  }
}

async function deleteSlotConfigFromSheets(date) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    const delUrl = new URL(url);
    delUrl.searchParams.append('action', 'deleteSlotConfig');
    delUrl.searchParams.append('date', date);
    await fetch(delUrl.toString());
  } catch (err) {
    console.warn('[slotConfig] Sheets delete error:', err.message);
  }
}

function getEnabledSlotsForDate(date) {
  const normalizedKey = normalizeDateKey(date);
  const config = slotConfigStore[normalizedKey];
  if (!config) {
    // Default open slots
    return {
      regularSlots: [...DEFAULT_OPEN_REGULAR_SLOTS],
      emergencySlots: [...DEFAULT_OPEN_EMERGENCY_SLOTS],
    };
  }
  return {
    regularSlots: [...config.regularSlots],
    emergencySlots: [...config.emergencySlots],
  };
}

/* ── Gmail transporter ───────────────────────────────────────────── */
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

/* ── Patient confirmation email HTML ─────────────────────────────── */
function buildPatientEmailHtml(data, origin = 'http://localhost:5173') {
  const { apptId, name, treatment, stage, appointmentDay, appointmentSlot, message } = data;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Appointment Confirmed — Cancer Herbalist</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a6e52 0%,#0f3460 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 10px;font-size:36px;">🌿</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Cancer Herbalist</h1>
            <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;letter-spacing:0.5px;">APPOINTMENT CONFIRMATION</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:36px 40px 0;">
            <h2 style="margin:0 0 10px;color:#0f172a;font-size:22px;">Your appointment is confirmed, ${name}! 🎉</h2>
            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.8;">
              We look forward to connecting with you. Below are the details of your consultation booking.
            </p>
          </td>
        </tr>

        <!-- Appointment Card -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #22c55e44;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #dcfce7;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Date</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">📅 ${appointmentDay}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #dcfce7;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Time Slot</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">🕐 ${appointmentSlot}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #dcfce7;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Consultation Type</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">🩺 ${treatment}</p>
                </td>
              </tr>
              ${stage ? `<tr>
                <td style="padding:18px 24px;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Cancer Stage</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">${stage}</p>
                </td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- What to Expect -->
        <tr>
          <td style="padding:0 40px 24px;">
            <h3 style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;">What to Expect</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:8px 0;vertical-align:top;">
                <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">1</span>
                <span style="color:#475569;font-size:13.5px;">Our Consultant will call you at your registered phone number at the booked time.</span>
              </td></tr>
              <tr><td style="padding:8px 0;vertical-align:top;">
                <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">2</span>
                <span style="color:#475569;font-size:13.5px;">Please keep your medical reports and prescriptions ready for reference.</span>
              </td></tr>
              <tr><td style="padding:8px 0;vertical-align:top;">
                <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">3</span>
                <span style="color:#475569;font-size:13.5px;">The consultation is completely free with no obligations.</span>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Reschedule / Cancel Notice -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 18px;text-align:center;">
              <p style="margin:0 0 12px;color:#92400e;font-size:13px;line-height:1.6;font-weight:600;">
                Need to change or cancel your appointment?
              </p>
              <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                <a href="${origin}/manage-appointment?id=${apptId}&action=reschedule" style="display:inline-block;background:#1a6e52;color:#ffffff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12.5px;">
                  Reschedule Online
                </a>
                <a href="${origin}/manage-appointment?id=${apptId}&action=cancel" style="display:inline-block;background:#ef4444;color:#ffffff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12.5px;">
                  Cancel Online
                </a>
              </div>
              <p style="margin:0;color:#92400e;font-size:11px;">
                Or chat with us on WhatsApp or call if you need support.
              </p>
            </div>
          </td>
        </tr>

        <!-- WhatsApp CTA -->
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="https://wa.me/918884588835" style="display:inline-block;background:#25d366;color:#ffffff;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:12px;">
              💬 Chat on WhatsApp
            </a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">
              Questions? Call <a href="tel:+918884588835" style="color:#1a6e52;font-weight:600;">+91 88845 88835</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11.5px;line-height:1.7;">
              Cancer Herbalist | Kaggalipura, Bangalore 560116<br/>
              cancerherbalist@gmail.com | +91 88845 88835<br/>
              <span style="font-size:10px;">This is an automated confirmation. Please do not reply to this email.</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Admin notification email HTML ───────────────────────────────── */
function buildAdminEmailHtml(data) {
  const { name, phone, email, treatment, stage, appointmentDay, appointmentSlot, message } = data;
  const bookingTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Appointment — ${name}</title></head>
<body style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#1a6e52;color:#fff;padding:24px 32px;">
      <h2 style="margin:0;font-size:20px;">📅 New Appointment Booked</h2>
      <p style="margin:6px 0 0;opacity:0.8;font-size:13px;">Received: ${bookingTime} IST</p>
    </div>
    <div style="padding:28px 32px;">
      <table width="100%" cellpadding="8" cellspacing="0" style="font-size:13.5px;color:#334155;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;width:40%;padding:10px 8px;">Patient Name</td>
          <td style="padding:10px 8px;"><strong style="color:#0f172a;">${name}</strong></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Phone</td>
          <td style="padding:10px 8px;"><a href="tel:${phone}" style="color:#1a6e52;font-weight:700;">${phone}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Email</td>
          <td style="padding:10px 8px;">${email || '—'}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Date</td>
          <td style="padding:10px 8px;"><strong>📅 ${appointmentDay}</strong></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Time Slot</td>
          <td style="padding:10px 8px;"><strong>🕐 ${appointmentSlot}</strong></td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Consultation</td>
          <td style="padding:10px 8px;">🩺 ${treatment}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;">Cancer Stage</td>
          <td style="padding:10px 8px;">${stage || 'Not specified'}</td>
        </tr>
        ${message ? `<tr>
          <td style="color:#94a3b8;font-weight:600;padding:10px 8px;vertical-align:top;">Message</td>
          <td style="padding:10px 8px;color:#475569;font-style:italic;">"${message}"</td>
        </tr>` : ''}
      </table>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;display:flex;gap:12px;text-align:center;">
      <a href="https://wa.me/91${String(phone).replace(/\D/g, '')}"
        style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;margin-right:8px;">
        WhatsApp Patient
      </a>
      <a href="tel:${phone}"
        style="display:inline-block;background:#1a6e52;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
        Call Patient
      </a>
    </div>
  </div>
</body>
</html>`;
}

/* ── Cancellation email to patient ──────────────────────────────── */
function buildCancellationEmailHtml({ name, treatment, appointmentDay, appointmentSlot }, byPatient = false) {
  const description = byPatient
    ? `This email is to confirm that your appointment has been successfully <strong style="color:#dc2626;">cancelled</strong> as requested.`
    : `We regret to inform you that your appointment has been <strong style="color:#dc2626;">cancelled</strong> by our team. We sincerely apologise for any inconvenience caused.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Appointment Cancelled — Cancer Herbalist</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7f1d1d 0%,#b91c1c 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 10px;font-size:36px;">🌿</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Cancer Herbalist</h1>
            <p style="margin:8px 0 0;color:#fca5a5;font-size:13px;letter-spacing:0.5px;">APPOINTMENT CANCELLATION NOTICE</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;">Dear ${name},</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.8;">
              ${description}
            </p>
          </td>
        </tr>

        <!-- Cancelled Appointment Card -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #fee2e2;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Cancelled Date</p>
                  <p style="margin:0;font-size:15px;color:#7f1d1d;font-weight:700;">📅 ${appointmentDay}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #fee2e2;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Cancelled Slot</p>
                  <p style="margin:0;font-size:15px;color:#7f1d1d;font-weight:700;">🕐 ${appointmentSlot}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Consultation</p>
                  <p style="margin:0;font-size:15px;color:#7f1d1d;font-weight:700;">🩺 ${treatment}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Rebook CTA -->
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <p style="color:#64748b;font-size:14px;margin-bottom:20px;line-height:1.7;">To rebook your consultation or if you have any questions, please reach out to us:</p>
            <a href="https://wa.me/918884588835" style="display:inline-block;background:#25d366;color:#ffffff;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:12px;">💬 Rebook via WhatsApp</a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">Or call us at <a href="tel:+918884588835" style="color:#1a6e52;font-weight:600;">+91 88845 88835</a></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11.5px;line-height:1.7;">
              Cancer Herbalist | Kaggalipura, Bangalore 560116<br/>
              cancerherbalist@gmail.com | +91 88845 88835
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Reschedule email to patient ─────────────────────────────────── */
function buildRescheduleEmailHtml({ apptId, name, treatment, oldDay, oldSlot, newDay, newSlot }, byPatient = false, origin = 'http://localhost:5173') {
  const description = byPatient
    ? `Your appointment has been successfully <strong style="color:#1a6e52;">rescheduled</strong> as requested. Please note your updated consultation details below.`
    : `Your appointment has been <strong style="color:#1a6e52;">rescheduled</strong> by our team. Please note your updated consultation details below.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Appointment Rescheduled — Cancer Herbalist</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a6e52 0%,#0f3460 100%);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0 0 10px;font-size:36px;">🌿</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Cancer Herbalist</h1>
            <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;letter-spacing:0.5px;">APPOINTMENT RESCHEDULED</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;">Dear ${name},</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.8;">
              ${description}
            </p>
          </td>
        </tr>

        <!-- Old vs New Slot -->
        <tr>
          <td style="padding:0 40px 24px;">

            <!-- Old slot (struck out) -->
            <p style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">Previous Slot (Cancelled)</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;margin-bottom:16px;">
              <tr><td style="padding:14px 20px;">
                <p style="margin:0;font-size:14px;color:#94a3b8;text-decoration:line-through;">📅 ${oldDay} &nbsp; 🕐 ${oldSlot}</p>
              </td></tr>
            </table>

            <!-- New slot (highlighted) -->
            <p style="font-size:12px;font-weight:700;color:#1a6e52;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">✅ New Slot (Confirmed)</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #22c55e44;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #dcfce7;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">New Date</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">📅 ${newDay}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;border-bottom:1px solid #dcfce7;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">New Time</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">🕐 ${newSlot}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;">
                  <p style="margin:0 0 3px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Consultation</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">🩺 ${treatment}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Reschedule / Cancel Notice -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 18px;text-align:center;">
              <p style="margin:0 0 12px;color:#92400e;font-size:13px;line-height:1.6;font-weight:600;">
                Need to change or cancel this appointment?
              </p>
              <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                <a href="${origin}/manage-appointment?id=${apptId}&action=reschedule" style="display:inline-block;background:#1a6e52;color:#ffffff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12.5px;">
                  Reschedule Online
                </a>
                <a href="${origin}/manage-appointment?id=${apptId}&action=cancel" style="display:inline-block;background:#ef4444;color:#ffffff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12.5px;">
                  Cancel Online
                </a>
              </div>
              <p style="margin:0;color:#92400e;font-size:11px;">
                Or chat with us on WhatsApp or call if you need support.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11.5px;line-height:1.7;">
              Cancer Herbalist | Kaggalipura, Bangalore 560116<br/>
              cancerherbalist@gmail.com | +91 88845 88835
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Save appointment to Google Sheets ───────────────────────── */
async function saveToSheets(appt) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) { console.warn('[bookAppointment] APPS_SCRIPT_URL not set — skipping Sheets.'); return; }
  try {
    const sheetUrl = new URL(url);
    // prefix keys so the Apps Script can route to an Appointments sheet
    const row = {
      type: 'APPOINTMENT',
      apptId: appt.apptId,
      name: appt.name,
      phone: appt.phone,
      email: appt.email,
      treatment: appt.treatment,
      stage: appt.stage || '',
      message: appt.message || '',
      appointmentDay: appt.appointmentDay,
      appointmentSlot: appt.appointmentSlot,
      bookedAt: appt.bookedAt,
      status: 'Confirmed',
    };
    Object.entries(row).forEach(([k, v]) => sheetUrl.searchParams.append(k, String(v ?? '')));
    const res = await fetch(sheetUrl.toString());
    if (!res.ok) console.warn('[bookAppointment] Sheets returned status:', res.status);
    else console.log('[bookAppointment] Appointment saved to Google Sheets.');
  } catch (e) {
    console.warn('[bookAppointment] Sheets error:', e.message);
  }
}

const appointmentStore = [];
let cachedAppointments = null;
let lastApptSyncTime = 0;
const APPT_SYNC_COOLDOWN_MS = 5000;

async function syncAppointmentsFromSheets(force = false) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return false;

  const now = Date.now();
  if (!force && cachedAppointments !== null && (now - lastApptSyncTime < APPT_SYNC_COOLDOWN_MS)) {
    return true;
  }

  try {
    const res = await fetch(`${url}?action=getRows&sheet=appointments`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.success) {
      const validAppts = (data.rows || []).filter(a => a && a.apptId && String(a.apptId).trim());
      
      // Normalize ISO date strings from Google Sheets to local 'en-IN' format in India timezone
      const isoPattern = /^\d{4}-\d{2}-\d{2}/;
      validAppts.forEach(a => {
        if (a.appointmentDay && (a.appointmentDay instanceof Date || (typeof a.appointmentDay === 'string' && isoPattern.test(a.appointmentDay)))) {
          const parsed = new Date(a.appointmentDay);
          if (!isNaN(parsed.getTime())) {
            a.appointmentDay = parsed.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Kolkata'
            });
          }
        }
      });

      cachedAppointments = validAppts;
      appointmentStore.length = 0;
      appointmentStore.push(...validAppts);
      lastApptSyncTime = Date.now();
      return true;
    }
  } catch (err) {
    console.error('[bookAppointment] Failed to sync appointments from Google Sheets:', err.message);
  }
  return false;
}

const bookAppointmentSchema = {
  name: { type: 'string', required: true, min: 2, max: 100, format: 'name' },
  phone: { type: 'string', required: true, format: 'phone' },
  email: { type: 'string', required: true, format: 'email', max: 100 },
  treatment: { type: 'string', required: true, min: 2, max: 100 },
  stage: { type: 'string', required: false, min: 1, max: 50 },
  message: { type: 'string', required: false, min: 0, max: 1000 },
  appointmentDay: { type: 'string', required: true, min: 2, max: 100 },
  appointmentSlot: { type: 'string', required: true, min: 2, max: 100 },
};

// ── Helper to parse appointment date/time strings to check if in past ──
function parseAppointmentDateTime(dayStr, slotStr) {
  try {
    const cleanDay = String(dayStr).replace(/^[a-zA-Z]+,\s*/, '').replace(/,/g, '').trim();
    const startTime = String(slotStr).split(' - ')[0].trim();
    const combined = `${cleanDay} ${startTime} +05:30`;
    const parsed = new Date(combined);
    if (!isNaN(parsed.getTime())) return parsed;
    return new Date(`${cleanDay} ${startTime}`);
  } catch (e) {
    return null;
  }
}

/* ── POST /api/book-appointment ──────────────────────────────── */
router.post('/book-appointment', async (req, res) => {
  const validationError = validateSchema(req.body, bookAppointmentSchema);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const {
    name, phone, email,
    treatment, stage, message,
    appointmentDay, appointmentSlot,
  } = req.body;

  // ── Sync latest appointments from Sheets before checking ────
  await syncAppointmentsFromSheets();

  // ── Duplicate patient check (same phone OR email already booked for FUTURE slots) ──
  const normalisePhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);
  const normalisedPhone = normalisePhone(phone);
  const now = Date.now();

  const existing = appointmentStore.find(a => {
    const samePhone = normalisedPhone && normalisePhone(a.phone) === normalisedPhone;
    const sameEmail = email && a.email && a.email.toLowerCase() === email.toLowerCase();
    if (!samePhone && !sameEmail) return false;

    // Check if this existing appointment is in the future
    const apptTime = parseAppointmentDateTime(a.appointmentDay, a.appointmentSlot);
    if (apptTime && apptTime.getTime() > now) {
      return true;
    }
    return false;
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: `An appointment is already registered for this contact (${existing.appointmentDay} at ${existing.appointmentSlot}). Please contact us on WhatsApp to reschedule or enquire about your existing booking.`,
      existingAppt: {
        apptId: existing.apptId,
        appointmentDay: existing.appointmentDay,
        appointmentSlot: existing.appointmentSlot,
        treatment: existing.treatment,
      },
    });
  }

  // ── Allowed slot validation ──────────────────────────────
  const allAllowedSlots = [...REGULAR_SLOTS, ...EMERGENCY_SLOTS];
  if (!allAllowedSlots.includes(appointmentSlot)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid time slot selected. The selected slot is outside of allowed booking hours.',
    });
  }

  // ── Slot enabled check ───────────────────────────────────
  await syncSlotConfigFromSheets();
  const enabled = getEnabledSlotsForDate(appointmentDay);
  const allEnabled = [...enabled.regularSlots, ...enabled.emergencySlots];
  if (!allEnabled.includes(appointmentSlot)) {
    return res.status(400).json({
      success: false,
      error: 'The selected slot is closed for bookings on this day.',
    });
  }

  // ── Slot conflict check ──────────────────────────────────
  const conflict = appointmentStore.find(a =>
    a.appointmentDay === appointmentDay &&
    a.appointmentSlot === appointmentSlot
  );
  if (conflict) {
    return res.status(409).json({
      success: false,
      error: `The ${appointmentSlot} slot on ${appointmentDay} is already booked. Please choose a different time.`,
    });
  }


  const apptId = `APT-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const bookedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const appt = { apptId, name, phone, email, treatment, stage, message, appointmentDay, appointmentSlot, bookedAt };

  // Save to in-memory store
  appointmentStore.push(appt);

  const transporter = createTransporter();
  if (!transporter) {
    console.error('[bookAppointment] Email transporter not configured.');
    await saveToSheets(appt);
    return res.json({ success: true, apptId, warning: 'Email not configured on server.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com';
  const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;

  const data = { apptId, name, phone, email, treatment, stage, message, appointmentDay, appointmentSlot };

  try {
    await Promise.all([
      // 1. Patient confirmation
      transporter.sendMail({
        from: fromAddr,
        to: email,
        subject: `✅ Appointment Confirmed — ${appointmentDay} at ${appointmentSlot} | Cancer Herbalist`,
        text: `Dear ${name},\n\nYour consultation appointment has been confirmed.\n\nDate: ${appointmentDay}\nTime: ${appointmentSlot}\nConsultation: ${treatment}\n\nOur Consultant will call you at your registered number at the booked time.\nQuestions? WhatsApp: +91 88845 88835\n\n— Cancer Herbalist Team`,
        html: buildPatientEmailHtml(data, req.headers.origin || 'http://localhost:5173'),
      }),

      // 2. Admin notification
      transporter.sendMail({
        from: fromAddr,
        to: adminEmail,
        subject: `📅 New Appointment: ${name} — ${appointmentDay} ${appointmentSlot}`,
        text: `New Appointment Booked\nPatient: ${name}\nPhone: ${phone}\nEmail: ${email}\nDate: ${appointmentDay}\nTime: ${appointmentSlot}\nConsultation: ${treatment}\nStage: ${stage || 'N/A'}\nMessage: ${message || 'None'}`,
        html: buildAdminEmailHtml(data),
      }),

      // 3. Save to Google Sheets
      saveToSheets(appt),
    ]);

    console.log(`[bookAppointment] Confirmation emails sent for ${name} (${email})`);
    res.json({ success: true, apptId });

  } catch (err) {
    console.error('[bookAppointment] Failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send confirmation email. Please try again.' });
  }
});

/* ── GET /api/available-slots (public — no auth needed) ──────── */
// Returns booked slot times + enabled slots for a given appointmentDay.
// Used by the Contact form to grey out already-booked and disabled slots.
router.get('/available-slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, error: 'date query param required.' });
  }
  try {
    await syncAppointmentsFromSheets();
    await syncSlotConfigFromSheets();
    const booked = appointmentStore
      .filter(a => a.appointmentDay.toLowerCase() === date.toLowerCase())
      .map(a => a.appointmentSlot);
    const enabledSlots = getEnabledSlotsForDate(date);
    res.json({
      success: true,
      bookedSlots: booked,
      enabledSlots, // { regularSlots: [], emergencySlots: [] }
      allRegularSlots: REGULAR_SLOTS,
      allEmergencySlots: EMERGENCY_SLOTS,
    });
  } catch (err) {
    console.error('[bookAppointment] /available-slots error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch available slots.' });
  }
});

/* ── GET /api/slot-config (public) — enabled slots for a date ─── */
router.get('/slot-config', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, error: 'date query param required.' });
  }
  try {
    await syncSlotConfigFromSheets();
    const enabledSlots = getEnabledSlotsForDate(date);
    res.json({
      success: true,
      date,
      enabledSlots,
      isCustom: !!slotConfigStore[date],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch slot config.' });
  }
});

// Admin auth check middleware with exponential backoff rate limiting
const checkAdmin = (req, res, next) => {
  checkAuthLockout(req, res, () => {
    const key = req.query.key || req.headers['x-admin-key'];
    const adminSecret = process.env.ADMIN_SECRET || 'ch-admin-2024';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    if (key !== adminSecret) {
      recordAuthFailure(ip);
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    recordAuthSuccess(ip);
    next();
  });
};

async function updateRowInSheets(appt) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    const sheetUrl = new URL(url);
    sheetUrl.searchParams.append('action', 'updateRow');
    sheetUrl.searchParams.append('sheet', 'appointments');
    
    const row = {
      apptId: appt.apptId,
      name: appt.name,
      phone: appt.phone,
      email: appt.email,
      treatment: appt.treatment,
      stage: appt.stage || '',
      message: appt.message || '',
      appointmentDay: appt.appointmentDay,
      appointmentSlot: appt.appointmentSlot,
      bookedAt: appt.bookedAt,
      status: appt.status || 'Confirmed',
    };
    Object.entries(row).forEach(([k, v]) => sheetUrl.searchParams.append(k, String(v ?? '')));
    
    const res = await fetch(sheetUrl.toString());
    if (!res.ok) console.warn('[bookAppointment] Sheets update returned status:', res.status);
    else console.log('[bookAppointment] Appointment updated in Google Sheets.');
  } catch (e) {
    console.warn('[bookAppointment] Sheets update error:', e.message);
  }
}

async function deleteRowFromSheets(apptId) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return;
  try {
    const sheetUrl = new URL(url);
    sheetUrl.searchParams.append('action', 'deleteRow');
    sheetUrl.searchParams.append('sheet', 'appointments');
    sheetUrl.searchParams.append('apptId', apptId);
    
    const res = await fetch(sheetUrl.toString());
    if (!res.ok) console.warn('[bookAppointment] Sheets delete returned status:', res.status);
    else console.log('[bookAppointment] Appointment deleted from Google Sheets.');
  } catch (e) {
    console.warn('[bookAppointment] Sheets delete error:', e.message);
  }
}

/* ── GET /api/public/appointments/:apptId (Public check) ─────── */
router.get('/public/appointments/:apptId', async (req, res) => {
  const { apptId } = req.params;
  try {
    await syncAppointmentsFromSheets();
    const appt = appointmentStore.find(a => a.apptId === apptId);
    if (!appt) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }
    res.json({
      success: true,
      appointment: {
        apptId: appt.apptId,
        name: appt.name,
        treatment: appt.treatment,
        appointmentDay: appt.appointmentDay,
        appointmentSlot: appt.appointmentSlot,
        stage: appt.stage,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve appointment details.' });
  }
});

/* ── DELETE /api/public/appointments/:apptId (Public cancel) ─── */
router.delete('/public/appointments/:apptId', async (req, res) => {
  const { apptId } = req.params;
  try {
    await syncAppointmentsFromSheets();
    const idx = appointmentStore.findIndex(a => a.apptId === apptId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const appt = appointmentStore[idx];

    // Remove from local cache
    appointmentStore.splice(idx, 1);
    lastApptSyncTime = 0;

    // Delete from Sheets
    await deleteRowFromSheets(apptId);

    // Send emails
    const transporter = createTransporter();
    if (transporter) {
      const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;
      const adminEmail = process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com';

      // 1. To Patient
      transporter.sendMail({
        from: fromAddr,
        to: appt.email,
        subject: `❌ Appointment Cancelled — ${appt.appointmentDay} at ${appt.appointmentSlot} | Cancer Herbalist`,
        text: `Dear ${appt.name},\n\nYour consultation appointment has been successfully cancelled as requested.\n\nDate: ${appt.appointmentDay}\nTime: ${appt.appointmentSlot}\nConsultation: ${appt.treatment}\n\n— Cancer Herbalist Team`,
        html: buildCancellationEmailHtml(appt, true),
      }).catch(e => console.error('[publicCancel] Patient email failed:', e.message));

      // 2. To Admin
      transporter.sendMail({
        from: fromAddr,
        to: adminEmail,
        subject: `❌ Appointment Cancelled by Patient: ${appt.name}`,
        text: `Appointment Cancelled by Patient\n\nPatient Name: ${appt.name}\nPhone: ${appt.phone}\nEmail: ${appt.email}\nSlot Cancelled: ${appt.appointmentDay} at ${appt.appointmentSlot}\nConsultation: ${appt.treatment}\n`,
      }).catch(e => console.error('[publicCancel] Admin email failed:', e.message));
    }

    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to cancel appointment.' });
  }
});

/* ── PUT /api/public/appointments/:apptId (Public reschedule) ── */
router.put('/public/appointments/:apptId', async (req, res) => {
  const { apptId } = req.params;
  const { appointmentDay, appointmentSlot } = req.body;

  if (!appointmentDay || !appointmentSlot) {
    return res.status(400).json({ success: false, error: 'appointmentDay and appointmentSlot are required.' });
  }

  try {
    await syncAppointmentsFromSheets();
    const idx = appointmentStore.findIndex(a => a.apptId === apptId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const currentAppt = appointmentStore[idx];
    const isActuallyChanged =
      appointmentDay !== currentAppt.appointmentDay ||
      appointmentSlot !== currentAppt.appointmentSlot;

    if (!isActuallyChanged) {
      return res.json({ success: true, message: 'Appointment details are unchanged.' });
    }

    // 1. Conflict check
    const conflict = appointmentStore.find(a =>
      a.apptId !== apptId &&
      a.appointmentDay === appointmentDay &&
      a.appointmentSlot === appointmentSlot
    );
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'The selected slot is already booked. Please choose a different time.',
      });
    }

    // 2. Slot enabled check
    await syncSlotConfigFromSheets();
    const enabled = getEnabledSlotsForDate(appointmentDay);
    const allEnabled = [...enabled.regularSlots, ...enabled.emergencySlots];
    if (!allEnabled.includes(appointmentSlot)) {
      return res.status(400).json({ success: false, error: 'The selected slot is not available or closed.' });
    }

    // 3. Past check
    const apptTime = parseAppointmentDateTime(appointmentDay, appointmentSlot);
    if (apptTime && apptTime.getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'Cannot book/reschedule to a past slot.' });
    }

    const oldDay = currentAppt.appointmentDay;
    const oldSlot = currentAppt.appointmentSlot;

    // Update local cache
    const updatedAppt = {
      ...currentAppt,
      appointmentDay,
      appointmentSlot,
    };
    appointmentStore[idx] = updatedAppt;
    lastApptSyncTime = 0;

    // Sync to Sheets
    await updateRowInSheets(updatedAppt);

    // Send emails
    const transporter = createTransporter();
    if (transporter) {
      const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;
      const adminEmail = process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com';
      const origin = req.headers.origin || 'http://localhost:5173';

      // 1. To Patient
      transporter.sendMail({
        from: fromAddr,
        to: currentAppt.email,
        subject: `📅 Appointment Rescheduled — New Slot: ${appointmentDay} at ${appointmentSlot} | Cancer Herbalist`,
        text: `Dear ${currentAppt.name},\n\nYour appointment has been successfully rescheduled.\n\nOld Slot: ${oldDay} at ${oldSlot}\nNew Slot: ${appointmentDay} at ${appointmentSlot}\nConsultation: ${currentAppt.treatment}\n\n— Cancer Herbalist Team`,
        html: buildRescheduleEmailHtml({
          apptId: currentAppt.apptId,
          name: currentAppt.name,
          treatment: currentAppt.treatment,
          oldDay,
          oldSlot,
          newDay: appointmentDay,
          newSlot: appointmentSlot,
        }, true, origin),
      }).catch(e => console.error('[publicReschedule] Patient email failed:', e.message));

      // 2. To Admin
      transporter.sendMail({
        from: fromAddr,
        to: adminEmail,
        subject: `📅 Appointment Rescheduled by Patient: ${currentAppt.name}`,
        text: `Appointment Rescheduled by Patient\n\nPatient Name: ${currentAppt.name}\nPhone: ${currentAppt.phone}\nEmail: ${currentAppt.email}\nOld Slot: ${oldDay} at ${oldSlot}\nNew Slot: ${appointmentDay} at ${appointmentSlot}\nConsultation: ${currentAppt.treatment}\n`,
      }).catch(e => console.error('[publicReschedule] Admin email failed:', e.message));
    }

    res.json({ success: true, message: 'Appointment rescheduled successfully.' });
  } catch (err) {
    console.error('[publicReschedule] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to reschedule appointment.' });
  }
});

/* ── GET /api/appointments (Admin dashboard) ─────────────────── */
router.get('/appointments', checkAdmin, async (req, res) => {
  const { date } = req.query;
  try {
    await syncAppointmentsFromSheets();
    let results = [...appointmentStore];

    // Optional: filter by date string (partial match on appointmentDay)
    if (date) {
      results = results.filter(a =>
        a.appointmentDay.toLowerCase().includes(date.toLowerCase())
      );
    }

    // Sort by slot time
    results.sort((a, b) => a.appointmentSlot.localeCompare(b.appointmentSlot));

    res.json({ success: true, count: results.length, appointments: results });
  } catch (err) {
    console.error('[bookAppointment] /appointments error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments.', detail: err.message });
  }
});

/* ── DELETE /api/appointments/:apptId (Admin only) ─────────── */
router.delete('/appointments/:apptId', checkAdmin, async (req, res) => {
  const { apptId } = req.params;
  try {
    await syncAppointmentsFromSheets();
    const idx = appointmentStore.findIndex(a => a.apptId === apptId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const appt = appointmentStore[idx];

    // ── Send cancellation email to patient ──────────────────────
    if (appt.email && appt.email !== '—') {
      const transporter = createTransporter();
      if (transporter) {
        const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;
        transporter.sendMail({
          from: fromAddr,
          to: appt.email,
          subject: `❌ Appointment Cancelled — ${appt.appointmentDay} at ${appt.appointmentSlot} | Cancer Herbalist`,
          text: `Dear ${appt.name},\n\nYour appointment on ${appt.appointmentDay} at ${appt.appointmentSlot} has been cancelled by our team.\n\nTo rebook, please WhatsApp us at +91 88845 88835 or call us directly.\n\n— Cancer Herbalist Team`,
          html: buildCancellationEmailHtml(appt),
        }).catch(e => console.error('[bookAppointment] Cancellation email failed:', e.message));
        console.log(`[bookAppointment] Cancellation email sent to ${appt.email}`);
      }
    }

    // Remove from local cache
    appointmentStore.splice(idx, 1);
    lastApptSyncTime = 0;

    // Delete from Sheets
    await deleteRowFromSheets(apptId);

    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('[bookAppointment] DELETE error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to cancel appointment.' });
  }
});

/* ── PUT /api/appointments/:apptId (Admin only) ────────────── */
router.put('/appointments/:apptId', checkAdmin, async (req, res) => {
  const { apptId } = req.params;
  const { appointmentDay, appointmentSlot } = req.body;

  try {
    await syncAppointmentsFromSheets();
    const idx = appointmentStore.findIndex(a => a.apptId === apptId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const currentAppt = appointmentStore[idx];
    const isActuallyRescheduled =
      appointmentDay !== currentAppt.appointmentDay ||
      appointmentSlot !== currentAppt.appointmentSlot;

    // Conflict check if date or slot is changing
    if (isActuallyRescheduled) {
      const conflict = appointmentStore.find(a =>
        a.apptId !== apptId &&
        a.appointmentDay === appointmentDay &&
        a.appointmentSlot === appointmentSlot
      );
      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `The ${appointmentSlot} slot on ${appointmentDay} is already booked.`,
        });
      }
    }

    // Update local cache
    const updatedAppt = {
      ...currentAppt,
      appointmentDay,
      appointmentSlot,
    };
    appointmentStore[idx] = updatedAppt;
    lastApptSyncTime = 0;

    // Sync to Sheets
    await updateRowInSheets(updatedAppt);

    // ── Send reschedule email to patient (only if slot actually changed) ──
    if (isActuallyRescheduled && currentAppt.email && currentAppt.email !== '—') {
      const transporter = createTransporter();
      if (transporter) {
        const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;
        transporter.sendMail({
          from: fromAddr,
          to: currentAppt.email,
          subject: `📅 Appointment Rescheduled — New Slot: ${appointmentDay} at ${appointmentSlot} | Cancer Herbalist`,
          text: `Dear ${currentAppt.name},\n\nYour appointment has been rescheduled by our team.\n\nOld: ${currentAppt.appointmentDay} at ${currentAppt.appointmentSlot}\nNew: ${appointmentDay} at ${appointmentSlot}\nConsultation: ${currentAppt.treatment}\n\nIf this time doesn't suit you, please WhatsApp us at +91 88845 88835.\n\n— Cancer Herbalist Team`,
          html: buildRescheduleEmailHtml({
            name: currentAppt.name,
            treatment: currentAppt.treatment,
            oldDay: currentAppt.appointmentDay,
            oldSlot: currentAppt.appointmentSlot,
            newDay: appointmentDay,
            newSlot: appointmentSlot,
          }),
        }).catch(e => console.error('[bookAppointment] Reschedule email failed:', e.message));
        console.log(`[bookAppointment] Reschedule email sent to ${currentAppt.email}`);
      }
    }

    res.json({ success: true, appointment: updatedAppt });
  } catch (err) {
    console.error('[bookAppointment] PUT error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to reschedule appointment.' });
  }
});

/* ── POST /api/appointments/block (Admin only) ──────────────── */
router.post('/appointments/block', checkAdmin, async (req, res) => {
  const { appointmentDay, appointmentSlot } = req.body;
  
  try {
    await syncAppointmentsFromSheets();
    
    // Conflict check
    const conflict = appointmentStore.find(a =>
      a.appointmentDay === appointmentDay &&
      a.appointmentSlot === appointmentSlot
    );
    if (conflict) {
      return res.status(409).json({
        success: false,
        error: `The ${appointmentSlot} slot on ${appointmentDay} is already booked/blocked.`,
      });
    }
    
    const apptId = `BLK-${Date.now()}`;
    const bookedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const appt = {
      apptId,
      name: '[BLOCKED]',
      phone: '—',
      email: '—',
      treatment: 'Blocked Slot',
      stage: 'N/A',
      message: 'Blocked by Admin',
      appointmentDay,
      appointmentSlot,
      bookedAt,
      status: 'Confirmed'
    };
    
    appointmentStore.push(appt);
    lastApptSyncTime = 0;
    
    // Save to Sheets
    await saveToSheets(appt);
    
    res.json({ success: true, appointment: appt });
  } catch (err) {
    console.error('[bookAppointment] block error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to block slot.' });
  }
});

/* ── GET /api/admin/slot-config (Admin) — all configured dates ── */
router.get('/admin/slot-config', checkAdmin, async (req, res) => {
  try {
    await syncSlotConfigFromSheets(true);
    const configs = {};
    Object.entries(slotConfigStore).forEach(([date, cfg]) => {
      configs[date] = {
        regularSlots: [...cfg.regularSlots],
        emergencySlots: [...cfg.emergencySlots],
      };
    });
    res.json({
      success: true,
      configs,
      allRegularSlots: REGULAR_SLOTS,
      allEmergencySlots: EMERGENCY_SLOTS,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch slot configs.' });
  }
});

/* ── POST /api/admin/slot-config (Admin) — set slots for a date ─ */
router.post('/admin/slot-config', checkAdmin, async (req, res) => {
  const { date, regularSlots, emergencySlots } = req.body;
  if (!date) {
    return res.status(400).json({ success: false, error: 'date is required.' });
  }
  try {
    const validRegular = (regularSlots || []).filter(s => REGULAR_SLOTS.includes(s));
    const validEmergency = (emergencySlots || []).filter(s => EMERGENCY_SLOTS.includes(s));

    const normalizedKey = normalizeDateKey(date);
    slotConfigStore[normalizedKey] = {
      regularSlots: new Set(validRegular),
      emergencySlots: new Set(validEmergency),
    };
    lastSlotConfigSyncTime = 0;

    // Persist to Sheets asynchronously
    saveSlotConfigToSheets(date, validRegular, 'regular').catch(() => {});
    saveSlotConfigToSheets(date, validEmergency, 'emergency').catch(() => {});

    res.json({
      success: true,
      date,
      enabledSlots: { regularSlots: validRegular, emergencySlots: validEmergency },
    });
  } catch (err) {
    console.error('[slotConfig] POST error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save slot config.' });
  }
});

/* ── DELETE /api/admin/slot-config/:date (Admin) — reset to all open */
router.delete('/admin/slot-config/:date', checkAdmin, async (req, res) => {
  const { date } = req.params;
  try {
    const normalizedKey = normalizeDateKey(date);
    delete slotConfigStore[normalizedKey];
    lastSlotConfigSyncTime = 0;
    deleteSlotConfigFromSheets(date).catch(() => {});
    res.json({ success: true, message: `Slot config for ${date} reset to default (all open).` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset slot config.' });
  }
});

module.exports = router;
