/**
 * adminOrders.js
 * Admin-facing endpoints for managing order statuses, cancellation/return requests,
 * and processing refunds.
 */

const express = require('express');
const router  = express.Router();
const Razorpay = require('razorpay');
const { 
  initCache,
  getOrders, 
  getOrderById, 
  getOrderByIdAsync,
  saveOrder, 
  addOrderEvent, 
  updateOrderStatus,
  getEventsByOrderId,
  getRefundByOrderId,
  saveRefund,
  syncFromSheets,
  deleteOrder,
  clearAllOrders
} = require('./ordersDb');
const { ORDER_STATUSES, ORDER_STATUS_LABELS } = require('./orderStatuses');
const { sendStatusNotificationEmail } = require('./emailService');

// Initialize Razorpay SDK
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const { checkAuthLockout, recordAuthFailure, recordAuthSuccess } = require('../middleware/authRateLimiter');

// Admin auth check matching dynamicContent.js with exponential backoff rate limiting
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

// Mount admin auth check on all routes in this file
router.use(checkAdmin);

/**
 * GET /api/admin/orders
 * List all orders with searching, sorting, and filtering.
 * Add ?force=true to force a fresh sync from Google Sheets.
 */
router.get('/admin/orders', async (req, res) => {
  try {
    // Always sync from Sheets on admin list load.
    // syncFromSheets() has a built-in 30s cooldown so it won't hammer the API on rapid
    // refreshes, but guarantees stale serverless cache is never used for the admin view.
    // force=true bypasses the cooldown (e.g. manual "Refresh" button click).
    await syncFromSheets(req.query.force === 'true');

    const { search, orderStatus, paymentStatus, shipmentStatus, refundStatus } = req.query;
    let orders = getOrders();

    // Deduplicate by orderId — keep the most recently updated record
    const deduped = new Map();
    for (const o of orders) {
      const existing = deduped.get(o.orderId);
      if (!existing || new Date(o.updatedAt || 0) > new Date(existing.updatedAt || 0)) {
        deduped.set(o.orderId, o);
      }
    }
    orders = Array.from(deduped.values());

    // 1. Filtering
    if (orderStatus) {
      orders = orders.filter(o => o.orderStatus === orderStatus);
    }
    if (paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }
    if (shipmentStatus) {
      orders = orders.filter(o => o.shipmentStatus === shipmentStatus);
    }
    if (refundStatus) {
      orders = orders.filter(o => o.refundStatus === refundStatus);
    }

    // 2. Searching
    if (search) {
      const q = String(search).toLowerCase().trim();
      orders = orders.filter(o => 
        String(o.orderId).toLowerCase().includes(q) ||
        String(o.customerName).toLowerCase().includes(q) ||
        String(o.phone).includes(q) ||
        String(o.email).toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, orders });

  } catch (err) {
    console.error('[admin/orders]', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve orders.' });
  }
});


/**
 * GET /api/admin/orders/:orderId
 * Get single order details with complete event history and refund records.
 */
router.get('/admin/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Try cache first with cold-start fallback sync
    let order = await getOrderByIdAsync(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const events = getEventsByOrderId(orderId);
    const refund = getRefundByOrderId(orderId);

    res.json({ success: true, order, events, refund });

  } catch (err) {
    console.error('[admin/orders/:orderId]', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve order details.' });
  }
});


/**
 * PUT /api/admin/orders/:orderId/cancellation
 * Approve or reject an order cancellation request.
 */
router.put('/admin/orders/:orderId/cancellation', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved, remarks, rejectionReason } = req.body;

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.cancellationStatus !== 'REQUESTED') {
      return res.status(400).json({ success: false, error: 'No cancellation request pending for this order.' });
    }

    if (approved) {
      order.cancellationStatus = 'APPROVED';
      order.orderStatus = ORDER_STATUSES.CANCELLED;
      order.shipmentStatus = 'CANCELED';
      order.latestStatus = 'CANCELED';
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'CANCELLATION', 
        ORDER_STATUSES.CANCELLED, 
        `Cancellation approved by administrator. Remarks: ${remarks || 'None'}`,
        { remarks }
      );

      // Cancel on Shiprocket if exists
      if (order.shiprocketOrderId) {
        try {
          const { cancelShiprocketOrder } = require('./shiprocket');
          await cancelShiprocketOrder(order.shiprocketOrderId);
          console.log(`[admin/cancellation] Order ${orderId} (Shiprocket: ${order.shiprocketOrderId}) cancelled on Shiprocket.`);
        } catch (srErr) {
          console.error(`[admin/cancellation] Failed to cancel order ${orderId} on Shiprocket:`, srErr.message);
          addOrderEvent(
            orderId, 
            'SYSTEM_ERROR', 
            order.orderStatus, 
            `Failed to cancel shipment on Shiprocket: ${srErr.message}`
          );
        }
      }

      // Trigger refund flow if prepaid
      if (order.paymentMethod.toLowerCase().includes('online') && order.paymentStatus === 'PAID') {
        order.refundStatus = 'APPROVED';
        saveOrder(order);

        const refundData = {
          refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          orderId,
          amount: order.orderAmount,
          method: 'Razorpay',
          status: 'APPROVED',
          reason: 'Order Cancelled by Customer',
          approvedAt: new Date().toISOString()
        };
        saveRefund(refundData);

        addOrderEvent(
          orderId, 
          'REFUND', 
          ORDER_STATUSES.REFUND_APPROVED, 
          `Refund of ₹${order.orderAmount} approved for cancelled order. Ready to initiate.`
        );

        await sendStatusNotificationEmail(
          order, 
          ORDER_STATUSES.CANCELLED, 
          `Your order cancellation request has been approved. Since this was a prepaid order, a refund of ₹${order.orderAmount} has been approved and will be initiated shortly.`
        );
      } else {
        // COD - close order
        order.orderStatus = ORDER_STATUSES.CANCELLED;
        saveOrder(order);

        await sendStatusNotificationEmail(
          order, 
          ORDER_STATUSES.CANCELLED, 
          `Your order cancellation request has been approved. Your order ${orderId} has been cancelled successfully.`
        );
      }
    } else {
      order.cancellationStatus = 'REJECTED';
      order.orderStatus = ORDER_STATUSES.ORDER_CONFIRMED; // Restore to confirmed
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'CANCELLATION', 
        ORDER_STATUSES.ORDER_CONFIRMED, 
        `Cancellation request rejected. Reason: ${rejectionReason || 'Not eligible.'}`,
        { rejectionReason }
      );

      // Recreate/create on Shiprocket if missing
      if (!order.shiprocketOrderId) {
        try {
          const { createShiprocketOrder } = require('./shiprocket');
          const srData = await createShiprocketOrder(order);
          order.shiprocketOrderId = srData.order_id || srData.id || null;
          order.shipmentId = srData.shipment_id || null;
          order.awb = srData.awb_code || null;
          order.courierName = srData.courier_name || null;
          order.trackingUrl = srData.tracking_url || null;
          if (order.awb) order.shipmentStatus = 'AWB_ASSIGNED';
          saveOrder(order);
          console.log(`[admin/cancellation] Order ${order.orderId} successfully created on Shiprocket: ${order.shiprocketOrderId}`);
        } catch (srErr) {
          console.error(`[admin/cancellation] Failed to create order ${order.orderId} on Shiprocket:`, srErr.message);
          addOrderEvent(
            orderId, 
            'SYSTEM_ERROR', 
            order.orderStatus, 
            `Failed to push shipment to Shiprocket: ${srErr.message}`
          );
        }
      }

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.ORDER_CONFIRMED, 
        `Your order cancellation request was reviewed and declined. Reason: ${rejectionReason || 'Our team has already dispatched your package.'}. Your order will proceed normally.`
      );
    }

    res.json({ success: true, message: 'Cancellation request processed successfully.', order });

  } catch (err) {
    console.error('[admin/cancellation]', err.message);
    res.status(500).json({ success: false, error: 'Failed to process cancellation request.' });
  }
});

