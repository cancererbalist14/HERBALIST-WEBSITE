import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaTicketAlt, FaCheckCircle, FaSpinner, FaHeadset,
  FaWhatsapp, FaPhone, FaEnvelope, FaBoxOpen,
  FaExchangeAlt, FaQuestionCircle, FaShippingFast, FaLeaf
} from 'react-icons/fa';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
const ACCENT = '#38bed5';

const CATEGORIES = [
  { id: 'Order Issue',     icon: <FaBoxOpen />,       label: 'Order Issue' },
  { id: 'Shipping',        icon: <FaShippingFast />,  label: 'Shipping & Delivery' },
  { id: 'Refund',          icon: <FaExchangeAlt />,   label: 'Refund / Return' },
  { id: 'Product Query',   icon: <FaLeaf />,          label: 'Product / Treatment Query' },
  { id: 'Appointment',     icon: <FaPhone />,         label: 'Appointment Help' },
  { id: 'General',         icon: <FaQuestionCircle />,label: 'General Question' },
];

export default function Support() {
  const [params] = useSearchParams();
  const [step, setStep] = useState('form'); // 'form' | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: params.get('orderId') || '',
    category: 'General',
    subject: '',
    description: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.description) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setErrorMsg('');
    setStep('sending');

    try {
      const res = await fetch(`${BACKEND_URL}/api/zoho-desk/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create support ticket.');
      }

      setResult(data);
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    background: '#f8fafc',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Poppins, sans-serif',
    marginBottom: '16px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '6px',
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '100px' }}>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1a6e52 100%)', padding: '60px 20px', textAlign: 'center', marginBottom: '0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '8px 18px', borderRadius: '999px', fontWeight: 600, fontSize: '13px', marginBottom: '16px' }}>
          <FaHeadset /> Patient Support Centre · Powered by Zoho Desk
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: '12px' }}>
          How Can We <span style={{ color: '#7ee8fa' }}>Help You?</span>
        </h1>
        <p style={{ maxWidth: '580px', margin: '0 auto', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '1rem' }}>
          Submit a support ticket and our team will respond within 24 hours. For urgent matters, WhatsApp us directly.
        </p>

        {/* Quick Contact Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '28px' }}>
          <a href="https://wa.me/918884588835" target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25d366', color: '#fff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            <FaWhatsapp /> WhatsApp Us
          </a>
          <a href="tel:+918884588835"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <FaPhone /> Call Now
          </a>
        </div>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '36px', alignItems: 'start' }}>

        {/* ── Left: Ticket Form ── */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: `1px solid ${ACCENT}20` }}>

          {step === 'success' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', border: '3px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '36px', color: '#22c55e' }}>
                <FaCheckCircle />
              </div>
              <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '12px' }}>
                Ticket Created! 🎫
              </h2>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  🎫 <strong>Ticket Number:</strong> #{result?.ticketNumber}
                </p>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  📧 <strong>Updates sent to:</strong> {formData.email}
                </p>
                <p style={{ margin: '4px 0', color: '#475569', fontSize: '14px' }}>
                  ⏱ <strong>Expected response:</strong> Within 24 hours
                </p>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.7' }}>
                {result?.message || 'Our support team will review your query and get back to you shortly.'}
              </p>
              <button onClick={() => { setStep('form'); setFormData({ name: '', email: '', phone: '', orderId: '', category: 'General', subject: '', description: '' }); setResult(null); }}
                style={{ background: ACCENT, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                Submit Another Ticket
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '8px' }}>
                Raise a Support <span style={{ color: ACCENT }}>Ticket</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '28px', lineHeight: '1.7' }}>
                Describe your issue and we&apos;ll get back to you within 24 business hours via email.
              </p>

              {/* Category Selector */}
              <label style={labelStyle}>Issue Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                {CATEGORIES.map((cat) => {
                  const selected = formData.category === cat.id;
                  return (
                    <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                      style={{
                        padding: '12px 10px', borderRadius: '12px', border: `2px solid ${selected ? ACCENT : '#e2e8f0'}`,
                        background: selected ? `${ACCENT}15` : '#f8fafc', color: selected ? ACCENT : '#475569',
                        fontWeight: selected ? 700 : 500, fontSize: '12.5px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s',
                      }}>
                      <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} required
                      placeholder="Rahul Sharma" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                      placeholder="+91 98765 43210" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />
                  </div>
                </div>

                <label style={labelStyle}>Email Address *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required
                  placeholder="your@email.com" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                <label style={labelStyle}>Order ID (if applicable)</label>
                <input name="orderId" value={formData.orderId} onChange={handleChange}
                  placeholder="e.g. CH-1234567890" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                <label style={labelStyle}>Subject *</label>
                <input name="subject" value={formData.subject} onChange={handleChange} required
                  placeholder="Brief description of your issue" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                <label style={labelStyle}>Describe Your Issue *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required
                  rows={5} placeholder="Please describe your issue in detail. Include any relevant information like order dates, product names, or error messages..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => (e.target.style.borderColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')} />

                {(errorMsg || step === 'error') && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                    <p style={{ color: '#dc2626', fontSize: '13.5px', margin: 0 }}>⚠ {errorMsg}</p>
                  </div>
                )}

                <button type="submit" disabled={step === 'sending'}
                  style={{
                    width: '100%', background: step === 'sending' ? '#94a3b8' : ACCENT, color: '#fff',
                    border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 700,
                    cursor: step === 'sending' ? 'not-allowed' : 'pointer', fontSize: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}>
                  {step === 'sending'
                    ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Submitting Ticket…</>
                    : <><FaTicketAlt /> Submit Support Ticket</>}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Right: Info Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '110px' }}>

          {/* Response times */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: `1px solid ${ACCENT}20` }}>
            <h3 style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              ⏱ Response Times
            </h3>
            {[
              { type: 'WhatsApp / Call', time: '< 30 min', color: '#22c55e' },
              { type: 'Order Issues', time: '< 4 hours', color: ACCENT },
              { type: 'Email Tickets', time: '< 24 hours', color: '#f59e0b' },
              { type: 'Refund Queries', time: '< 48 hours', color: '#8b5cf6' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <span style={{ color: '#475569', fontSize: '13px' }}>{row.type}</span>
                <span style={{ color: row.color, fontWeight: 700, fontSize: '13px' }}>{row.time}</span>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: `1px solid ${ACCENT}20` }}>
            <h3 style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              🔗 Quick Links
            </h3>
            {[
              { label: 'Track My Order', to: '/track-order' },
              { label: 'View My Orders', to: '/my-orders' },
              { label: 'FAQs & Help Center', to: '/faqs' },
              { label: 'Refund Policy', to: '/refund-policy' },
              { label: 'Book Appointment', to: '/contact' },
            ].map((link, i) => (
              <Link key={i} to={link.to}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none', textDecoration: 'none', color: '#475569', fontSize: '13.5px', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}>
                {link.label}
                <span>→</span>
              </Link>
            ))}
          </div>

          {/* Contact card */}
          <div style={{ background: 'linear-gradient(135deg, #0f3460, #1a6e52)', borderRadius: '20px', padding: '24px', color: '#fff' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>📞 Need Urgent Help?</h3>
            <a href="https://wa.me/918884588835" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#25d366', color: '#fff', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px', marginBottom: '10px' }}>
              <FaWhatsapp /> WhatsApp: +91 88845 88835
            </a>
            <a href="mailto:cancerherbalist@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px' }}>
              <FaEnvelope style={{ color: ACCENT }} /> cancerherbalist@gmail.com
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
