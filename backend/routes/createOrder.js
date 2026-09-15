const express  = require('express');
const Razorpay = require('razorpay');
const { validateSchema } = require('../utils/validateSchema');
const router   = express.Router();

/* Initialize once with your keys from .env */
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order Schema
const createOrderSchema = {
  amount: { type: 'number', required: true, min: 1, max: 200000 },
  productName: { type: 'string', required: true, min: 2, max: 500 },
  productId: { type: 'string', required: true, min: 1, max: 200 },
  customerName: { type: 'string', required: true, min: 2, max: 100, format: 'name' },
  phone: { type: 'string', required: true, format: 'phone' },
  email: { type: 'string', required: false, format: 'email', max: 100 },
};

/**
 * POST /api/create-order
 *
 * Body: { amount, productName, productId, customerName, phone, email }
 * Returns: { success, orderId, amount, currency, key }
 */
router.post('/create-order', async (req, res) => {
  try {
    const validationError = validateSchema(req.body, createOrderSchema);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { amount, productName, productId, customerName, phone, email } = req.body;

    const options = {
      amount:   Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      receipt:  `ch_${Date.now()}`,
      payment_capture: 1, // Automatically capture the payment
      notes: { productName, productId, customerName, phone, email },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID, // safe — this is the public key
    });
  } catch (err) {
    console.error('[create-order]', err.message);
    res.status(500).json({ error: 'Could not create order. Check your Razorpay keys.' });
  }
});

module.exports = router;