/**
 * POST /api/admin/orders/:orderId/cancel
 * Admin directly cancels/removes an order (whether cancellation was requested or not).
 */
router.post('/admin/orders/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { remarks } = req.body;

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Check if order is already cancelled
    if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
      return res.status(400).json({ success: false, error: 'Order is already cancelled.' });
    }

    // Set cancellation status
    order.cancellationStatus = 'CANCELLED_BY_ADMIN';
    order.orderStatus = ORDER_STATUSES.CANCELLED;
    order.shipmentStatus = 'CANCELED';
    order.latestStatus = 'CANCELED';
    saveOrder(order);

    addOrderEvent(
      orderId, 
      'CANCELLATION', 
      ORDER_STATUSES.CANCELLED, 
      `Order cancelled by administrator. Remarks: ${remarks || 'Direct admin cancellation.'}`,
      { remarks }
    );

    // Cancel on Shiprocket if exists
    if (order.shiprocketOrderId) {
      try {
        const { cancelShiprocketOrder } = require('./shiprocket');
        await cancelShiprocketOrder(order.shiprocketOrderId);
        console.log(`[admin/cancel] Order ${orderId} (Shiprocket: ${order.shiprocketOrderId}) cancelled on Shiprocket.`);
      } catch (srErr) {
        console.error(`[admin/cancel] Failed to cancel order ${orderId} on Shiprocket:`, srErr.message);
        addOrderEvent(
          orderId, 
          'SYSTEM_ERROR', 
          order.orderStatus, 
          `Failed to cancel shipment on Shiprocket: ${srErr.message}`
        );
      }
    }

    // Trigger refund flow if prepaid
    if (order.paymentMethod.toLowerCase().includes('online') && order.paymentStatus === 'PAID') {
      order.refundStatus = 'APPROVED';
      saveOrder(order);

      const refundData = {
        refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        orderId,
        amount: order.orderAmount,
        method: 'Razorpay',
        status: 'APPROVED',
        reason: 'Order Cancelled by Admin',
        approvedAt: new Date().toISOString()
      };
      saveRefund(refundData);

      addOrderEvent(
        orderId, 
        'REFUND', 
        ORDER_STATUSES.REFUND_APPROVED, 
        `Refund of ₹${order.orderAmount} approved for cancelled order. Ready to initiate.`
      );

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.CANCELLED, 
        `Your order ${orderId} has been cancelled by our administration. Since this was a prepaid order, a refund of ₹${order.orderAmount} has been approved and will be initiated shortly.`
      );
    } else {
      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.CANCELLED, 
        `Your order ${orderId} has been cancelled by our administration.`
      );
    }

    res.json({ success: true, message: 'Order successfully cancelled.', order });

  } catch (err) {
    console.error('[admin/cancel]', err.message);
    res.status(500).json({ success: false, error: 'Failed to cancel order.' });
  }
});

