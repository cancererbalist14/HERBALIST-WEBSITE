const express = require('express');
const router  = express.Router();
const { createShiprocketOrder }         = require('./shiprocket');
const { validateOrderAmount }           = require('./priceList');
const { pushOrderToZoho }               = require('./zoho');
const { pushOrderToZohoBooks }          = require('./zohoBooks');
const { sendOrderConfirmationEmails }   = require('./emailService');
const { saveOrder, addOrderEvent, updateOrderStatus, getOrderById, getOrderByIdAsync } = require('./ordersDb');
const { ORDER_STATUSES } = require('./orderStatuses');

const { validateSchema } = require('../utils/validateSchema');

const submitOrderSchema = {
  customerName: { type: 'string', required: true, min: 2, max: 100, format: 'name' },
  phone: { type: 'string', required: true, format: 'phone' },
  email: { type: 'string', required: false, format: 'email', max: 100 },
  address: { type: 'string', required: true, min: 5, max: 250 },
  city: { type: 'string', required: true, min: 2, max: 100 },
  state: { type: 'string', required: true, min: 2, max: 100 },
  pincode: { type: 'string', required: true, format: 'pincode' },
  productName: { type: 'string', required: true, min: 2, max: 500 },
  productId: { type: 'string', required: true, min: 1, max: 200 },
  quantity: { type: 'number', required: true, integer: true, min: 1, max: 100 },
  unitPrice: { type: 'number', required: true, min: 0 },
  orderAmount: { type: 'number', required: true, min: 0 },
  paymentMethod: { type: 'string', required: true, min: 2, max: 50 },
};

/**
 * POST /api/submit-order
 *
 * Handles Cash-on-Delivery (COD) and offline/bank-transfer orders.
 * Records the order to Google Sheets (via Apps Script) and creates
 * a Shiprocket shipment — without any third-party automation tools.
 *
 * Body: {
 *   customerName, phone, email,
 *   address, city, state, pincode,
 *   productName, productId, quantity, unitPrice, orderAmount,
 *   paymentMethod   — e.g. "COD / Bank Transfer"
 * }
 *
 * Returns: { success, orderId, shiprocketOrderId }
 */
router.post('/submit-order', async (req, res) => {
  try {
    const validationError = validateSchema(req.body, submitOrderSchema);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const {
      customerName, phone, email,
      address, city, state, pincode,
      productName, productId,
      quantity, unitPrice, orderAmount,
      paymentMethod,
    } = req.body;

    /* ── 1b. Server-side price validation (prevents price tampering) ── */
    const priceCheck = validateOrderAmount(productId, quantity, orderAmount);
    if (!priceCheck.valid) {
      console.warn(`[submit-order] Price validation failed: ${priceCheck.reason}`);
      return res.status(400).json({ success: false, error: 'Invalid order details. Please refresh and try again.' });
    }

    /* ── 2. Build internal order record ───────────────────────────── */
    const orderId   = `CH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const orderRow = {
      orderId, customerName, phone, email,
      address, city, state, pincode,
      productName, productId,
      quantity: Number(quantity) || 1, 
      unitPrice: Number(unitPrice) || Number(orderAmount), 
      orderAmount: Number(orderAmount),
      paymentMethod: paymentMethod || 'COD / Bank Transfer',
      paymentStatus: 'COD_PENDING',
      orderStatus: ORDER_STATUSES.ORDER_CONFIRMED,
      shipmentStatus: null,
      cancellationStatus: null,
      returnStatus: null,
      refundStatus: null,
      shiprocketOrderId: null,
      shipmentId: null,
      awb: null,
      courierId: null,
      courierName: null,
      trackingUrl: null,
      estimatedDeliveryDate: null,
      latestStatus: null,
      lastSyncedAt: null,
      orderDate,
    };

    // Save order immediately as CONFIRMED
    saveOrder(orderRow);
    addOrderEvent(orderId, 'STATUS_UPDATE', ORDER_STATUSES.ORDER_CONFIRMED, 'Your order has been successfully placed and confirmed. We are scheduling it for shipment.');

    /* ── 3. Execute integrations concurrently (prevent serverless termination) ── */
    const promises = [];

    // Google Sheets
    if (process.env.APPS_SCRIPT_URL) {
      const sheetsPromise = (async () => {
        try {
          const url = new URL(process.env.APPS_SCRIPT_URL);
          Object.entries(orderRow).forEach(([k, v]) =>
            url.searchParams.append(k, String(v ?? ''))
          );
          const sheetsRes = await fetch(url.toString());
          if (!sheetsRes.ok) console.warn('[submit-order] Sheets returned status:', sheetsRes.status);
        } catch (e) {
          console.warn('[submit-order] Sheets error:', e.message);
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

          console.log(`[submit-order] Shiprocket order created: ${shiprocketOrderId}, shipment: ${shipmentId}`);
          
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
          console.error('[submit-order] Shiprocket error:', srErr.message);
          const order = await getOrderByIdAsync(orderId);
          if (order) {
            order.orderStatus = ORDER_STATUSES.SHIPMENT_CREATION_FAILED;
            saveOrder(order);
            addOrderEvent(orderId, 'SYSTEM_ERROR', ORDER_STATUSES.SHIPMENT_CREATION_FAILED, 'Fulfillment creation failed. Our support team will manually process it.', { error: srErr.message });
          }
        }
      })();
      promises.push(shiprocketPromise);
    }

    // Zoho CRM
    if (process.env.ZOHO_CLIENT_ID && process.env.ZOHO_REFRESH_TOKEN) {
      const zohoPromise = (async () => {
        try {
          await pushOrderToZoho(orderRow);
        } catch (err) {
          console.error('[submit-order] Zoho CRM error:', err.message);
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
          console.error('[submit-order] Zoho Books error:', err.message);
        }
      })();
      promises.push(zohoBooksPromise);
    }

    // Email confirmation (customer + admin)
    const emailPromise = (async () => {
      try {
        const finalOrder = await getOrderByIdAsync(orderId) || orderRow;
        await sendOrderConfirmationEmails(finalOrder);
      } catch (emailErr) {
        console.error('[submit-order] Email error:', emailErr.message);
      }
    })();
    promises.push(emailPromise);

    // Wait for all integrations to finish before sending response
    await Promise.all(promises);

    // Log order verified event if shipment creation succeeded
    const updatedOrder = await getOrderByIdAsync(orderId);
    if (updatedOrder && updatedOrder.orderStatus !== ORDER_STATUSES.SHIPMENT_CREATION_FAILED) {
      addOrderEvent(orderId, 'STATUS_UPDATE', ORDER_STATUSES.ORDER_CONFIRMED, 'Order verification completed. Ready for shipment.');
    }

    /* ── 4. Respond to client ── */
    res.json({
      success: true,
      orderId,
      shiprocketOrderId: updatedOrder ? updatedOrder.shiprocketOrderId : null,
    });



  } catch (err) {
    console.error('[submit-order]', err.message);
    res.status(500).json({ success: false, error: 'Failed to place order. Please try again.' });
  }
});

module.exports = router;
