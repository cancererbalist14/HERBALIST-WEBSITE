import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLeaf, FaArrowLeft } from 'react-icons/fa';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '36px' }}>
    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px', borderLeft: `4px solid ${ACCENT}`, paddingLeft: '12px' }}>
      {title}
    </h2>
    <div style={{ color: '#475569', lineHeight: '1.85', fontSize: '14.5px' }}>
      {children}
    </div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 100%)`, padding: '120px 20px 60px', textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${ACCENT}33`, border: `2px solid ${ACCENT}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px', color: ACCENT }}>
          <FaShieldAlt />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '0 0 12px' }}>
          Privacy Policy
        </h1>
        <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>Last updated: June 2026</p>
      </section>

      {/* Body */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 20px 80px' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: PRIMARY, fontWeight: 600, fontSize: '13px', textDecoration: 'none', marginBottom: '40px' }}>
          <FaArrowLeft fontSize="11px" /> Back to Home
        </Link>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0' }}>

          <p style={{ color: '#64748b', lineHeight: '1.85', fontSize: '14.5px', marginBottom: '36px', padding: '16px 20px', background: '#f1f5f9', borderRadius: '10px', borderLeft: `4px solid ${ACCENT}` }}>
            Cancer Herbalist (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you visit our website or use our services.
          </p>

          <Section title="1. Information We Collect">
            <p>We collect information you provide directly to us, including:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Contact Information:</strong> Name, email address, phone number</li>
              <li><strong>Health Information:</strong> Cancer type, stage, and treatment queries (provided voluntarily for consultation purposes)</li>
              <li><strong>Order Information:</strong> Shipping address, city, state, pincode for product delivery</li>
              <li><strong>Usage Data:</strong> Pages visited, browser type, device type (collected automatically via analytics)</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>To process your product orders and coordinate delivery</li>
              <li>To confirm and manage appointment bookings</li>
              <li>To send consultation confirmation emails and follow-ups</li>
              <li>To respond to your enquiries and provide support</li>
              <li>To improve our website and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing & Third Parties">
            <p>We do <strong>not</strong> sell or rent your personal data. We may share information with:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>EmailJS:</strong> For sending appointment confirmation emails</li>
              <li><strong>Google Sheets (via Apps Script):</strong> For secure order record-keeping</li>
              <li><strong>WhatsApp / Shiprocket:</strong> For order fulfillment and communication</li>
            </ul>
            <p style={{ marginTop: '12px' }}>All third-party services are bound by their own privacy policies.</p>
          </Section>

          <Section title="4. Health Information Disclaimer">
            <p>Any health-related information you share with us is used <strong>solely for the purpose of providing herbal consultation and product recommendations</strong>. We treat all health data with strict confidentiality. We do not share your health details with any third parties without your explicit consent.</p>
          </Section>

          <Section title="5. Cookies">
            <p>Our website may use cookies and similar technologies to improve user experience and collect analytics data. You can disable cookies through your browser settings. Core site functionality will still work without cookies.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Order records are retained for a minimum of 3 years for accounting purposes.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p style={{ marginTop: '12px' }}>To exercise any of these rights, please contact us at <a href="mailto:cancerherbalist@gmail.com" style={{ color: ACCENT }}>cancerherbalist@gmail.com</a></p>
          </Section>

          <Section title="8. Security">
            <p>We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no method of internet transmission is 100% secure.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with a revised &quot;Last updated&quot; date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have questions about this Privacy Policy, please contact:</p>
            <div style={{ marginTop: '12px', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '4px 0' }}><strong>Cancer Herbalist</strong></p>
              <p style={{ margin: '4px 0' }}>Agara Main Road, Kaggalipura Post, Off Kanakapura Road, Bangalore 560116</p>
              <p style={{ margin: '4px 0' }}>📞 <a href="tel:+918884588835" style={{ color: ACCENT }}>+91 88845 88835</a></p>
              <p style={{ margin: '4px 0' }}>✉️ <a href="mailto:cancerherbalist@gmail.com" style={{ color: ACCENT }}>cancerherbalist@gmail.com</a></p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