/**
 * POST /api/admin/orders/:orderId/ship
 * Admin directly triggers AWB allocation, schedules pickup, and generates shipping label + manifest.
 */
router.post('/admin/orders/:orderId/ship', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.orderStatus === ORDER_STATUSES.CANCELLED) {
      return res.status(400).json({ success: false, error: 'Cannot ship a cancelled order.' });
    }

    const { 
      createShiprocketOrder,
      assignShiprocketAwb, 
      requestShiprocketPickup, 
      generateShiprocketLabel, 
      generateShiprocketManifest 
    } = require('./shiprocket');

    // 1. Push to Shiprocket if not yet created
    if (!order.shiprocketOrderId) {
      console.log(`[admin/ship] Order ${orderId} not on Shiprocket yet. Creating adhoc order...`);
      const srData = await createShiprocketOrder(order);
      order.shiprocketOrderId = srData.order_id || srData.id || null;
      order.shipmentId = srData.shipment_id || null;
      order.awb = srData.awb_code || null;
      order.courierName = srData.courier_name || null;
      order.trackingUrl = srData.tracking_url || null;
      if (order.awb) order.shipmentStatus = 'AWB_ASSIGNED';
      saveOrder(order);
    }

    if (!order.shipmentId) {
      return res.status(400).json({ success: false, error: 'Failed to associate a Shipment ID with this order on Shiprocket.' });
    }

    let logMessage = '';

    // 2. Assign AWB if not present
    if (!order.awb) {
      console.log(`[admin/ship] Allocating AWB for shipment ${order.shipmentId}`);
      const awbData = await assignShiprocketAwb(order.shipmentId);
      const responseObj = awbData.response || {};
      const dataObj = responseObj.data || {};
      
      order.awb = dataObj.awb_code || awbData.awb_code || null;
      order.courierName = dataObj.courier_name || awbData.courier_name || null;
      order.trackingUrl = dataObj.tracking_url || awbData.tracking_url || null;
      if (order.awb) {
        order.shipmentStatus = 'AWB_ASSIGNED';
      }
      logMessage += `AWB Assigned: ${order.awb} via ${order.courierName}. `;
    }

    // 3. Schedule Pickup
    console.log(`[admin/ship] Requesting pickup for shipment ${order.shipmentId}`);
    await requestShiprocketPickup(order.shipmentId);
    logMessage += `Pickup scheduled. `;

    // 4. Generate Label
    console.log(`[admin/ship] Generating shipping label for shipment ${order.shipmentId}`);
    const labelData = await generateShiprocketLabel(order.shipmentId);
    order.labelUrl = labelData.label_url || (labelData.response && labelData.response.label_url) || null;
    logMessage += `Label generated. `;

    // 5. Generate Manifest
    console.log(`[admin/ship] Generating manifest for shipment ${order.shipmentId}`);
    const manifestData = await generateShiprocketManifest(order.shipmentId);
    order.manifestUrl = manifestData.manifest_url || (manifestData.response && manifestData.response.manifest_url) || null;
    logMessage += `Manifest generated. `;

    // Update local database status
    order.orderStatus = ORDER_STATUSES.SHIPPED;
    saveOrder(order);

    addOrderEvent(
      orderId,
      'SHIPPED',
      ORDER_STATUSES.SHIPPED,
      `Order processed and shipped directly from admin panel. ${logMessage}`,
      { labelUrl: order.labelUrl, manifestUrl: order.manifestUrl, awb: order.awb }
    );

    // Send shipment confirmation email to customer
    await sendStatusNotificationEmail(
      order,
      ORDER_STATUSES.SHIPPED,
      `Your order ${orderId} has been processed and shipped via ${order.courierName || 'our courier partner'}. AWB/Tracking number: ${order.awb || 'N/A'}. You can track your shipment using the tracking link.`
    );

    res.json({ success: true, message: 'Order processed and shipped successfully.', order });

  } catch (err) {
    console.error('[admin/ship] Shipping processing failed:', err.message);
    res.status(500).json({ success: false, error: `Shipping processing failed: ${err.message}` });
  }
});

