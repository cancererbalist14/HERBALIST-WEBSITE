const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { getOrders, addOrderEvent } = require('./ordersDb');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/razorpay-webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret) {
      console.warn('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set. Skipping verification (NOT RECOMMENDED).');
    } else if (signature) {
      try {
        // Use raw body if available, otherwise stringify the parsed body
        const bodyToVerify = req.rawBody || JSON.stringify(req.body);
        Razorpay.validateWebhookSignature(bodyToVerify, signature, webhookSecret);
      } catch (err) {
        console.error('[razorpay-webhook] Signature validation failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
        return res.status(400).json({ error: 'Missing signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;

    if (!payment) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log(`[razorpay-webhook] Received event: ${event} for payment: ${payment.id}`);

    if (event === 'payment.authorized') {
      // Actively capture the payment
      try {
        await razorpay.payments.capture(payment.id, payment.amount, payment.currency);
        console.log(`[razorpay-webhook] Captured payment ${payment.id}`);
      } catch (captureError) {
        console.error(`[razorpay-webhook] Failed to capture payment ${payment.id}:`, captureError.message);
      }
    }
    
    if (event === 'payment.captured') {
        const razorpayOrderId = payment.order_id;
        if (razorpayOrderId) {
             const existingOrders = getOrders();
             const existingOrder  = existingOrders.find(o => o.razorpayOrderId === razorpayOrderId);
             if (existingOrder) {
                 // Prevent duplicate events
                 const events = existingOrder.events || [];
                 const alreadyLogged = events.some(e => e.type === 'PAYMENT' && e.details?.razorpayPaymentId === payment.id && e.message.includes('webhook'));
                 
                 if (!alreadyLogged) {
                     addOrderEvent(existingOrder.orderId, 'PAYMENT', existingOrder.orderStatus, `Payment captured successfully via webhook. Transaction ID: ${payment.id}`, { razorpayPaymentId: payment.id });
                 }
             }
        }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[razorpay-webhook] Error processing webhook:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
