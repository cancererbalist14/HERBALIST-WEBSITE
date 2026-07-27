/**
 * emailService.js
 *
 * Gmail SMTP service for sending order confirmation emails.
 * Sends two emails on every order:
 *   1. Customer receipt with order summary
 *   2. Admin notification to the clinic inbox
 *
 * Setup: Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env
 * Sender: cancerherbalist@gmail.com (App Password required)
 */

const nodemailer = require('nodemailer');

/* ── Caching & Pooling Gmail Transporter ── */
let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[emailService] GMAIL_USER / GMAIL_APP_PASSWORD not set — emails will be skipped.');
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    pool: true, // Enable SMTP connection pooling
    maxConnections: 5,
    maxMessages: 100,
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
  return cachedTransporter;
}

async function sendEmailViaAppsScript(to, subject, htmlBody) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    console.warn('[emailSender] APPS_SCRIPT_URL not set — cannot send via Apps Script.');
    return false;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendEmail',
        to,
        subject,
        htmlBody,
      }),
    });
    if (!res.ok) {
      console.warn(`[emailSender] Apps Script returned status ${res.status}`);
      return false;
    }
    const data = await res.json();
    if (data.success) {
      console.log(`[emailSender] Email successfully sent via Apps Script to ${to}`);
      return true;
    } else {
      console.warn(`[emailSender] Apps Script error: ${data.error}`);
      return false;
    }
  } catch (err) {
    console.warn(`[emailSender] Failed to fetch Apps Script: ${err.message}`);
    return false;
  }
}

async function sendMailWrapper({ to, subject, text, html }) {
  const transporter = getTransporter();
  let smtpSuccess = false;
  let smtpError = null;

  if (transporter) {
    try {
      const fromAddr = `"Cancer Herbalist" <${process.env.GMAIL_USER}>`;
      await transporter.sendMail({
        from: fromAddr,
        to,
        subject,
        text,
        html,
      });
      console.log(`[emailSender] Email sent successfully via SMTP to ${to}`);
      smtpSuccess = true;
    } catch (err) {
      smtpError = err.message;
      console.warn(`[emailSender] SMTP sendMail failed to ${to}:`, err.message);
    }
  } else {
    smtpError = 'Transporter not configured (GMAIL_USER or GMAIL_APP_PASSWORD missing).';
    console.warn(`[emailSender] SMTP skipped: ${smtpError}`);
  }

  if (smtpSuccess) {
    return { success: true, method: 'smtp' };
  }

  // Fallback to Apps Script HTTP API
  console.log(`[emailSender] Attempting Google Apps Script HTTP fallback for ${to}...`);
  const appsScriptSuccess = await sendEmailViaAppsScript(to, subject, html);
  if (appsScriptSuccess) {
    return { success: true, method: 'apps_script' };
  }

  return { success: false, error: smtpError || 'Unknown error' };
}