/**
 * PUT /api/admin/orders/:orderId/return
 * Approve or reject a return request.
 */
router.put('/admin/orders/:orderId/return', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved, physicalReturnRequired, remarks, rejectionReason } = req.body;

    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.returnStatus !== 'REQUESTED') {
      return res.status(400).json({ success: false, error: 'No return request pending for this order.' });
    }

    if (approved) {
      order.returnStatus = 'APPROVED';

      if (physicalReturnRequired) {
        order.orderStatus = ORDER_STATUSES.RETURN_PICKUP_SCHEDULED;
        saveOrder(order);

        addOrderEvent(
          orderId, 
          'RETURN', 
          ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, 
          `Return request approved. Physical return required. Return pickup has been scheduled. Remarks: ${remarks || 'None'}`,
          { remarks }
        );

        await sendStatusNotificationEmail(
          order, 
          ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, 
          `Your return request is approved. A pickup has been scheduled at your shipping address. Please keep the products packed and ready.`
        );
      } else {
        // Direct Refund Approval (no physical product return needed)
        order.orderStatus = ORDER_STATUSES.REFUND_APPROVED;
        order.refundStatus = 'APPROVED';
        saveOrder(order);

        const refundData = {
          refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          orderId,
          amount: order.orderAmount,
          method: order.paymentMethod.toLowerCase().includes('online') ? 'Razorpay' : 'Manual',
          status: 'APPROVED',
          reason: 'Return Approved (No product return required)',
          approvedAt: new Date().toISOString()
        };
        saveRefund(refundData);

        addOrderEvent(
          orderId, 
          'REFUND', 
          ORDER_STATUSES.REFUND_APPROVED, 
          `Return approved without physical return. Refund of ₹${order.orderAmount} approved.`
        );

        await sendStatusNotificationEmail(
          order, 
          ORDER_STATUSES.REFUND_APPROVED, 
          `Your return request has been approved. We do not require a physical return. A refund of ₹${order.orderAmount} has been approved and will be initiated.`
        );
      }
    } else {
      order.returnStatus = 'REJECTED';
      order.orderStatus = ORDER_STATUSES.DELIVERED; // Restore to delivered
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'RETURN', 
        ORDER_STATUSES.DELIVERED, 
        `Return request rejected. Reason: ${rejectionReason || 'Does not meet criteria.'}`,
        { rejectionReason }
      );

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.DELIVERED, 
        `Your return request was declined. Reason: ${rejectionReason || 'The product was found ineligible for returns under our policy.'}.`
      );
    }

    res.json({ success: true, message: 'Return request processed.', order });

  } catch (err) {
    console.error('[admin/return]', err.message);
    res.status(500).json({ success: false, error: 'Failed to process return request.' });
  }
});

