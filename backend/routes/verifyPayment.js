const express = require('express');
const crypto  = require('crypto'); // built-in — no install needed
const router  = express.Router();
const Razorpay = require('razorpay');
const { createShiprocketOrder }         = require('./shiprocket');
const { validateOrderAmount }           = require('./priceList');
const { pushOrderToZoho }               = require('./zoho');
const { pushOrderToZohoBooks }          = require('./zohoBooks');
const { sendOrderConfirmationEmails }   = require('./emailService');
const { saveOrder, addOrderEvent, updateOrderStatus, getOrderById, getOrderByIdAsync } = require('./ordersDb');
const { ORDER_STATUSES } = require('./orderStatuses');

/* Razorpay SDK — for fetching order amount post-payment */
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/verify-payment
 *
 * Verifies Razorpay signature, records order to Google Sheets,
 * and creates a Shiprocket shipment automatically.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *         customerName, phone, email, address, city, state, pincode,
 *         productName, productId, quantity, unitPrice, orderAmount }
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName, phone, email,
      address, city, state, pincode,
      productName, productId,
      quantity, unitPrice, orderAmount,
    } = req.body;

    /* ── 1. Guard: all payment fields must be present ──────────── */
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
    }

    /* ── 1a. Verify Razorpay HMAC signature ─────────────────────── */
    const body             = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig      = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed — signature mismatch.' });
    }

    /* ── 1b. Re-fetch order from Razorpay to confirm actual amount ─ */
    const rzOrder = await razorpay.orders.fetch(razorpay_order_id);
    const actualPaidAmountINR = rzOrder.amount / 100; // Razorpay stores in paise
    if (Math.abs(actualPaidAmountINR - Number(orderAmount)) > 1) {
      console.warn(`[verify-payment] Amount mismatch: Razorpay=₹${actualPaidAmountINR}, client=₹${orderAmount}`);
      return res.status(400).json({ success: false, error: 'Payment amount mismatch. Please contact support.' });
    }

    /* ── 1c. Server-side price validation (prevents price tampering) */
    const priceCheck = validateOrderAmount(productId, quantity, orderAmount);
    if (!priceCheck.valid) {
      console.warn(`[verify-payment] Price validation failed: ${priceCheck.reason}`);
      return res.status(400).json({ success: false, error: 'Invalid order details. Please contact support.' });
    }

    /* ── 2. Build or load internal order reference ─────────────────── */
    const { getOrders } = require('./ordersDb');
    const existingOrders = getOrders();
    const existingOrder  = existingOrders.find(o => o.razorpayOrderId === razorpay_order_id);

    let orderId;
    let orderRow;
    const orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (existingOrder) {
      orderId = existingOrder.orderId;
      existingOrder.paymentStatus = 'PAID';
      existingOrder.razorpayPaymentId = razorpay_payment_id;
      existingOrder.orderStatus = ORDER_STATUSES.ORDER_CONFIRMED;
      saveOrder(existingOrder);
      orderRow = existingOrder;
    } else {
      orderId = `CH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      orderRow = {
        orderId, customerName, phone, email,
        address, city, state, pincode,
        productName, productId, 
        quantity: Number(quantity) || 1, 
        unitPrice: Number(unitPrice) || Number(orderAmount), 
        orderAmount: Number(orderAmount),
        paymentMethod:      'Online - Razorpay',
        razorpayOrderId:    razorpay_order_id,
        razorpayPaymentId:  razorpay_payment_id,
        paymentStatus:      'PAID',
        orderStatus:        ORDER_STATUSES.ORDER_CONFIRMED,
        shipmentStatus:     null,
        cancellationStatus: null,
        returnStatus:       null,
        refundStatus:       null,
        shiprocketOrderId:  null,
        shipmentId:         null,
        awb:                null,
        courierId:          null,
        courierName:        null,
        trackingUrl:        null,
        estimatedDeliveryDate: null,
        latestStatus:       null,
        lastSyncedAt:       null,
        orderDate,
      };
      saveOrder(orderRow);
    }

    // Save placement and verification events
    addOrderEvent(orderId, 'STATUS_UPDATE', ORDER_STATUSES.ORDER_CONFIRMED, 'Your payment has been successfully verified via Razorpay. Order confirmed.');
    addOrderEvent(orderId, 'PAYMENT', ORDER_STATUSES.ORDER_CONFIRMED, `Payment of ₹${orderAmount} confirmed. Transaction ID: ${razorpay_payment_id}`, { razorpayPaymentId: razorpay_payment_id });

    /* ── 3. Execute integrations in parallel (necessary for Vercel serverless environment) ── */
    const promises = [];

    // Google Sheets
    if (process.env.APPS_SCRIPT_URL) {
      const sheetsPromise = (async () => {
        try {
          const url = new URL(process.env.APPS_SCRIPT_URL);
          Object.entries(orderRow).forEach(([k, v]) => url.searchParams.append(k, String(v ?? '')));
          const res = await fetch(url.toString());
          if (!res.ok) console.warn('[verify] Sheets returned status:', res.status);
        } catch (e) {
          console.warn('[verify] Sheets error:', e.message);
        }
      })();
      promises.push(sheetsPromise);
    }

    // Shiprocket
    if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
      const shiprocketPromise = (async () => {
        try {
          const srData = await createShiprocketOrder(orderRow);
          const shiprocketOrderId = srData.order_id || srData.id || null;
          const shipmentId = srData.shipment_id || null;
          const awb = srData.awb_code || null;
          const courierName = srData.courier_name || null;
          const trackingUrl = srData.tracking_url || null;

          console.log(`[verify-payment] Shiprocket order created: ${shiprocketOrderId}, shipment: ${shipmentId}`);
          
          // Update DB with Shiprocket details
          const order = await getOrderByIdAsync(orderId);
          if (order) {
            order.shiprocketOrderId = shiprocketOrderId;
            order.shipmentId = shipmentId;
            order.awb = awb;
            order.courierName = courierName;
            order.trackingUrl = trackingUrl;
            if (awb) order.shipmentStatus = 'AWB_ASSIGNED';
            saveOrder(order);
          }
        } catch (srErr) {
          console.error('[verify-payment] Shiprocket error:', srErr.message);
          const order = await getOrderByIdAsync(orderId);
          if (order) {
            order.orderStatus = ORDER_STATUSES.SHIPMENT_CREATION_FAILED;
            saveOrder(order);
            addOrderEvent(orderId, 'SYSTEM_ERROR', ORDER_STATUSES.SHIPMENT_CREATION_FAILED, 'Fulfillment creation failed. Our support team will manually process it.', { error: srErr.message });
          }
        }
      })();
      promises.push(shiprocketPromise);
    } else {
      console.warn('[verify-payment] SHIPROCKET_EMAIL/PASSWORD not set — skipping Shiprocket.');
    }

    // Zoho CRM
    if (process.env.ZOHO_CLIENT_ID && process.env.ZOHO_REFRESH_TOKEN) {
      const zohoPromise = (async () => {
        try {
          await pushOrderToZoho(orderRow);
        } catch (err) {
          console.error('[verify-payment] Zoho CRM error:', err.message);
        }
      })();
      promises.push(zohoPromise);
    }

    // Zoho Books
    if (process.env.ZOHO_BOOKS_ORGANIZATION_ID) {
      const zohoBooksPromise = (async () => {
        try {
          await pushOrderToZohoBooks(orderRow);
        } catch (err) {
          console.error('[verify-payment] Zoho Books error:', err.message);
        }
      })();
      promises.push(zohoBooksPromise);
    }

    // Email confirmation (customer + admin) - sent concurrently with other integrations
    const emailPromise = (async () => {
      try {
        await sendOrderConfirmationEmails(orderRow);
      } catch (emailErr) {
        console.error('[verify-payment] Email error:', emailErr.message);
      }
    })();
    promises.push(emailPromise);

    // Wait for all integrations to finish before sending response (prevent serverless termination)
    await Promise.all(promises);

    // Log order verified event if shipment creation succeeded
    const updatedOrder = await getOrderByIdAsync(orderId);
    if (updatedOrder && updatedOrder.orderStatus !== ORDER_STATUSES.SHIPMENT_CREATION_FAILED) {
      addOrderEvent(orderId, 'STATUS_UPDATE', ORDER_STATUSES.ORDER_CONFIRMED, 'Order verification completed. Ready for shipment.');
    }

    /* ── 4. Respond success ─────────────────────────────────────── */
    res.json({ success: true, orderId, paymentId: razorpay_payment_id });

  } catch (err) {
    console.error('[verify-payment]', err.message);
    res.status(500).json({ success: false, error: 'Payment verification failed.' });
  }
});

module.exports = router;
