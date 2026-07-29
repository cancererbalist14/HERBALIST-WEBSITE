/**
 * useOrderSubmit.js
 *
 * Submits COD / Bank Transfer orders to the backend API,
 * which records them to Google Sheets AND creates a Shiprocket shipment.
 *
 * Returns { submitOrder, status, error, reset }
 *   status: 'idle' | 'submitting' | 'success' | 'error'
 */

import { useState, useCallback } from 'react';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const BACKEND_URL   = rawBackendUrl.replace(/\/+$/, '');

export function useOrderSubmit() {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError]   = useState(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  /**
   * @param {Object} orderData  - All order fields
   * @returns {Promise<{orderId: string, shiprocketOrderId: string|null}>}
   */
  const submitOrder = useCallback(async (orderData) => {
    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/submit-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      setStatus('success');
      return { orderId: data.orderId, shiprocketOrderId: data.shiprocketOrderId };

    } catch (err) {
      console.error('[useOrderSubmit]', err);
      setStatus('error');
      setError(err.message || 'Failed to place order. Please try again.');
      throw err;
    }
  }, []);

  return { submitOrder, status, error, reset };
}