/**
 * PUT /api/admin/orders/:orderId/return/receive
 * Mark a return item as received and verified.
 */
router.put('/admin/orders/:orderId/return/receive', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { received, remarks } = req.body;

    const order = await getOrderByIdAsync(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    if (order.returnStatus !== 'APPROVED' || order.orderStatus !== ORDER_STATUSES.RETURN_PICKUP_SCHEDULED) {
      return res.status(400).json({ success: false, error: 'Order is not in Return Pickup Scheduled status.' });
    }

    if (received) {
      order.orderStatus = ORDER_STATUSES.REFUND_APPROVED;
      order.refundStatus = 'APPROVED';
      saveOrder(order);

      const refundData = {
        refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        orderId,
        amount: order.orderAmount,
        method: order.paymentMethod.toLowerCase().includes('online') ? 'Razorpay' : 'Manual',
        status: 'APPROVED',
        reason: 'Return received and verified',
        approvedAt: new Date().toISOString()
      };
      saveRefund(refundData);

      addOrderEvent(
        orderId, 
        'RETURN', 
        ORDER_STATUSES.REFUND_APPROVED, 
        `Return item received and verified at warehouse. Refund of ₹${order.orderAmount} approved. Remarks: ${remarks || 'None'}`,
        { remarks }
      );

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.REFUND_APPROVED, 
        `Your return package has been received and verified. A refund of ₹${order.orderAmount} is approved and will be initiated.`
      );
    } else {
      // Failed return collection
      order.orderStatus = ORDER_STATUSES.RETURN_REJECTED;
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'RETURN', 
        ORDER_STATUSES.DELIVERY_FAILED, 
        `Return pickup failed or rejected. Remarks: ${remarks}`
      );
    }

    res.json({ success: true, order });

  } catch (err) {
    console.error('[admin/return/receive]', err.message);
    res.status(500).json({ success: false, error: 'Failed to update return state.' });
  }
});

/**
 * POST /api/admin/orders/:orderId/refund/initiate
 * Trigger refund in payment gateway (Razorpay) or record manual transaction details (COD).
 */
