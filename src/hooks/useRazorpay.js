/**
 * useRazorpay.js
 *
 * Loads Razorpay Checkout.js, creates a Razorpay order via the backend,
 * opens the payment popup, and verifies the payment — all in one call.
 *
 * Usage:
 *   const { initializePayment, rzpStatus, rzpError } = useRazorpay();
 *
 *   rzpStatus: 'idle' | 'creating' | 'paying' | 'verifying' | 'success' | 'error'
 */

import { useState, useCallback } from 'react';

// ── Point this to your backend URL ─────────────────────────────────────────
// During development: http://localhost:5000
// After deploying to Vercel: https://your-vercel-app.vercel.app
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

/* Dynamically loads Razorpay checkout.js (only once) */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [rzpStatus, setRzpStatus] = useState('idle');
  const [rzpError,  setRzpError]  = useState(null);

  /**
   * @param {Object} params
   *   amount, productName, productId,
   *   customerName, phone, email,
   *   address, city, state, pincode,
   *   quantity, unitPrice,
   *   onSuccess(data), onError(msg)
   */
  const initializePayment = useCallback(async (params) => {
    const { onSuccess, onError, ...orderData } = params;
    setRzpStatus('creating');
    setRzpError(null);

    try {
      /* 1 ── Load Razorpay script */
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay. Check your internet connection.');

      /* 2 ── Create order on backend */
      const res = await fetch(`${BACKEND_URL}/api/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:       orderData.amount,
          productName:  orderData.productName,
          productId:    orderData.productId,
          customerName: orderData.customerName,
          phone:        orderData.phone,
          email:        orderData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Backend error: could not create order.');

      setRzpStatus('paying');

      /* 3 ── Open Razorpay checkout popup */
      const rzpOptions = {
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Cancer Herbalist',
        description: orderData.productName,
        order_id:    data.orderId,
        prefill: {
          name:    orderData.customerName,
          email:   orderData.email,
          contact: orderData.phone,
        },
        theme: { color: '#1a6e52' },
        method: {
          netbanking: false,
          card: true,
          wallet: false,
          upi: true,
          emi: false,
          paylater: false,
        },
        modal: {
          ondismiss: () => {
            setRzpStatus('idle'); // user closed popup without paying
          },
        },
        handler: async (response) => {
          /* 4 ── Verify on backend after successful payment */
          setRzpStatus('verifying');
          try {
            const vRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                ...orderData,
              }),
            });
            const vData = await vRes.json();
            if (!vRes.ok || !vData.success) throw new Error(vData.error || 'Payment verification failed.');

            setRzpStatus('success');
            onSuccess?.(vData); // { orderId, paymentId }
          } catch (vErr) {
            setRzpStatus('error');
            setRzpError(vErr.message);
            onError?.(vErr.message);
          }
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed. Please try again.';
        setRzpStatus('error');
        setRzpError(msg);
        onError?.(msg);
      });
      rzp.open();

    } catch (err) {
      setRzpStatus('error');
      setRzpError(err.message);
      onError?.(err.message);
    }
  }, []);

  return { initializePayment, rzpStatus, rzpError };
}
