import React from 'react';

export default function Testimonials() {
  return (
    <main style={{ minHeight: '70vh', padding: '140px 24px 80px', background: '#f8fafc' }}>
      <section style={{ maxWidth: 850, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 'clamp(28px, 5vw, 56px)', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06)' }}>
        <p style={{ color: '#0b7285', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Patient experiences</p>
        <h1 style={{ color: '#102a43', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15 }}>Stories deserve context and care</h1>
        <p style={{ color: '#52606d', fontSize: 17, lineHeight: 1.8 }}>We are reviewing the documentation, context and permissions associated with patient stories before publishing them here.</p>
        <p style={{ color: '#52606d', fontSize: 16, lineHeight: 1.8 }}>Individual experiences are personal accounts. They are not clinical evidence and cannot establish that a herbal or nutraceutical product treats cancer, improves survival or is safe for every person. Patient outcomes vary, and a testimonial must never replace advice from a qualified oncology team.</p>
        <p style={{ color: '#52606d', fontSize: 16, lineHeight: 1.8 }}>If you would like to understand Cancer Herbalist, our products, available documentation, limitations or potential risks, please contact us for an in-person or telephone discussion.</p>
        <a href="/contact" style={{ display: 'inline-block', marginTop: 14, padding: '13px 24px', borderRadius: 30, background: '#0b7285', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Contact Cancer Herbalist</a>
      </section>
    </main>
  );
}