router.post('/admin/orders/:orderId/refund/initiate', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { manualTxnId, manualMethod } = req.body;

    const order = await getOrderByIdAsync(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    let refund = getRefundByOrderId(orderId);

    // Admin direct refund: if no refund record exists, auto-create one (approved)
    if (!refund) {
      // Require that the order was actually paid before allowing a direct refund
      if (order.paymentStatus !== 'PAID') {
        return res.status(400).json({ success: false, error: 'No approved refund request exists for this order and the order is not marked PAID.' });
      }
      const now = new Date().toISOString();
      refund = {
        refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        orderId,
        amount: order.orderAmount,
        method: order.paymentMethod.toLowerCase().includes('online') ? 'Razorpay' : 'Manual',
        status: 'APPROVED',
        reason: 'Admin Direct Refund Override',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      saveRefund(refund);
      order.refundStatus = 'APPROVED';
      saveOrder(order);
      addOrderEvent(orderId, 'REFUND', ORDER_STATUSES.REFUND_APPROVED,
        `Admin manually approved refund of ₹${order.orderAmount} (direct override).`);
    }

    if (refund.status === 'PROCESSED' || refund.status === 'PROCESSING' || refund.status === 'INITIATED') {
      return res.status(400).json({ success: false, error: `Refund is already ${refund.status}. Cannot re-initiate.` });
    }

    // Prevent refund amount from exceeding paid order amount
    if (Number(refund.amount) > Number(order.orderAmount)) {
      return res.status(400).json({ success: false, error: 'Refund amount cannot exceed the order amount.' });
    }

    const isPrepaid = order.paymentMethod.toLowerCase().includes('online');


    if (isPrepaid) {
      /* ── Razorpay Refund Initiation ── */
      if (!order.razorpayPaymentId) {
        return res.status(400).json({ success: false, error: 'Missing Razorpay Payment ID on order record.' });
      }

      try {
        console.log(`[admin/refund] Checking payment status on Razorpay for payment ID: ${order.razorpayPaymentId}`);
        const paymentDetails = await razorpay.payments.fetch(order.razorpayPaymentId);
        
        if (paymentDetails && paymentDetails.status === 'authorized') {
          console.log(`[admin/refund] Payment is in 'authorized' status. Capturing payment of ₹${order.orderAmount} first...`);
          await razorpay.payments.capture(order.razorpayPaymentId, paymentDetails.amount, 'INR');
          console.log(`[admin/refund] Payment captured successfully.`);
        }

        console.log(`[admin/refund] Calling Razorpay refund API for payment ID: ${order.razorpayPaymentId}`);
        const rzRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: Math.round(Number(refund.amount) * 100), // paise
          notes: { orderId, refundId: refund.refundId }
        });


        // Update refund state
        refund.paymentGatewayRefundId = rzRefund.id;
        refund.status = 'INITIATED';
        refund.initiatedAt = new Date().toISOString();
        saveRefund(refund);

        order.refundStatus = 'INITIATED';
        if (![ORDER_STATUSES.CANCELLED, ORDER_STATUSES.RETURN_APPROVED, ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, ORDER_STATUSES.RETURN_PICKED_UP, ORDER_STATUSES.RETURN_RECEIVED, ORDER_STATUSES.RETURN_REJECTED].includes(order.orderStatus)) {
          order.orderStatus = ORDER_STATUSES.REFUND_INITIATED;
        }
        saveOrder(order);

        addOrderEvent(
          orderId, 
          'REFUND', 
          ORDER_STATUSES.REFUND_INITIATED, 
          `Refund of ₹${refund.amount} initiated via Razorpay. Refund ID: ${rzRefund.id}`,
          { rzRefund }
        );

        await sendStatusNotificationEmail(
          order, 
          ORDER_STATUSES.REFUND_INITIATED, 
          `Your refund of ₹${refund.amount} has been initiated. The money will credit back to your original payment method in 5-7 business days.`
        );

        res.json({ success: true, message: 'Razorpay refund initiated successfully.', refund });

      } catch (rzErr) {
        const errorMsg = rzErr.error?.description || rzErr.message || 'Unknown Razorpay error';
        console.error('[admin/refund] Razorpay Refund Error:', errorMsg);
        refund.status = 'FAILED';
        refund.failedAt = new Date().toISOString();
        refund.failureReason = errorMsg;
        saveRefund(refund);

        order.refundStatus = 'FAILED';
        if (![ORDER_STATUSES.CANCELLED, ORDER_STATUSES.RETURN_APPROVED, ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, ORDER_STATUSES.RETURN_PICKED_UP, ORDER_STATUSES.RETURN_RECEIVED, ORDER_STATUSES.RETURN_REJECTED].includes(order.orderStatus)) {
          order.orderStatus = ORDER_STATUSES.REFUND_FAILED;
        }
        saveOrder(order);

        addOrderEvent(
          orderId, 
          'REFUND', 
          ORDER_STATUSES.REFUND_FAILED, 
          `Razorpay refund failed: ${errorMsg}`,
          { error: errorMsg }
        );

        res.status(500).json({ success: false, error: `Razorpay refund failed: ${errorMsg}` });
      }

    } else {
      /* ── COD / Manual Refund Processing ── */
      if (!manualTxnId || !manualMethod) {
        return res.status(400).json({ success: false, error: 'Please provide Bank Transaction ID and Refund Method.' });
      }

      refund.paymentGatewayRefundId = manualTxnId;
      refund.method = manualMethod;
      refund.status = 'PROCESSED';
      refund.initiatedAt = new Date().toISOString();
      refund.processedAt = new Date().toISOString();
      saveRefund(refund);

      order.refundStatus = 'PROCESSED';
      if (![ORDER_STATUSES.CANCELLED, ORDER_STATUSES.RETURN_APPROVED, ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, ORDER_STATUSES.RETURN_PICKED_UP, ORDER_STATUSES.RETURN_RECEIVED, ORDER_STATUSES.RETURN_REJECTED].includes(order.orderStatus)) {
        order.orderStatus = ORDER_STATUSES.REFUND_PROCESSED;
      }
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'REFUND', 
        ORDER_STATUSES.REFUND_PROCESSED, 
        `Refund of ₹${refund.amount} completed manually via ${manualMethod}. Transaction ID: ${manualTxnId}`,
        { manualTxnId, manualMethod }
      );

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.REFUND_PROCESSED, 
        `Your refund of ₹${refund.amount} has been successfully credited to your account via ${manualMethod}. Reference Transaction ID: ${manualTxnId}.`
      );

      res.json({ success: true, message: 'Manual refund recorded successfully.', refund });
    }

  } catch (err) {
    console.error('[admin/refund/initiate]', err.message);
    res.status(500).json({ success: false, error: 'Failed to initiate refund.' });
  }
});

