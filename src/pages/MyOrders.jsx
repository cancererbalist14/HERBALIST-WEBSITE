import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaClipboardList, FaSearch, FaExclamationTriangle, FaTruck, 
  FaChevronRight, FaRegCreditCard, FaCheckCircle, FaInbox 
} from 'react-icons/fa';

const PRIMARY = '#1a6e52';
const ACCENT  = '#38bed5';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupContact, setLookupContact] = useState(localStorage.getItem('last_verified_contact') || '');
  const [error, setError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Sync orders on component mount if contact exists
  useEffect(() => {
    if (lookupContact) {
      fetchOrdersForContact(lookupContact);
    } else {
      loadLocalStorageOnly();
    }
  }, []);

  const loadLocalStorageOnly = async () => {
    const savedIds = JSON.parse(localStorage.getItem('my_orders') || '[]');
    if (savedIds.length === 0) return;

    setLoading(true);
    const fetchedOrders = [];
    // Fetch details for saved IDs one by one (fallback)
    for (const orderId of savedIds.slice(0, 5)) { // Limit to 5 for efficiency
      try {
        const contactVal = localStorage.getItem('last_verified_contact') || '';
        if (contactVal) {
          const res = await fetch(`${BACKEND_URL}/api/orders/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, contact: contactVal })
          });
          const data = await res.json();
          if (data.success) {
            fetchedOrders.push(data.order);
          }
        }
      } catch (err) {
        console.warn(`Could not load cached order ${orderId}`, err);
      }
    }
    setOrders(fetchedOrders);
    setLoading(false);
  };

  const fetchOrdersForContact = async (contactVal) => {
    if (!contactVal.trim()) return;
    setLoading(true);
    setError('');
    setSyncSuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/lookup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contact: contactVal.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to retrieve orders.');
      }

      setOrders(data.orders);
      localStorage.setItem('last_verified_contact', contactVal.trim());
      
      // Update local storage IDs cache
      const savedIds = new Set(JSON.parse(localStorage.getItem('my_orders') || '[]'));
      data.orders.forEach(o => savedIds.add(o.orderId));
      localStorage.setItem('my_orders', JSON.stringify(Array.from(savedIds)));

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
      // Fallback to local storage if API call fails
      loadLocalStorageOnly();
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    fetchOrdersForContact(lookupContact);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '110px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: '#0f172a', margin: 0 }}>
              My Order <span style={{ color: PRIMARY }}>Dashboard</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '14.5px', margin: '4px 0 0' }}>
              View purchase history, live shipment tracking, and initiate return/refunds.
            </p>
          </div>
        </div>

        {/* Contact Sync Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: '32px'
        }}>
          <form onSubmit={handleLookupSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Import Past Purchases (Enter Phone or Email used at checkout)
              </label>
              <input
                type="text"
                placeholder="e.g. 9888458883 or user@gmail.com"
                value={lookupContact}
                onChange={(e) => setLookupContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#f8fafc'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: PRIMARY,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              <FaSearch /> Sync History
            </button>
          </form>

          {syncSuccess && (
            <p style={{ color: PRIMARY, fontSize: '12.5px', fontWeight: 600, margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaCheckCircle /> Purchase history synchronized successfully!
            </p>
          )}

          {error && (
            <p style={{ color: '#b91c1c', fontSize: '12.5px', fontWeight: 600, margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaExclamationTriangle /> {error}
            </p>
          )}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${PRIMARY}33`,
              borderTopColor: PRIMARY,
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, idx) => {
              const isPrepaid = order.paymentMethod?.toLowerCase().includes('online') || false;
              const isUnpaid = order.paymentStatus === 'PENDING' || order.paymentStatus === 'FAILED';
              
              return (
                <div
                  key={order.orderId}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '20px'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                        {order.orderId}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Ordered: {order.orderDate}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Payment Badge */}
                      <span style={{
                        background: isUnpaid ? '#fee2e2' : '#ecfdf5',
                        color: isUnpaid ? '#ef4444' : PRIMARY,
                        padding: '4px 10px',
                        borderRadius: '50px',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}>
                        {order.paymentStatus}
                      </span>
                      {/* Order Status Badge */}
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '50px',
                        fontSize: '11.5px',
                        fontWeight: 700
                      }}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: `${PRIMARY}12`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        <FaClipboardList />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14.5px', color: '#1e293b', fontWeight: 700 }}>
                          {order.productName}
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                          Qty: {order.quantity || 1}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Total Amount</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a', fontWeight: 800 }}>
                        ₹{Number(order.orderAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => navigate(`/track-order?orderId=${order.orderId}`)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        background: '#fff',
                        color: '#475569',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaTruck /> Track Package
                    </button>

                    <button
                      onClick={() => navigate(`/order-details/${order.orderId}`, {
                        state: { verifiedContact: lookupContact }
                      })}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: PRIMARY,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: `0 4px 10px ${PRIMARY}22`
                      }}
                    >
                      Manage Order <FaChevronRight style={{ fontSize: '10px' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            <FaInbox style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: 700 }}>No Orders Found</h3>
            <p style={{ margin: '0 auto 24px', fontSize: '13.5px', maxWidth: '400px' }}>
              We couldn&apos;t find any orders linked to your current browser cache. Enter your checkout phone or email in the box above to import them.
            </p>
            <button
              onClick={() => navigate('/store')}
              style={{
                background: PRIMARY,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Shop Herbal Medicines
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
