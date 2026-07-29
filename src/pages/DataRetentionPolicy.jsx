import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaDatabase } from 'react-icons/fa';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

export default function DataRetentionPolicy() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 100%)`, padding: '130px 20px 60px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${ACCENT}33`, border: `2px solid ${ACCENT}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px', color: ACCENT }}>
          <FaDatabase />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '0 0 12px' }}>
          Data Deletion &amp; Retention Policy
        </h1>
        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>How We Protect, Store, and Delete Your Data</p>
      </section>

      {/* BODY */}
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 20px 80px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: PRIMARY, fontWeight: 600, fontSize: '13px', textDecoration: 'none', marginBottom: '32px' }}>
          <FaArrowLeft style={{ fontSize: '11px' }} /> Back to Home
        </Link>

        <div style={{ background: '#fff', borderRadius: '24px', padding: 'clamp(24px, 5vw, 44px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: '#475569', lineHeight: '1.85', fontSize: '14.5px' }}>
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px' }}>
                1. Data Retention Overview
              </h3>
              <p>
                Cancer Herbalist maintains patient and customer data strictly for the time necessary to fulfill health consultations, process product shipments, and satisfy accounting, tax, or statutory reporting obligations.
              </p>
            </div>

            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px' }}>
                2. Retention Schedules
              </h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Consultation &amp; Health Summaries:</strong> Retained for 3 years to maintain care continuity for returning patients.</li>
                <li><strong>Product Purchase &amp; Delivery Records:</strong> Retained for 3 years in compliance with tax and financial record-keeping laws.</li>
                <li><strong>Newsletter &amp; Communication Preferences:</strong> Retained until an explicit unsubscribe or deletion request is received.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px' }}>
                3. Your Right to Data Erasure (Right to be Forgotten)
              </h3>
              <p>
                You possess the full right to request the permanent deletion of your personal contact records, consultation history, and submitted medical files from our primary databases.
              </p>
            </div>

            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px' }}>
                4. How to Request Data Deletion
              </h3>
              <p>
                To request permanent erasure of your data, please send an email to <a href="mailto:cancerherbalist@gmail.com" style={{ color: ACCENT, fontWeight: 600 }}>cancerherbalist@gmail.com</a> with the subject line <strong>&quot;Data Deletion Request&quot;</strong>. Include your full name, registered email address, and phone number. Our privacy officer will process your request within 7 business days and send a formal confirmation of erasure.
              </p>
            </div>

            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px' }}>
                5. Security Safeguards
              </h3>
              <p>
                All stored patient data is encrypted in transit and at rest using industry-standard AES-256 encryption. Access is restricted exclusively to authorized clinical personnel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