/**
 * POST /api/admin/orders/:orderId/refund/sync
 * Manually sync/complete initiated refunds by querying Razorpay API.
 */
router.post('/admin/orders/:orderId/refund/sync', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await getOrderByIdAsync(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    const refund = getRefundByOrderId(orderId);
    if (!refund || !refund.paymentGatewayRefundId) {
      return res.status(400).json({ success: false, error: 'No gateway refund exists to sync.' });
    }

    if (refund.status === 'PROCESSED') {
      return res.json({ success: true, message: 'Refund already processed. No email sent.', refund });
    }

    // Fetch refund state from Razorpay
    const rzRefund = await razorpay.refunds.fetch(refund.paymentGatewayRefundId);
    
    if (rzRefund.status === 'processed') {
      refund.status = 'PROCESSED';
      refund.processedAt = new Date().toISOString();
      saveRefund(refund);

      order.refundStatus = 'PROCESSED';
      if (![ORDER_STATUSES.CANCELLED, ORDER_STATUSES.RETURN_APPROVED, ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, ORDER_STATUSES.RETURN_PICKED_UP, ORDER_STATUSES.RETURN_RECEIVED, ORDER_STATUSES.RETURN_REJECTED].includes(order.orderStatus)) {
        order.orderStatus = ORDER_STATUSES.REFUND_PROCESSED;
      }
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'REFUND', 
        ORDER_STATUSES.REFUND_PROCESSED, 
        `Razorpay confirmed refund processed. Refund ID: ${rzRefund.id}`
      );

      await sendStatusNotificationEmail(
        order, 
        ORDER_STATUSES.REFUND_PROCESSED, 
        `Your refund of ₹${refund.amount} has been successfully credited to your account. Transaction Reference: ${rzRefund.id}.`
      );
    } else if (rzRefund.status === 'failed') {
      refund.status = 'FAILED';
      refund.failedAt = new Date().toISOString();
      refund.failureReason = 'Razorpay refund failed';
      saveRefund(refund);

      order.refundStatus = 'FAILED';
      if (![ORDER_STATUSES.CANCELLED, ORDER_STATUSES.RETURN_APPROVED, ORDER_STATUSES.RETURN_PICKUP_SCHEDULED, ORDER_STATUSES.RETURN_PICKED_UP, ORDER_STATUSES.RETURN_RECEIVED, ORDER_STATUSES.RETURN_REJECTED].includes(order.orderStatus)) {
        order.orderStatus = ORDER_STATUSES.REFUND_FAILED;
      }
      saveOrder(order);

      addOrderEvent(
        orderId, 
        'REFUND', 
        ORDER_STATUSES.REFUND_FAILED, 
        `Razorpay refund failed during processing.`
      );
    }

    res.json({ success: true, message: `Refund status synced: ${refund.status}`, refund });

  } catch (err) {
    console.error('[admin/refund/sync]', err.message);
    res.status(500).json({ success: false, error: 'Failed to sync refund status.' });
  }
});

