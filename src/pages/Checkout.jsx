import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaLeaf, FaShieldAlt, FaTruck,
  FaExclamationTriangle, FaSpinner, FaArrowLeft,
  FaLock, FaBox,
} from 'react-icons/fa';
import { useOrderSubmit } from '../hooks/useOrderSubmit';
import { useRazorpay }   from '../hooks/useRazorpay';
import { useCart } from '../context/CartContext';

const ACCENT  = '#38bed5';
const PRIMARY = '#1a6e52';

/* ── helpers ─────────────────────────────────────────────────────────── */
const inBase = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 16px',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', outline: 'none',
  background: '#f8fafc', color: '#0f172a',
  fontFamily: 'Poppins, sans-serif', transition: 'border-color 0.2s',
};
const focusBorder  = (e) => (e.target.style.borderColor = ACCENT);
const blurBorder   = (e) => (e.target.style.borderColor = '#e2e8f0');

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontSize: '11.5px', fontWeight: 700,
        color: '#334155', marginBottom: '6px',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
export default function Checkout() {
  const { state }  = useLocation();   // { product, qty } passed from ProductDetail if direct buy
  const navigate   = useNavigate();
  const { submitOrder, status, error, reset }         = useOrderSubmit();
  const { initializePayment, rzpStatus, rzpError }    = useRazorpay();
  const { cart, cartTotal, clearCart } = useCart();

  /* derived helpers */
  const isProcessing  = status === 'submitting' ||
    rzpStatus === 'creating' || rzpStatus === 'paying' || rzpStatus === 'verifying';
  const displayError  = error || rzpError;

  /* State for direct Buy Now vs Cart */
  const isDirectBuy = !!state?.product;
  const [directQty, setDirectQty] = useState(state?.qty || 1);

  const checkoutItems = isDirectBuy 
    ? [{ product: state.product, qty: directQty }]
    : cart;

  const total = isDirectBuy ? (state.product.price * directQty) : cartTotal;

  /* Redirect if no product/cart context — only on initial mount */
  useEffect(() => {
    if (!state?.product && cart.length === 0) navigate('/store', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  const [paymentMethod, setPaymentMethod] = useState(state?.paymentMethod || 'cod');

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [formError, setFormError] = useState('');

  /* ── field change ────────────────────────────────────────────────── */
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── validation ─────────────────────────────────────────────────── */
  const validate = () => {
    if (!form.customerName.trim()) return 'Please enter your full name.';
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Enter a valid 10-digit phone number.';
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) return 'Enter a valid email address.';
    if (!form.address.trim()) return 'Please enter your shipping address.';
    if (!form.city.trim()) return 'Please enter your city.';
    if (!form.state.trim()) return 'Please enter your state.';
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit pincode.';

    return null;
  };

  /* ── submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError('');

    const apiProductName = checkoutItems.map(i => `${i.product.name} (x${i.qty})`).join(', ');
    const apiProductId = checkoutItems.map(i => i.product.id).join(',');
    const apiQuantity = checkoutItems.reduce((acc, i) => acc + i.qty, 0);

    // Build WhatsApp text upfront (while form data is still available)
    const buildWaText = (oid) => {
      const itemsText = checkoutItems.map(i => `- ${i.product.name} (x${i.qty})`).join('\n');
      return encodeURIComponent(
        `🌿 *New Order — Cancer Herbalist*\n\n` +
        `Items:\n${itemsText}\nTotal Amount: ₹${total.toLocaleString('en-IN')}\n` +
        `Payment Method: ${paymentMethod === 'online' ? 'Paid Online via UPI' : 'COD / Bank Transfer'}\n` +
        (oid ? `Order ID: ${oid}\n` : '') + `\n` +
        `Name: ${form.customerName}\nPhone: ${form.phone}\n` +
        `Email: ${form.email}\n` +
        `Address: ${form.address}, ${form.city}, ${form.state} - ${form.pincode}` +
        (paymentMethod === 'online' ? `\n\n(I am attaching my payment screenshot below)` : '')
      );
    };

    // Navigate to success page — completely decoupled from cart/hook state
    const goToSuccess = (oid) => {
      console.log('[Checkout] goToSuccess called with orderId:', oid);
      if (!isDirectBuy) clearCart();

      // Save order to local storage cache for instant dashboard lookup
      if (oid) {
        try {
          const savedOrders = new Set(JSON.parse(localStorage.getItem('my_orders') || '[]'));
          savedOrders.add(oid.trim());
          localStorage.setItem('my_orders', JSON.stringify(Array.from(savedOrders)));
          
          const contact = form.phone.trim() || form.email.trim();
          if (contact) {
            localStorage.setItem('last_verified_contact', contact);
          }
        } catch (e) {
          console.warn('[Checkout] Failed to save order ID to local cache:', e);
        }
      }

      navigate('/order-success', {
        replace: true,
        state: {
          orderId:       oid,
          paymentMethod,
          total,
          email:         form.email.trim(),
          phone:         form.phone.trim(),
          customerName:  form.customerName.trim(),
          waText:        buildWaText(oid),
        },
      });
      console.log('[Checkout] navigate to /order-success fired');
    };

    if (paymentMethod === 'online') {
      /* ── Razorpay flow ── */
      await initializePayment({
        amount:       total,
        productName:  apiProductName,
        productId:    apiProductId,
        customerName: form.customerName.trim(),
        phone:        form.phone.trim(),
        email:        form.email.trim(),
        address:      form.address.trim(),
        city:         form.city.trim(),
        state:        form.state.trim(),
        pincode:      form.pincode.trim(),
        quantity:     apiQuantity,
        unitPrice:    total,
        orderAmount:  total,
        onSuccess:    (data) => goToSuccess(data?.orderId || ''),
      });
    } else {
      /* ── COD flow ── */
      try {
        const result = await submitOrder({
          customerName:   form.customerName.trim(),
          phone:          form.phone.trim(),
          email:          form.email.trim(),
          address:        form.address.trim(),
          city:           form.city.trim(),
          state:          form.state.trim(),
          pincode:        form.pincode.trim(),
          productName:    apiProductName,
          quantity:       apiQuantity,
          unitPrice:      total,
          orderAmount:    total,
          productId:      apiProductId,
          paymentMethod:  'COD / Bank Transfer',
        });
        goToSuccess(result?.orderId || '');
      } catch (err) {
        // error handled by useOrderSubmit
        console.error('[Checkout] submitOrder failed:', err);
      }
    }
  };


  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Hero strip ── */}
      <section style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 100%)`,
        padding: '120px 20px 50px', textAlign: 'center', color: '#fff',
      }}>
        <span style={{
          background: `${ACCENT}33`, border: `1px solid ${ACCENT}66`,
          color: ACCENT, padding: '5px 16px', borderRadius: '50px',
          fontSize: '12px', fontWeight: 600,
        }}>
          🔒 Secure Checkout
        </span>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          margin: '16px 0 10px',
        }}>
          Complete Your <span style={{ color: ACCENT }}>Order</span>
        </h1>
        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>
          Fill in your shipping details and we&apos;ll dispatch within 24 hours.
        </p>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* ── TWO-COLUMN GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 340px',
          gap: '28px',
          alignItems: 'start',
        }}
          className="checkout-grid"
        >

          {/* ── LEFT: Form ── */}
          <div>
            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: PRIMARY, fontWeight: 600, fontSize: '13px',
                textDecoration: 'none', marginBottom: '24px',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <FaArrowLeft fontSize="11px" /> Go Back
            </button>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="checkout-form"
                style={{
                  background: '#fff', borderRadius: '20px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                  padding: '32px',
                }}
              >
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', marginTop: 0, marginBottom: '24px', fontSize: '1.3rem' }}>
                  Shipping Details
                </h2>

                <Field label="Full Name" required>
                  <input
                    type="text" name="customerName" id="customerName"
                    placeholder="e.g. Rahul Sharma"
                    value={form.customerName} onChange={handleChange}
                    style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>

                <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Phone Number" required>
                    <input
                      type="tel" name="phone" id="phone"
                      placeholder="10-digit mobile"
                      value={form.phone} onChange={handleChange}
                      style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <input
                      type="email" name="email" id="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange}
                      style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </Field>
                </div>

                <Field label="Street Address / Flat / Building" required>
                  <textarea
                    name="address" id="address"
                    placeholder="House no., street, locality…"
                    value={form.address} onChange={handleChange}
                    rows={3}
                    style={{ ...inBase, resize: 'vertical' }}
                    onFocus={focusBorder} onBlur={blurBorder}
                  />
                </Field>

                <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
                  <Field label="City" required>
                    <input
                      type="text" name="city" id="city"
                      placeholder="e.g. Bengaluru"
                      value={form.city} onChange={handleChange}
                      style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </Field>
                  <Field label="State" required>
                    <input
                      type="text" name="state" id="state"
                      placeholder="e.g. Karnataka"
                      value={form.state} onChange={handleChange}
                      style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </Field>
                  <Field label="Pincode" required>
                    <input
                      type="text" name="pincode" id="pincode"
                      placeholder="560001"
                      maxLength={6}
                      value={form.pincode} onChange={handleChange}
                      style={inBase} onFocus={focusBorder} onBlur={blurBorder}
                    />
                  </Field>
                </div>

                <Field label="Payment Method" required>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px', marginBottom: '8px' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px', border: `1.5px solid ${paymentMethod === 'cod' ? PRIMARY : '#e2e8f0'}`,
                      borderRadius: '10px', background: paymentMethod === 'cod' ? `${PRIMARY}08` : '#f8fafc',
                      cursor: 'pointer', transition: 'all 0.2s', fontSize: '13.5px', fontWeight: 600,
                      color: paymentMethod === 'cod' ? PRIMARY : '#475569'
                    }}>
                      <input
                        type="radio" name="paymentMethod" value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        style={{ accentColor: PRIMARY }}
                      />
                      COD / Bank Transfer
                    </label>

                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px', border: `1.5px solid ${paymentMethod === 'online' ? PRIMARY : '#e2e8f0'}`,
                      borderRadius: '10px', background: paymentMethod === 'online' ? `${PRIMARY}08` : '#f8fafc',
                      cursor: 'pointer', transition: 'all 0.2s', fontSize: '13.5px', fontWeight: 600,
                      color: paymentMethod === 'online' ? PRIMARY : '#475569'
                    }}>
                      <input
                        type="radio" name="paymentMethod" value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        style={{ accentColor: PRIMARY }}
                      />
                      Pay Online (UPI App)
                    </label>
                  </div>
                </Field>

                {paymentMethod === 'online' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                    style={{
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      background: '#f8fafc',
                      marginBottom: '20px',
                      overflow: 'hidden'
                    }}
                  >
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>💳</span>
                      You will be redirected to the secure Razorpay screen to complete your payment using Card, UPI Apps, or UPI QR Code.
                    </p>
                  </motion.div>
                )}

                {/* Error banner */}
                {(formError || displayError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: '10px', padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      color: '#b91c1c', fontSize: '13.5px', marginBottom: '16px',
                    }}
                  >
                    <FaExclamationTriangle />
                    <span>{formError || displayError}</span>
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  id="placeOrderBtn"
                  disabled={isProcessing}
                  style={{
                    width: '100%', padding: '15px',
                    background: isProcessing ? '#94a3b8'
                      : paymentMethod === 'online'
                        ? `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`
                        : PRIMARY,
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    fontFamily: 'inherit', transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: isProcessing ? 'none' : `0 4px 14px ${PRIMARY}40`,
                  }}
                >
                  {isProcessing ? (
                    <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                      {rzpStatus === 'creating'   && 'Preparing Payment…'}
                      {rzpStatus === 'paying'     && 'Waiting for Payment…'}
                      {rzpStatus === 'verifying'  && 'Verifying Payment…'}
                      {status    === 'submitting' && 'Placing Order…'}
                    </>
                  ) : paymentMethod === 'online' ? (
                    <><FaLock style={{ fontSize: '13px' }} /> Pay ₹{total.toLocaleString('en-IN')} via Razorpay</>
                  ) : (
                    <><FaLock style={{ fontSize: '13px' }} /> Place Order — ₹{total.toLocaleString('en-IN')}</>
                  )}
                </button>



                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div>
            <div style={{
              background: '#fff', borderRadius: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              padding: '28px', position: 'sticky', top: '90px',
            }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                {checkoutItems.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: '14px', alignItems: 'center',
                    background: '#f8fafc', borderRadius: '12px', padding: '10px',
                  }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '10px',
                      overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: `linear-gradient(135deg, ${item.product.color}18, ${item.product.color}38)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: '24px' }}>{item.product.icon}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.name}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>₹{item.product.price?.toLocaleString('en-IN')} x {item.qty}</p>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                      ₹{(item.product.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Qty stepper (Only for direct buy) */}
              {isDirectBuy && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setDirectQty(q => Math.max(1, q - 1))}
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                        cursor: 'pointer', fontWeight: 700, fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >−</button>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', minWidth: '20px', textAlign: 'center' }}>{directQty}</span>
                    <button
                      type="button"
                      onClick={() => setDirectQty(q => q + 1)}
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                        cursor: 'pointer', fontWeight: 700, fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: '#22c55e', fontSize: '13px' }}>FREE</span>
                </div>
                
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '4px',
                }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>Total</span>
                  <span style={{ fontWeight: 800, color: PRIMARY, fontSize: '17px' }}>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: <FaTruck />,      text: 'Free shipping Pan-India' },
                  { icon: <FaBox />,        text: 'Dispatched within 24 hrs' },
                  { icon: <FaLeaf />,       text: '100% authentic, FSSAI certified' },
                  { icon: <FaShieldAlt />,  text: 'COD & bank transfer accepted' },
                ].map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
                    <span style={{ color: ACCENT }}>{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row-2,
          .form-row-3 {
            grid-template-columns: 1fr !important;
          }
          .checkout-form {
            padding: 20px 16px !important;
            border-radius: 16px !important;
          }
        }
        @media (max-width: 400px) {
          .checkout-form {
            padding: 16px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
