/**
 * shiprocketWebhook.js
 * Receiver for Shiprocket tracking webhooks and cron/manual synchronization.
 */

const express = require('express');
const router  = express.Router();
const { 
  getOrders, 
  getOrderByShipmentId, 
  getOrderByAwb, 
  saveOrder, 
  addOrderEvent, 
  updateOrderStatus,
  deleteOrder,
  saveRefund
} = require('./ordersDb');
const { ORDER_STATUSES, ORDER_STATUS_LABELS, mapShiprocketStatus } = require('./orderStatuses');
const { getShiprocketTrackingByShipment } = require('./shiprocket');
const { sendStatusNotificationEmail } = require('./emailService');

/**
 * POST /api/shiprocket/webhook
 * Receives real-time tracking webhook updates from Shiprocket.
 */
router.post('/shiprocket/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[shiprocket-webhook] Received payload:', JSON.stringify(payload));

    const shipmentId    = payload.shipment_id;
    const awb           = payload.awb;
    const currentStatus = payload.current_status;
    const trackingState = payload.tracking_status || currentStatus;
    const etd           = payload.etd || payload.edd || null;
    const courierName   = payload.courier_name || null;
    const activityList  = payload.scans || [];

    if (!shipmentId && !awb) {
      return res.status(400).json({ success: false, error: 'Missing shipment_id or awb identifier.' });
    }

    // 1. Find corresponding order in DB
    let order = null;
    if (shipmentId) order = getOrderByShipmentId(shipmentId);
    if (!order && awb) order = getOrderByAwb(awb);

    if (!order) {
      console.warn(`[shiprocket-webhook] No matching order found for shipmentId: ${shipmentId}, AWB: ${awb}`);
      // Return 200 to acknowledge receipt of webhook so Shiprocket doesn't retry indefinitely
      return res.json({ success: false, message: 'Order not found in internal database.' });
    }

    // 2. Map external status to internal status
    const internalStatus = mapShiprocketStatus(currentStatus);
    const oldStatus      = order.orderStatus;

    // 3. Update order fields
    order.shipmentStatus        = currentStatus;
    order.latestStatus          = trackingState;
    order.estimatedDeliveryDate = etd || order.estimatedDeliveryDate;
    if (courierName) order.courierName = courierName;
    if (awb && !order.awb) order.awb = awb;
    order.lastSyncedAt          = new Date().toISOString();

    saveOrder(order);

    // 4. Update status and log event only if status has changed to prevent duplicate logs
    if (oldStatus !== internalStatus) {
      let customMsg = `Your shipment is now in state: ${ORDER_STATUS_LABELS[internalStatus]}.`;
      
      if (internalStatus === ORDER_STATUSES.SHIPPED) {
        customMsg = `Great news! Your package has been handed over to the courier (${order.courierName || 'Shiprocket'}) and is in transit.`;
      } else if (internalStatus === ORDER_STATUSES.OUT_FOR_DELIVERY) {
        customMsg = `Your order is out for delivery today! Keep your phone handy. Our delivery executive will contact you.`;
      } else if (internalStatus === ORDER_STATUSES.DELIVERED) {
        customMsg = `Your package has been successfully delivered. Thank you for shopping with Cancer Herbalist!`;
        order.paymentStatus = 'PAID'; // Mark COD as PAID when delivered
        saveOrder(order);             // Persist paymentStatus immediately
      } else if (internalStatus === ORDER_STATUSES.DELIVERY_FAILED) {
        customMsg = `We attempted to deliver your package, but the delivery failed. The courier will re-attempt delivery.`;
      } else if (internalStatus === ORDER_STATUSES.RTO_INITIATED) {
        customMsg = `Your package is returning to sender (RTO) due to multiple failed delivery attempts.`;
      } else if (internalStatus === ORDER_STATUSES.CANCELLED) {
        customMsg = `Your order has been cancelled.`;
      }

      order.orderStatus = internalStatus;
      saveOrder(order);

      addOrderEvent(
        order.orderId,
        'SHIPMENT_UPDATE',
        internalStatus,
        customMsg,
        { rawPayload: payload }
      );

      // Trigger status update email
      await sendStatusNotificationEmail(order, internalStatus, customMsg);

      // If the status is CANCELLED (cancelled from Shiprocket), delete/clear from Google Sheets and cache
      if (internalStatus === ORDER_STATUSES.CANCELLED) {
        // Trigger refund flow if prepaid
        if (order.paymentMethod?.toLowerCase().includes('online') && order.paymentStatus === 'PAID') {
          order.refundStatus = 'APPROVED';
          saveOrder(order);

          const refundData = {
            refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            orderId: order.orderId,
            amount: order.orderAmount,
            method: 'Razorpay',
            status: 'APPROVED',
            reason: 'Order Cancelled on Shiprocket',
            approvedAt: new Date().toISOString()
          };
          saveRefund(refundData);

          addOrderEvent(
            order.orderId,
            'REFUND',
            ORDER_STATUSES.REFUND_APPROVED,
            `Refund of ₹${order.orderAmount} approved for cancelled order. Ready to initiate.`
          );
        }

        await deleteOrder(order.orderId);
        console.log(`[shiprocket-webhook] Order ${order.orderId} cancelled from Shiprocket and permanently deleted from Google Sheets and database.`);
      }
    }

    res.json({ success: true, message: 'Webhook processed.' });

  } catch (err) {
    console.error('[shiprocket-webhook] Error processing webhook:', err.message);
    res.status(500).json({ success: false, error: 'Internal processing error.' });
  }
});