/**
 * DELETE /api/admin/orders/:orderId
 * Delete a single order from the cache and Google Sheets.
 * Awaits the Sheets deletion to ensure it completes before responding.
 */
router.delete('/admin/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const success = await deleteOrder(orderId);
    if (success) {
      res.json({ success: true, message: 'Order deleted successfully.' });
    } else {
      res.status(404).json({ success: false, error: 'Order not found.' });
    }
  } catch (err) {
    console.error('[admin/deleteOrder]', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete order.' });
  }
});

/**
 * DELETE /api/admin/orders
 * Delete all orders from the cache and Google Sheets.
 * Awaits all Sheets clears to ensure completion before responding.
 */
router.delete('/admin/orders', async (req, res) => {
  try {
    await clearAllOrders();
    res.json({ success: true, message: 'All orders deleted successfully.' });
  } catch (err) {
    console.error('[admin/deleteAllOrders]', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete all orders.' });
  }
});

/**
 * PUT /api/admin/orders/:orderId/edit
 * Edit details of an order (name, phone, address, state, status, etc.).
 */
router.put('/admin/orders/:orderId/edit', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderByIdAsync(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Update allowable fields
    const editableFields = [
      'customerName', 'phone', 'email', 'address', 'city', 'state', 'pincode',
      'productName', 'quantity', 'unitPrice', 'orderAmount', 'paymentMethod',
      'paymentStatus', 'orderStatus', 'shipmentStatus', 'awb', 'courierName'
    ];

    let changed = false;
    editableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let newVal = req.body[field];
        if (field === 'quantity' || field === 'unitPrice' || field === 'orderAmount') {
          newVal = Number(newVal);
        }
        if (order[field] !== newVal) {
          order[field] = newVal;
          changed = true;
        }
      }
    });

    if (changed) {
      order.updatedAt = new Date().toISOString();
      saveOrder(order);
      addOrderEvent(orderId, 'STATUS_UPDATE', order.orderStatus, 'Order details updated by administrator.');
    }

    res.json({ success: true, message: 'Order updated successfully.', order });
  } catch (err) {
    console.error('[admin/editOrder]', err.message);
    res.status(500).json({ success: false, error: 'Failed to edit order.' });
  }
});

module.exports = router;
