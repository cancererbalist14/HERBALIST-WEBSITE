/**
 * priceList.js — Canonical server-side product price list.
 *
 * ⚠️  IMPORTANT: Keep this in sync with ProductDetail.jsx → products[]
 *     Any price change on the frontend MUST also be updated here.
 *
 * Keys are product IDs (numeric, as stored in the products array).
 * Values are prices in INR (₹).
 */

const PRODUCT_PRICES = {
  1:  799,   // Cap CH95 (30Cap)
  2:  2599,  // C3M Powder
  3:  2299,  // CUP Powder
  4:  799,   // Cap Withangen (30Cap)
  5:  2999,  // Cap AC95 (30Cap)
  6:  2199,  // Cap Livocin (30Cap)
  7:  799,   // Cap Fulvican (30Cap)
  8:  1599,  // Frank Oil 100ml
  9:  599,   // Tab Cyanolina (60Tab)
  10: 999,   // Tab Phytox (60Tab)
  11: 1199,  // Quinoil
  12: 1599,  // Anacose Powder
  13: 999,   // Methicon
  14: 2699,  // Cap K27 (30Cap)
  15: 3299,  // Cap Oxy95 (30Cap)
  16: 3999,  // Cap OxyForte (30Cap)
  17: 1399,  // Cap PSP (30Cap)
  18: 1799,  // 3C (30Cap)
  19: 3740,  // Tab BLOO
};

const MAX_QUANTITY_PER_ITEM = 50;   // safety cap per product line
const MAX_ORDER_AMOUNT      = 200000; // ₹2,00,000 max order

/**
 * Validates that the client-submitted orderAmount is within ±1 rupee of
 * the server-computed expected amount based on productIds + quantities.
 *
 * Supports both single-product and multi-product (comma-separated) orders.
 *
 * @param {string|number} productId   - "1" or "1,2,3"
 * @param {string|number} quantity    - "2" or "1,2,3"
 * @param {string|number} orderAmount - total ₹ sent by client
 * @returns {{ valid: boolean, reason?: string, expectedAmount?: number }}
 */
function validateOrderAmount(productId, quantity, orderAmount) {
  const ids  = String(productId || '').split(',').map(s => Number(s.trim()));
  const qtys = String(quantity  || '1').split(',').map(s => Math.floor(Number(s.trim())));

  // Each product must have a known price
  for (const id of ids) {
    if (!PRODUCT_PRICES[id]) {
      return { valid: false, reason: `Unknown product ID: ${id}` };
    }
  }

  // Each quantity must be reasonable
  for (const q of qtys) {
    if (!Number.isInteger(q) || q < 1 || q > MAX_QUANTITY_PER_ITEM) {
      return { valid: false, reason: `Invalid quantity: ${q}. Must be between 1 and ${MAX_QUANTITY_PER_ITEM}.` };
    }
  }

  // Compute expected total
  const expectedAmount = ids.reduce((sum, id, i) => {
    const qty = qtys[i] ?? qtys[0] ?? 1;
    return sum + (PRODUCT_PRICES[id] * qty);
  }, 0);

  // Validate overall amount cap
  if (expectedAmount > MAX_ORDER_AMOUNT) {
    return { valid: false, reason: `Order amount ₹${expectedAmount} exceeds maximum allowed ₹${MAX_ORDER_AMOUNT}.` };
  }

  // Allow ±1 rupee tolerance for floating-point rounding
  const clientAmount = Number(orderAmount);
  if (Math.abs(clientAmount - expectedAmount) > 1) {
    return {
      valid: false,
      reason: `Order amount mismatch. Expected ₹${expectedAmount}, received ₹${clientAmount}.`,
    };
  }

  return { valid: true, expectedAmount };
}

module.exports = { PRODUCT_PRICES, validateOrderAmount, MAX_QUANTITY_PER_ITEM, MAX_ORDER_AMOUNT };