/**
 * GET /api/shiprocket/sync
 * Manually or automatically sync/poll all active orders with Shiprocket APIs.
 * Useful as a cron job or fallback.
 */
router.get('/shiprocket/sync', async (req, res) => {
  // Require admin auth to prevent unauthorized mass-sync triggers
  const key = req.query.key || req.headers['x-admin-key'];
  const adminSecret = process.env.ADMIN_SECRET || 'ch-admin-2024';
  if (key !== adminSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }
  try {
    const orders = getOrders();
    // Filter active orders that have been shipped/confirmed but not delivered/canceled
    const activeOrders = orders.filter(o => 
      o.shipmentId && 
      ![
        ORDER_STATUSES.DELIVERED, 
        ORDER_STATUSES.CANCELLED, 
        ORDER_STATUSES.RTO_DELIVERED,
        ORDER_STATUSES.REFUND_PROCESSED
      ].includes(o.orderStatus)
    );

    console.log(`[shiprocket-sync] Found ${activeOrders.length} active orders to sync.`);
    let syncCount = 0;

    for (const order of activeOrders) {
      try {
        console.log(`[shiprocket-sync] Polling shipment status for order ${order.orderId} (Shipment: ${order.shipmentId})...`);
        const trackingData = await getShiprocketTrackingByShipment(order.shipmentId);

        // Shiprocket tracking response structure:
        // { "tracking_data": { "track_status": 1, "shipment_status": "Shipped", "etd": "...", "scans": [...] } }
        const tracking = trackingData.tracking_data || {};
        const shiprocketStatus = tracking.shipment_status || tracking.status;

        if (shiprocketStatus) {
          const internalStatus = mapShiprocketStatus(shiprocketStatus);
          const oldStatus      = order.orderStatus;

          order.shipmentStatus        = shiprocketStatus;
          order.latestStatus          = tracking.track_status || shiprocketStatus;
          order.estimatedDeliveryDate = tracking.etd || order.estimatedDeliveryDate;
          order.lastSyncedAt          = new Date().toISOString();
          saveOrder(order);

          if (oldStatus !== internalStatus) {
            let customMsg = `Your shipment is now: ${ORDER_STATUS_LABELS[internalStatus]}.`;
            if (internalStatus === ORDER_STATUSES.SHIPPED) {
              customMsg = `Your package has been handed over to the courier and is in transit.`;
            } else if (internalStatus === ORDER_STATUSES.OUT_FOR_DELIVERY) {
              customMsg = `Your order is out for delivery today.`;
            } else if (internalStatus === ORDER_STATUSES.DELIVERED) {
              customMsg = `Your package has been successfully delivered.`;
              order.paymentStatus = 'PAID';
            } else if (internalStatus === ORDER_STATUSES.CANCELLED) {
              customMsg = `Your order has been cancelled.`;
            }

            order.orderStatus = internalStatus;
            saveOrder(order);

            addOrderEvent(
              order.orderId,
              'SHIPMENT_UPDATE',
              internalStatus,
              customMsg,
              { tracking }
            );

            await sendStatusNotificationEmail(order, internalStatus, customMsg);

            // If the status is CANCELLED (cancelled from Shiprocket), delete/clear from Google Sheets and cache
            if (internalStatus === ORDER_STATUSES.CANCELLED) {
              // Trigger refund flow if prepaid
              if (order.paymentMethod?.toLowerCase().includes('online') && order.paymentStatus === 'PAID') {
                order.refundStatus = 'APPROVED';
                saveOrder(order);

                const refundData = {
                  refundId: `RF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                  orderId: order.orderId,
                  amount: order.orderAmount,
                  method: 'Razorpay',
                  status: 'APPROVED',
                  reason: 'Order Cancelled on Shiprocket',
                  approvedAt: new Date().toISOString()
                };
                saveRefund(refundData);

                addOrderEvent(
                  order.orderId,
                  'REFUND',
                  ORDER_STATUSES.REFUND_APPROVED,
                  `Refund of ₹${order.orderAmount} approved for cancelled order. Ready to initiate.`
                );
              }

              await deleteOrder(order.orderId);
              console.log(`[shiprocket-sync] Order ${order.orderId} cancelled from Shiprocket and permanently deleted from Google Sheets and database.`);
            }

            syncCount++;
          }
        }
      } catch (err) {
        console.error(`[shiprocket-sync] Error syncing order ${order.orderId}:`, err.message);
      }
    }

    res.json({ success: true, syncedCount: syncCount, totalPolled: activeOrders.length });

  } catch (err) {
    console.error('[shiprocket-sync] Sync runner failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to run tracking sync.' });
  }
});

module.exports = router;