/* ── Customer confirmation email HTML ─────────────────────────── */
function buildCustomerEmailHtml(order) {
  const {
    orderId, customerName, productName, quantity,
    orderAmount, paymentMethod, paymentStatus,
    address, city, state, pincode, orderDate,
  } = order;

  const isPaid = paymentStatus === 'PAID';
  const statusColor = isPaid ? '#22c55e' : '#f59e0b';
  const statusBg    = isPaid ? '#f0fdf4' : '#fffbeb';
  const statusLabel = isPaid ? '✅ Payment Confirmed' : '⏳ Awaiting Payment / COD';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation — Cancer Herbalist</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a6e52 0%,#0f3460 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">🌿</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Cancer Herbalist</h1>
            <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;">Order Confirmation</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;">
              Thank you, ${customerName}! 🎉
            </h2>
            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">
              Your order has been successfully placed. Here's a summary of your order:
            </p>
          </td>
        </tr>

        <!-- Payment Status Badge -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:${statusBg};border:1.5px solid ${statusColor}44;border-radius:12px;padding:12px 18px;display:inline-block;">
              <p style="margin:0;color:${statusColor};font-weight:700;font-size:14px;">${statusLabel}</p>
            </div>
          </td>
        </tr>

        <!-- Order Summary Card -->
        <tr>
          <td style="padding:20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Order ID</p>
                  <p style="margin:0;font-size:15px;color:#0f172a;font-weight:700;">${orderId}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Product</p>
                  <p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${productName}</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Qty: ${quantity}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Total Amount</p>
                  <p style="margin:0;font-size:20px;color:#1a6e52;font-weight:800;">₹${Number(orderAmount).toLocaleString('en-IN')}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Includes FREE shipping Pan-India</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Payment Method</p>
                  <p style="margin:0;font-size:14px;color:#334155;font-weight:600;">${paymentMethod}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Shipping Address</p>
                  <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${address}, ${city}, ${state} — ${pincode}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What Happens Next -->
        <tr>
          <td style="padding:0 40px 20px;">
            <h3 style="margin:0 0 16px;color:#0f172a;font-size:15px;">What happens next?</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${isPaid ? `
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">1</span>
                  <span style="color:#475569;font-size:13.5px;">Your payment has been confirmed by Razorpay.</span>
                </td>
              </tr>` : `
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="background:#f59e0b18;color:#f59e0b;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">1</span>
                  <span style="color:#475569;font-size:13.5px;">Our team will call you within 24 hours to confirm the COD/bank transfer details.</span>
                </td>
              </tr>`}
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">2</span>
                  <span style="color:#475569;font-size:13.5px;">Your order will be packed and dispatched within 24 hours.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;vertical-align:top;">
                  <span style="background:#1a6e5218;color:#1a6e52;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;margin-right:12px;">3</span>
                  <span style="color:#475569;font-size:13.5px;">You will receive a tracking number via WhatsApp/SMS once shipped.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WhatsApp CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://wa.me/918884588835" style="display:inline-block;background:#25d366;color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
              💬 Contact Us on WhatsApp
            </a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:11.5px;">
              Questions? Call us at <a href="tel:+918884588835" style="color:#1a6e52;">+91 88845 88835</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11.5px;line-height:1.6;">
              Cancer Herbalist | Kaggalipura, Bangalore 560116<br/>
              cancerherbalist@gmail.com | +91 88845 88835<br/>
              <span style="font-size:10px;">Order placed on ${orderDate}</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Admin notification email HTML ────────────────────────────── */
function buildAdminEmailHtml(order) {
  const {
    orderId, customerName, phone, email,
    productName, quantity, orderAmount,
    paymentMethod, paymentStatus, orderDate,
    address, city, state, pincode,
    razorpayPaymentId,
  } = order;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>New Order — ${orderId}</title></head>
<body style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#1a6e52;color:#fff;padding:24px 32px;">
      <h2 style="margin:0;font-size:20px;">🛒 New Order Received</h2>
      <p style="margin:6px 0 0;opacity:0.8;font-size:13px;">${orderId} | ${orderDate}</p>
    </div>
    <div style="padding:24px 32px;">
      <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13.5px;color:#334155;">
        <tr><td style="color:#94a3b8;width:40%;font-weight:600;">Customer</td><td><strong>${customerName}</strong></td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Phone</td><td>${phone}</td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Email</td><td>${email || '—'}</td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Product</td><td>${productName}</td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Quantity</td><td>${quantity}</td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Amount</td><td><strong style="color:#1a6e52;font-size:16px;">₹${Number(orderAmount).toLocaleString('en-IN')}</strong></td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Payment</td><td>${paymentMethod}</td></tr>
        <tr><td style="color:#94a3b8;font-weight:600;">Status</td><td><strong style="color:${paymentStatus === 'PAID' ? '#22c55e' : '#f59e0b'}">${paymentStatus}</strong></td></tr>
        ${razorpayPaymentId ? `<tr><td style="color:#94a3b8;font-weight:600;">Razorpay ID</td><td style="font-size:11px;">${razorpayPaymentId}</td></tr>` : ''}
        <tr><td style="color:#94a3b8;font-weight:600;">Address</td><td>${address}, ${city}, ${state} — ${pincode}</td></tr>
      </table>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 32px;text-align:center;">
      <a href="https://wa.me/91${String(phone).replace(/\D/g,'')}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">WhatsApp Customer</a>
    </div>
  </div>
</body>
</html>`;
}

/* ── Main exported function ───────────────────────────────────── */
/**
 * Sends order confirmation emails to both customer and admin.
 * Silently skips if GMAIL_USER / GMAIL_APP_PASSWORD are not configured.
 *
 * @param {Object} order  - The full order record from submitOrder / verifyPayment
 */
async function sendOrderConfirmationEmails(order) {
  console.log(`[emailService] Starting email for order ${order.orderId}, customer email: ${order.email || 'NOT PROVIDED'}`);

  console.log(`[emailService] Sending to customer: ${order.email}, admin: ${process.env.ADMIN_EMAIL}`);

  const adminEmail = process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com';
  const emailPromises = [];

  // 1. Customer confirmation (only if we have their email)
  if (order.email && /\S+@\S+\.\S+/.test(order.email)) {
    emailPromises.push(
      sendMailWrapper({
        to:      order.email,
        subject: `✅ Order Confirmed — ${order.orderId} | Cancer Herbalist`,
        text:    `Thank you, ${order.customerName}!\nYour order ${order.orderId} for ${order.productName} (Amount: ₹${order.orderAmount}) has been successfully placed.\n\nPayment Method: ${order.paymentMethod}\nShipping Address: ${order.address}, ${order.city}, ${order.state} - ${order.pincode}\n\nOur team will contact you shortly.`,
        html:    buildCustomerEmailHtml(order),
      })
    );
  }

  // 2. Admin notification
  emailPromises.push(
    sendMailWrapper({
      to:      adminEmail,
      subject: `🛒 New Order: ${order.orderId} — ${order.customerName} (₹${order.orderAmount})`,
      text:    `New Order Received: ${order.orderId}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nProduct: ${order.productName}\nAmount: ₹${order.orderAmount}\nPayment: ${order.paymentMethod}`,
      html:    buildAdminEmailHtml(order),
    })
  );

  await Promise.all(emailPromises);
  console.log(`[emailService] Emails triggered for order ${order.orderId}`);
}

/* ── Status change notification email ──────────────────────────── */
function buildStatusEmailHtml(order, status, customerMessage) {
  const { orderId, customerName, productName, orderAmount } = order;
  
  // Dynamic color coding based on status
  let statusColor = '#3b82f6'; // Blue default
  if (status.includes('DELIVERED') || status.includes('APPROVED') || status.includes('PROCESSED')) {
    statusColor = '#22c55e'; // Green
  } else if (status.includes('FAIL') || status.includes('REJECTED') || status.includes('CANCEL')) {
    statusColor = '#ef4444'; // Red
  } else if (status.includes('PENDING') || status.includes('REQUEST') || status.includes('INITIATED') || status.includes('PROCESSING')) {
    statusColor = '#f59e0b'; // Amber
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Update — ${orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a6e52 0%,#0f3460 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">🌿</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Cancer Herbalist</h1>
            <p style="margin:8px 0 0;color:#a7f3d0;font-size:13px;">Order Status Update</p>
          </td>
        </tr>

        <!-- Body content -->
        <tr>
          <td style="padding:32px 40px 0;">
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;">
              Hello, ${customerName}
            </h2>
            <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
              There is an update regarding your order <strong style="color:#1a6e52;">${orderId}</strong>:
            </p>
            
            <!-- Message card -->
            <div style="background:#f8fafc;border-left:4px solid ${statusColor};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;font-weight:500;">
                ${customerMessage}
              </p>
            </div>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px;font-size:13.5px;">
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;width:35%;">Order ID</td>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;">Product</td>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600;">${productName}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;">Total Amount</td>
                <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#1a6e52;font-weight:700;">₹${Number(orderAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;color:#64748b;">Courier Tracking</td>
                <td style="padding:12px 16px;color:#0f172a;">
                  ${order.awb ? `<strong>${order.courierName || 'Courier'}</strong><br/>AWB: ${order.awb}<br/><a href="${order.trackingUrl || '#'}" style="color:#38bed5;text-decoration:none;font-weight:600;">🔗 Track Package</a>` : 'Not Shipped Yet'}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WhatsApp CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://wa.me/918884588835" style="display:inline-block;background:#25d366;color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
              💬 Chat with us on WhatsApp
            </a>
            <p style="margin:12px 0 0;color:#94a3b8;font-size:11.5px;">
              Need help? Reach out at <a href="tel:+918884588835" style="color:#1a6e52;">+91 88845 88835</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:11.5px;line-height:1.6;">
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

/* ── Dedup cache: prevents the same order+status email firing more than once
   within DEDUP_WINDOW_MS (5 minutes). Protects against double-clicks, retries,
   or multiple code paths all calling sendStatusNotificationEmail for the same event. */
const _emailSentCache = new Map(); // key: `${orderId}:${status}` → timestamp
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

async function sendStatusNotificationEmail(order, status, customerMessage) {
  const dedupKey = `${order.orderId}:${status}`;
  const lastSent = _emailSentCache.get(dedupKey);
  if (lastSent && (Date.now() - lastSent) < DEDUP_WINDOW_MS) {
    console.warn(`[emailService] DUPLICATE SUPPRESSED — email for ${dedupKey} was already sent ${Math.round((Date.now() - lastSent) / 1000)}s ago. Skipping.`);
    return;
  }
  _emailSentCache.set(dedupKey, Date.now());

  console.log(`[emailService] Sending status notification email for order ${order.orderId}`);

  const { ORDER_STATUS_LABELS } = require('./orderStatuses');
  const statusLabel = ORDER_STATUS_LABELS[status] || status;
  let subject = `📢 Order Update: ${statusLabel} — ${order.orderId}`;
  if (status === 'CANCELLED') {
    subject = `❌ Order Cancelled — ${order.orderId} | Cancer Herbalist`;
  } else if (status === 'CANCELLATION_REQUESTED') {
    subject = `⚠️ Cancellation Requested — ${order.orderId} | Cancer Herbalist`;
  } else if (status === 'REFUND_PROCESSED') {
    subject = `💸 Refund Credited — ${order.orderId} | Cancer Herbalist`;
  } else if (status === 'REFUND_INITIATED') {
    subject = `⏳ Refund Initiated — ${order.orderId} | Cancer Herbalist`;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com';
  const emailPromises = [];

  // 1. Customer notification (only if valid email exists)
  if (order.email && /\S+@\S+\.\S+/.test(order.email)) {
    emailPromises.push(
      sendMailWrapper({
        to:      order.email,
        subject: subject,
        text:    `Hello ${order.customerName},\n\nUpdate for your order ${order.orderId}:\n\n${customerMessage}\n\nTrack your order here: ${process.env.FRONTEND_URL}/track-order?orderId=${order.orderId}`,
        html:    buildStatusEmailHtml(order, status, customerMessage),
      })
    );
  } else {
    console.warn('[emailService] Customer email missing or invalid. Skipping customer status notification.');
  }

  // 2. Admin notification (always notify admin/doctor on cancellation or refund state changes)
  if (['CANCELLED', 'CANCELLATION_REQUESTED', 'REFUND_PROCESSED', 'REFUND_INITIATED', 'REFUND_FAILED'].includes(status)) {
    emailPromises.push(
      sendMailWrapper({
        to:      adminEmail,
        subject: `[ADMIN ALERT] Order Update: ${statusLabel} — ${order.orderId}`,
        text:    `Admin Alert:\nUpdate for order ${order.orderId} (Customer: ${order.customerName}):\n\n${customerMessage}`,
        html:    buildStatusEmailHtml(order, status, `<strong>[ADMIN ALERT]</strong> ${customerMessage}`),
      })
    );
  }

  try {
    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
      console.log(`[emailService] Status notification emails triggered successfully.`);
    }
  } catch (err) {
    console.error('[emailService] Status notification email execution error:', err.message);
  }
}

module.exports = { 
  sendOrderConfirmationEmails,
  sendStatusNotificationEmail
};
