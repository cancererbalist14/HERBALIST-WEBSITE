import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaHome, FaArrowLeft } from 'react-icons/fa';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: '80px', marginBottom: '24px' }}
        >
          🌿
        </motion.div>

        {/* 404 badge */}
        <div style={{ display: 'inline-block', background: `${ACCENT}18`, border: `1px solid ${ACCENT}44`, color: ACCENT, padding: '6px 18px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, marginBottom: '20px', letterSpacing: '1px' }}>
          404 — Page Not Found
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#0f172a', margin: '0 0 16px', lineHeight: 1.25 }}>
          This page seems to have <span style={{ color: PRIMARY }}>wandered off</span>
        </h1>

        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '36px' }}>
          The page you're looking for doesn't exist or may have been moved. Let us guide you back to your healing journey.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '50px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <FaArrowLeft /> Go Back
          </button>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', background: PRIMARY, color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', boxShadow: `0 4px 14px ${PRIMARY}44` }}
          >
            <FaHome /> Back to Home
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '48px', padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Popular Pages</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              { label: '🛒 Herbal Store', to: '/store' },
              { label: '📅 Book Consultation', to: '/contact' },
              { label: '👨‍⚕️ Our Consultants', to: '/doctors' },
              { label: '📖 Blog', to: '/blog' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{ padding: '8px 16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '50px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}14`; e.currentTarget.style.color = PRIMARY; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
