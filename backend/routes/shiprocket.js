/**
 * shiprocket.js — Shiprocket API service
 *
 * Handles JWT token caching (valid 10 days) and exposes a single
 * helper: createShiprocketOrder(orderRow)
 *
 * Env vars required:
 *   SHIPROCKET_EMAIL    — API user email (create in Shiprocket → Settings → API)
 *   SHIPROCKET_PASSWORD — API user password
 *
 * Shiprocket docs: https://apidocs.shiprocket.in/
 */

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

/* ── In-memory token cache ─────────────────────────────────────────── */
let _cachedToken     = null;
let _tokenExpiresAt  = 0; // epoch ms — token is valid for 10 days

async function getAuthToken() {
  const now = Date.now();

  // Reuse cached token if it has more than 1 hour of life left
  if (_cachedToken && now < _tokenExpiresAt - 60 * 60 * 1000) {
    return _cachedToken;
  }

  const email    = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD env var is not set.');
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shiprocket auth failed (${res.status}): ${body}`);
  }

  const data = await res.json();

  _cachedToken    = data.token;
  _tokenExpiresAt = now + 10 * 24 * 60 * 60 * 1000; // 10 days in ms

  console.log('[Shiprocket] New token obtained, expires in 10 days.');
  return _cachedToken;
}

/**
 * Maps our internal order object to the Shiprocket adhoc order payload.
 *
 * @param {Object} orderRow — the standard orderRow built in verifyPayment / submitOrder
 * @returns {Promise<Object>} — Shiprocket API response data
 */
async function createShiprocketOrder(orderRow) {
  const token = await getAuthToken();

  // Build item array — supports multiple products (comma-separated productName)
  const productNames = String(orderRow.productName || '').split(',').map(n => n.trim());
  const quantities   = String(orderRow.quantity || '1').split(',').map(q => Number(q.trim()) || 1);
  const unitPrices   = String(orderRow.unitPrice || orderRow.orderAmount || '0')
    .split(',')
    .map(p => Number(p.trim()) || 0);

  const order_items = productNames.map((name, i) => ({
    name:         name || `Product-${String(orderRow.productId || '').split(',')[i]?.trim() || (i + 1)}`,
    sku:          `CH-SKU-${String(orderRow.productId || 'PROD').split(',')[i]?.trim() || i}`,
    units:        quantities[i] || quantities[0] || 1,
    selling_price: unitPrices[i] || unitPrices[0] || Number(orderRow.orderAmount) || 0,
    discount:     0,
    tax:          0,
  }));

  // Sanitize customer details
  const cleanPhone = String(orderRow.phone || '').replace(/\D/g, '').slice(-10) || '9999999999';
  const cleanPincode = String(orderRow.pincode || '').replace(/\D/g, '').slice(0, 6) || '560001';
  
  const rawName = (orderRow.customerName || 'Customer').trim();
  const nameParts = rawName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName  = nameParts.slice(1).join(' ') || 'User';

  const cleanAddress = (orderRow.address || 'Address Not Provided').trim();
  const cleanCity    = (orderRow.city || 'Bangalore').trim();
  const cleanState   = (orderRow.state || 'Karnataka').trim();
  const cleanEmail   = (orderRow.email || 'customer@cancerherbalist.com').trim();

  const payload = {
    order_id:            orderRow.orderId,
    order_date:          new Date().toISOString().replace('T', ' ').slice(0, 19), // "YYYY-MM-DD HH:MM:SS"
    pickup_location:     'THE CANCERHERBALIST', // Address Nickname from Shiprocket → Settings → Pick Up Address

    /* ── Billing / Shipping address ─── */
    billing_customer_name:  firstName,
    billing_last_name:      lastName,
    billing_address:        cleanAddress.length >= 8 ? cleanAddress : `${cleanAddress}, Main Street`,
    billing_address_2:      '',
    billing_city:           cleanCity,
    billing_pincode:        cleanPincode,
    billing_state:          cleanState,
    billing_country:        'India',
    billing_email:          cleanEmail,
    billing_phone:          cleanPhone,
    billing_alternate_phone: '',

    shipping_is_billing:    true,   // same address for shipping

    /* ── Order items ─── */
    order_items,

    /* ── Payment ─── */
    payment_method: String(orderRow.paymentMethod || '').toLowerCase().includes('online') ? 'Prepaid' : 'COD',
    sub_total:      Number(orderRow.orderAmount) || 0,
    length:         10,    // cm — update if you have per-product dims
    breadth:        10,
    height:         10,
    weight:         0.5,   // kg — update per product
  };

  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    const detailMsg = data.message || (data.errors ? JSON.stringify(data.errors) : JSON.stringify(data));
    throw new Error(`Shiprocket API error (${res.status}): ${detailMsg}`);
  }

  return data; // { order_id, shipment_id, status, ... }
}

async function getShiprocketTrackingByShipment(shipmentId) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/track/shipment/${shipmentId}`, {
    method:  'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(
      `Shiprocket tracking fetch failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function getShiprocketTrackingByAwb(awb) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/track/awb/${awb}`, {
    method:  'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(
      `Shiprocket tracking by AWB failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function cancelShiprocketOrder(shiprocketOrderId) {
  if (!shiprocketOrderId) {
    console.warn('[Shiprocket] cancelShiprocketOrder called with null/empty shiprocketOrderId.');
    return null;
  }
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/orders/cancel`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(
      `Shiprocket order cancellation failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  console.log(`[Shiprocket] Order ${shiprocketOrderId} successfully cancelled on Shiprocket.`);
  return data;
}

async function assignShiprocketAwb(shipmentId) {
  if (!shipmentId) throw new Error('shipmentId is required to assign AWB.');
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/assign/awb`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: Number(shipmentId) }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(`Shiprocket AWB assignment failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function requestShiprocketPickup(shipmentId) {
  if (!shipmentId) throw new Error('shipmentId is required to request pickup.');
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/generate/pickup`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const data = await res.json();
  if (!res.ok) {
    // "Already in Pickup Queue" is not an error — the pickup is already scheduled, continue.
    const msg = (data.message || '').toLowerCase();
    if (res.status === 400 && msg.includes('already in pickup queue')) {
      console.log(`[Shiprocket] Pickup already queued for shipment ${shipmentId}. Continuing...`);
      return data;
    }
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(`Shiprocket pickup request failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function generateShiprocketLabel(shipmentId) {
  if (!shipmentId) throw new Error('shipmentId is required to generate label.');
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/courier/generate/label`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(`Shiprocket label generation failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function generateShiprocketManifest(shipmentId) {
  if (!shipmentId) throw new Error('shipmentId is required to generate manifest.');
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}/manifests/generate`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      _cachedToken    = null;
      _tokenExpiresAt = 0;
    }
    throw new Error(`Shiprocket manifest generation failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = { 
  createShiprocketOrder, 
  getShiprocketTrackingByShipment, 
  getShiprocketTrackingByAwb,
  cancelShiprocketOrder,
  assignShiprocketAwb,
  requestShiprocketPickup,
  generateShiprocketLabel,
  generateShiprocketManifest
};
