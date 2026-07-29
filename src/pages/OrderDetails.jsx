import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaClipboardList, FaLock, FaUser, FaMapMarkerAlt, FaCalendarAlt, 
  FaUndo, FaTimesCircle, FaExclamationTriangle, FaCreditCard, 
  FaInfoCircle, FaFileAlt, FaCheckCircle, FaSpinner 
} from 'react-icons/fa';

const PRIMARY = '#1a6e52';
const ACCENT  = '#38bed5';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

// Load Razorpay script utility
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

export default function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Verification state
  const [contact, setContact] = useState(location.state?.verifiedContact || localStorage.getItem('last_verified_contact') || '');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Order data
  const [order, setOrder] = useState(null);
  const [events, setEvents] = useState([]);
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal forms state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelComments, setCancelComments] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged / Broken packaging');
  const [returnComments, setReturnComments] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Payment retry state
  const [retryingPayment, setRetryingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Trigger verification if pre-filled contact is present on mount
  useEffect(() => {
    if (contact && orderId) {
      handleVerify(contact);
    }
  }, [orderId]);

  const handleVerify = async (contactVal) => {
    if (!contactVal.trim()) return;
    setVerifying(true);
    setVerifyError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/track`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, contact: contactVal.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Mismatch or invalid order ID.');
      }

      setOrder(data.order);
      setEvents(data.events);
      setRefund(data.refund);
      setVerified(true);
      localStorage.setItem('last_verified_contact', contactVal.trim());
    } catch (err) {
      setVerifyError(err.message);
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    handleVerify(contact);
  };

  // Submit Cancellation Request
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setCancelSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/cancel`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ 
          orderId, 
          contact, 
          reason: cancelReason, 
          comments: cancelComments 
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel order.');
      }

      setShowCancelModal(false);
      // Reload order details
      handleVerify(contact);

    } catch (err) {
      alert(err.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Submit Return Request
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/return`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ 
          orderId, 
          contact, 
          reason: returnReason, 
          comments: returnComments 
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to request return.');
      }

      setShowReturnModal(false);
      // Reload order details
      handleVerify(contact);

    } catch (err) {
      alert(err.message);
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Payment Retry Flow (Razorpay)
  const handlePaymentRetry = async () => {
    setRetryingPayment(true);
    setPaymentError('');

    try {
      // 1. Get new Razorpay order ID
      const res = await fetch(`${BACKEND_URL}/api/orders/retry-payment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, contact }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment retry.');
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check network.');
      }

      // 3. Open Checkout widget
      const rzpOptions = {
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Cancer Herbalist',
        description: order.productName,
        order_id:    data.orderId,
        prefill: {
          name:    order.customerName,
          email:   order.email,
          contact: order.phone,
        },
        theme: { color: PRIMARY },
        handler: async (response) => {
          setRetryingPayment(true);
          try {
            // Verify payment on backend
            const vRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                productId:           order.productId,
                productName:         order.productName,
                quantity:            order.quantity,
                unitPrice:           order.unitPrice,
                orderAmount:         order.orderAmount,
                customerName:        order.customerName,
                phone:               order.phone,
                email:               order.email,
                address:             order.address,
                city:                order.city,
                state:               order.state,
                pincode:             order.pincode,
              }),
            });
            const vData = await vRes.json();
            if (!vRes.ok || !vData.success) throw new Error(vData.error || 'Payment verification failed.');

            // Success -> Reload order details
            handleVerify(contact);
          } catch (vErr) {
            setPaymentError(vErr.message);
          } finally {
            setRetryingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setRetryingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();

    } catch (err) {
      setPaymentError(err.message);
      setRetryingPayment(false);
    }
  };

  // Verification Screen
  if (!verified) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: `${PRIMARY}12`,
            color: PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 20px'
          }}>
            <FaLock />
          </div>

          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: '1.5rem', marginBottom: '8px' }}>
            Verification Required
          </h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '28px' }}>
            To view order details and access cancellation/return forms, please enter the phone number or email address used at checkout.
          </p>

          <form onSubmit={handleVerificationSubmit}>
            <input
              type="text"
              placeholder="Enter Phone Number or Email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14.5px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#f8fafc',
                marginBottom: '16px',
                textAlign: 'center'
              }}
            />

            {verifyError && (
              <p style={{ color: '#b91c1c', fontSize: '12.5px', fontWeight: 600, margin: '0 0 16px' }}>
                ⚠ {verifyError}
              </p>
            )}

            <button
              type="submit"
              disabled={verifying}
              style={{
                width: '100%',
                background: PRIMARY,
                color: '#fff',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${PRIMARY}33`
              }}
            >
              {verifying ? 'Verifying...' : 'Verify Details'}
            </button>
          </form>

          <button
            onClick={() => navigate('/store')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '13.5px',
              fontWeight: 600,
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  // Action eligibility logic
  const canCancel = ['ORDER_PLACED', 'ORDER_CONFIRMED'].includes(order.orderStatus);
  const canReturn = order.orderStatus === 'DELIVERED' && !order.returnStatus;
  const isUnpaidPrepaid = order.paymentMethod?.toLowerCase().includes('online') && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED');

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '110px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Breadcrumb / Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/my-orders')}
            style={{ background: 'transparent', border: 'none', color: PRIMARY, fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Back to My Orders
          </button>
          
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Verified Contact: <strong>{contact}</strong>
          </span>
        </div>

        {/* Unpaid Payment Retry Warning Banner */}
        {isUnpaidPrepaid && (
          <div style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FaExclamationTriangle style={{ color: '#d97706', fontSize: '24px', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#92400e', fontWeight: 800 }}>Payment Incomplete</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#b45309', lineHeight: 1.5 }}>
                  This order was registered as prepaid, but the gateway payment transaction is pending or failed. Please complete payment to confirm fulfillment.
                </p>
              </div>
            </div>
            
            <button
              onClick={handlePaymentRetry}
              disabled={retryingPayment}
              style={{
                background: '#d97706',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)'
              }}
            >
              {retryingPayment ? 'Processing...' : <><FaCreditCard /> Complete Payment</>}
            </button>
          </div>
        )}

        {paymentError && (
          <div style={{ padding: '14px 20px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
            ⚠ {paymentError}
          </div>
        )}

        {/* Order Details Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
          
          {/* Main Summary Block */}
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Standard Delivery Order
                </span>
                <h2 style={{ margin: '4px 0 6px', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                  {order.orderId}
                </h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                  Ordered on: {order.orderDate}
                </p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: order.orderStatus.includes('CANCEL') ? '#fee2e2' : '#ecfdf5',
                  color: order.orderStatus.includes('CANCEL') ? '#ef4444' : PRIMARY,
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  display: 'inline-block'
                }}>
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
                {order.paymentStatus === 'PAID' && (
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '6px 14px',
                    borderRadius: '50px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    marginLeft: '8px',
                    display: 'inline-block'
                  }}>
                    Paid Online
                  </span>
                )}
              </div>
            </div>

            {/* Sub-panels (Address & Billing Details) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              
              {/* Shipping Address card */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaMapMarkerAlt style={{ color: ACCENT }} /> Shipping Address
                </h4>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                  {order.customerName}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  {order.address}<br />
                  {order.city}, {order.state} - {order.pincode}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  📞 {order.phone} | ✉ {order.email || 'No email'}
                </p>
              </div>

              {/* Billing / Payment summary card */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCreditCard style={{ color: ACCENT }} /> Payment Summary
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', margin: '6px 0' }}>
                  <span>Method</span>
                  <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', margin: '6px 0' }}>
                  <span>Gateway Status</span>
                  <span style={{ fontWeight: 700, color: order.paymentStatus === 'PAID' ? PRIMARY : '#d97706' }}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', margin: '6px 0' }}>
                    <span>Transaction ID</span>
                    <span style={{ fontFamily: 'monospace' }}>{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '10px', fontWeight: 800, color: '#0f172a' }}>
                  <span>Amount Paid</span>
                  <span style={{ color: PRIMARY }}>₹{Number(order.orderAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaClipboardList style={{ color: ACCENT }} /> Products Ordered
              </h4>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Product Details</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Price</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>{order.productName}</strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {order.productId}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#475569' }}>
                        ₹{Number(order.unitPrice).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                        {order.quantity}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ₹{Number(order.orderAmount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons (Cancel / Return) */}
            {(canCancel || canReturn) && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>
                    Need to modify or return this order?
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                    {canCancel ? 'Cancellations are permitted prior to courier shipment.' : 'Returns can be requested within 7 days of delivery.'}
                  </p>
                </div>
                
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <FaTimesCircle /> Request Cancellation
                  </button>
                )}

                {canReturn && (
                  <button
                    onClick={() => setShowReturnModal(true)}
                    style={{
                      background: PRIMARY,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: `0 4px 10px ${PRIMARY}22`
                    }}
                  >
                    <FaUndo /> Request Product Return
                  </button>
                )}
              </div>
            )}

            {/* Return / Refund Status summary banner */}
            {(order.cancellationStatus || order.returnStatus || order.refundStatus) && (
              <div style={{
                marginTop: '24px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#334155', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaInfoCircle style={{ color: ACCENT }} /> Service Request Summaries
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
                  {order.cancellationStatus && (
                    <div>
                      <span style={{ color: '#64748b' }}>Cancellation State:</span>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{order.cancellationStatus}</strong>
                    </div>
                  )}
                  {order.returnStatus && (
                    <div>
                      <span style={{ color: '#64748b' }}>Return Shipment State:</span>
                      <strong style={{ display: 'block', color: '#0f172a' }}>{order.returnStatus}</strong>
                    </div>
                  )}
                  {order.refundStatus && (
                    <div>
                      <span style={{ color: '#64748b' }}>Refund Transaction State:</span>
                      <strong style={{ display: 'block', color: PRIMARY }}>{order.refundStatus}</strong>
                    </div>
                  )}
                  {refund && refund.paymentGatewayRefundId && (
                    <div>
                      <span style={{ color: '#64748b' }}>Refund Transaction ID:</span>
                      <strong style={{ display: 'block', color: '#0f172a', fontFamily: 'monospace' }}>{refund.paymentGatewayRefundId}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Activity Logs Timeline Block */}
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
              Full Order Activity History
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {events.slice().reverse().map((evt, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '16px',
                  position: 'relative'
                }}>
                  {/* Timeline vertical connector */}
                  {idx !== events.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '5px',
                      top: '16px',
                      bottom: '-20px',
                      width: '2px',
                      background: '#e2e8f0'
                    }} />
                  )}
                  
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: idx === 0 ? PRIMARY : '#cbd5e1',
                    border: `3px solid ${idx === 0 ? `${PRIMARY}33` : '#fff'}`,
                    zIndex: 2,
                    marginTop: '5px',
                    flexShrink: 0
                  }} />
                  
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1e293b', fontWeight: idx === 0 ? 800 : 600 }}>
                      {evt.customerMessage}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block' }}>
                      {new Date(evt.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── CANCELLATION MODAL ── */}
      <AnimatePresence>
        {showCancelModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#fff', borderRadius: '20px',
                padding: '32px', maxWidth: '440px', width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1'
              }}
            >
              <h3 style={{ margin: '0 0 12px', color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                Cancel Order
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                Please select a cancellation reason. Prepaid payments will be automatically queued for gateway refunds upon approval.
              </p>

              <form onSubmit={handleCancelSubmit}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Cancellation Reason *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', outline: 'none',
                    fontSize: '13.5px', background: '#f8fafc', marginBottom: '16px'
                  }}
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Incorrect shipping address">Incorrect shipping address</option>
                  <option value="Delayed shipping duration">Delayed shipping duration</option>
                  <option value="Other">Other</option>
                </select>

                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Additional Remarks
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain why you wish to cancel this order..."
                  value={cancelComments}
                  onChange={(e) => setCancelComments(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', outline: 'none',
                    fontSize: '13.5px', background: '#f8fafc', marginBottom: '24px',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    style={{
                      background: '#fff', border: '1.5px solid #cbd5e1',
                      padding: '10px 20px', borderRadius: '8px',
                      color: '#475569', fontWeight: 700, fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={cancelSubmitting}
                    style={{
                      background: '#ef4444', color: '#fff', border: 'none',
                      padding: '10px 20px', borderRadius: '8px',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {cancelSubmitting ? 'Requesting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RETURN MODAL ── */}
      <AnimatePresence>
        {showReturnModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '16px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#fff', borderRadius: '20px',
                padding: '32px', maxWidth: '440px', width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                border: '1px solid #cbd5e1'
              }}
            >
              <h3 style={{ margin: '0 0 12px', color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                Request Product Return
              </h3>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
                Returns must be submitted within 7 days of delivery. If approved, a reverse pickup will be scheduled.
              </p>

              <form onSubmit={handleReturnSubmit}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Return Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', outline: 'none',
                    fontSize: '13.5px', background: '#f8fafc', marginBottom: '16px'
                  }}
                >
                  <option value="Damaged / Broken packaging">Damaged / Broken packaging</option>
                  <option value="Incorrect item delivered">Incorrect item delivered</option>
                  <option value="Expired product">Expired product</option>
                  <option value="Quality issues">Quality issues</option>
                  <option value="Other">Other</option>
                </select>

                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Explanation & Details *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the issue with the medicine container in detail..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', outline: 'none',
                    fontSize: '13.5px', background: '#f8fafc', marginBottom: '24px',
                    resize: 'vertical', fontFamily: 'inherit'
                  }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    style={{
                      background: '#fff', border: '1.5px solid #cbd5e1',
                      padding: '10px 20px', borderRadius: '8px',
                      color: '#475569', fontWeight: 700, fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    style={{
                      background: PRIMARY, color: '#fff', border: 'none',
                      padding: '10px 20px', borderRadius: '8px',
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      boxShadow: `0 4px 10px ${PRIMARY}22`
                    }}
                  >
                    {returnSubmitting ? 'Requesting...' : 'Request Return'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
