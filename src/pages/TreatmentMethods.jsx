import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLeaf, FaFlask, FaUserMd, FaHeart, FaShieldAlt, FaSeedling,
  FaCalendarAlt, FaFileMedical, FaFileSignature, FaCapsules, FaUserShield,
  FaCheckCircle, FaArrowRight, FaChevronDown
} from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';

const hctFaqs = [
  { q: 'Are herbal or nutraceutical products suitable for everyone?', a: 'No. Suitability depends on ingredients, health conditions, allergies, age, current medicines and cancer treatment. Do not assume a product is safe for everyone. Discuss it with your treating oncologist or pharmacist before use.' },
  { q: 'Can herbal products replace chemotherapy, radiotherapy or other cancer treatment?', a: 'No. Cancer Herbalist products are not substitutes for cancer diagnosis or treatment. Do not stop, delay or change prescribed cancer treatment because of a supplement or product.' },
  { q: 'Can herbal products interact with cancer medicines?', a: 'Yes. Some herbs and supplements can change how medicines work or increase side effects. Share the complete ingredient list with your oncologist and pharmacist before using a product, including during chemotherapy, radiotherapy, immunotherapy, targeted therapy or surgery.' },
  { q: 'What evidence supports a botanical product?', a: 'Evidence varies by ingredient and product. Traditional use, laboratory research, animal studies and human clinical trials are not interchangeable. Ask what product-specific human evidence and quality documentation are available. We do not promise a cancer treatment outcome.' },
  { q: 'How can I understand a product before deciding?', a: 'Contact Cancer Herbalist for an in-person or telephone discussion. Ask about ingredients, intended use, directions, available documentation, limitations, contraindications and potential risks. You can then discuss the information with your treating healthcare team before deciding.' }
];

export default function TreatmentMethods() {
  const { content } = useContent();
  const [openFaq, setOpenFaq] = useState(null);

  // Load sections from context or default
  const treatmentMethodsHero = content?.treatmentMethodsHero || {};
  const treatmentMethodsPhilosophy = content?.treatmentMethodsPhilosophy || [];
  const treatmentMethodsJourney = content?.treatmentMethodsJourney || [];
  const treatmentMethodsCancers = content?.treatmentMethodsCancers || [];
  const treatmentMethodsSideEffects = content?.treatmentMethodsSideEffects || [];

  const staticPhilosophyIcons = [
    <FaLeaf key={0} />, <FaFlask key={1} />, <FaUserMd key={2} />, <FaHeart key={3} />, <FaShieldAlt key={4} />, <FaSeedling key={5} />
  ];

  const staticJourneyIcons = [
    <FaCalendarAlt key={0} />, <FaFileMedical key={1} />, <FaFileSignature key={2} />, <FaCapsules key={3} />, <FaUserShield key={4} />
  ];

  const activePhilosophy = treatmentMethodsPhilosophy.map((p, i) => ({
    ...p,
    icon: staticPhilosophyIcons[i % staticPhilosophyIcons.length]
  }));

  const activeJourney = treatmentMethodsJourney.map((step, i) => ({
    ...step,
    icon: staticJourneyIcons[i % staticJourneyIcons.length]
  }));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1a5276 50%, #0e6655 100%)', padding: '130px 20px 80px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: ACCENT, opacity: 0.08, filter: 'blur(60px)' }} />
        <span style={{ background: `${ACCENT}33`, border: `1px solid ${ACCENT}66`, color: ACCENT, padding: '8px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 600 }}>
          {treatmentMethodsHero.badge || 'Our Approach to Healing'}
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: 'Playfair Display, serif', marginTop: '20px', marginBottom: '20px' }}>
          {treatmentMethodsHero.title || 'How We Treat Cancer'} <span style={{ color: ACCENT }}>{treatmentMethodsHero.titleAccent || 'Naturally'}</span>
        </h1>
        <p style={{ maxWidth: '700px', margin: '0 auto 36px', opacity: 0.88, lineHeight: '1.8', fontSize: '1.1rem' }}>
          {treatmentMethodsHero.subline || 'Our integrative herbal oncology approach combines...'}
        </p>
      </section>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>

        {/* Philosophy */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'Playfair Display, serif', marginBottom: '12px' }}>
              Our Information <span style={{ color: ACCENT }}>Approach</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '680px', margin: '0 auto', lineHeight: '1.8' }}>
              We aim to explain product information clearly and encourage questions about evidence, limitations, safety and individual circumstances.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {activePhilosophy.map((p, i) => (
              <motion.div key={i} data-aos="fade-up" data-aos-delay={i * 80}
                whileHover={{ y: -6 }}
                style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${ACCENT}22`, transition: 'all 0.3s' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: ACCENT, marginBottom: '18px' }}>
                  {p.icon}
                </div>
                <h3 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '10px', fontSize: '1.05rem' }}>{p.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7' }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Step-by-Step Process */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'Playfair Display, serif', marginBottom: '12px' }}>
              Your Step-by-Step <span style={{ color: ACCENT }}>Information Journey</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.8' }}>
              A transparent process to help patients and caregivers understand products, limitations and possible risks.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {activeJourney.map((step, i) => (
              <motion.div key={i} data-aos="fade-up" data-aos-delay={i * 80}
                style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', gap: '24px', alignItems: 'flex-start', border: `1px solid ${ACCENT}22` }}>
                <div style={{ minWidth: '64px', height: '64px', borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff', boxShadow: `0 6px 20px ${ACCENT}44` }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: ACCENT, background: `${ACCENT}18`, padding: '2px 10px', borderRadius: '50px' }}>Step {step.num}</span>
                    <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{step.title}</h3>
                  </div>
                  <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>{step.desc}</p>
                  {step.detail && <p style={{ color: ACCENT, fontSize: '0.88rem', fontWeight: 600, background: `${ACCENT}10`, padding: '8px 14px', borderRadius: '8px', display: 'inline-block' }}>{step.detail}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What We Treat + Side Effects Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '70px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${ACCENT}22` }}>
            <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', marginBottom: '24px', fontSize: '1.4rem' }}>Cancer Types We Support</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {treatmentMethodsCancers.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '0.95rem' }}>
                  <FaCheckCircle style={{ color: ACCENT, flexShrink: 0 }} />{item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${ACCENT}22` }}>
            <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', marginBottom: '24px', fontSize: '1.4rem' }}>Topics to Discuss With Your Care Team</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {treatmentMethodsSideEffects.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '0.95rem' }}>
                  <FaCheckCircle style={{ color: ACCENT, flexShrink: 0 }} />{item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section style={{ marginBottom: '70px', marginTop: '30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'Playfair Display, serif', marginBottom: '12px', fontWeight: 800 }}>
              Frequently Asked <span style={{ color: ACCENT }}>Questions</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.8', fontSize: '0.98rem' }}>
              Common questions about product information, evidence, suitability and possible interactions.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {hctFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: isOpen ? `1.5px solid ${ACCENT}` : '1.5px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: isOpen ? `0 8px 24px ${ACCENT}15` : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      background: isOpen ? `${ACCENT}08` : 'transparent',
                      border: 'none',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      outline: 'none'
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
                      {faq.q}
                    </span>
                    <FaChevronDown
                      style={{
                        color: isOpen ? ACCENT : '#94a3b8',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div
                          style={{
                            padding: '20px 24px',
                            borderTop: '1px solid #e2e8f0',
                            color: '#475569',
                            fontSize: '0.95rem',
                            lineHeight: '1.75',
                            whiteSpace: 'pre-line'
                          }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '16px', padding: '20px 24px', marginBottom: '50px' }}>
          <p style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.7' }}>
            ⚠️ <strong>Important Disclaimer:</strong> Our botanical and nutraceutical products are not cancer treatments and must not replace or delay conventional oncology care. Herbal products can interact with medicines and may be unsuitable for some people. Always consult your oncologist before starting any complementary treatment program.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #0f3460, #1a5276)', borderRadius: '28px', padding: '56px 40px', color: '#fff' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'Playfair Display, serif', marginBottom: '16px' }}>
            Ready to Begin Your <span style={{ color: ACCENT }}>Healing Journey?</span>
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '32px', maxWidth: '540px', margin: '0 auto 32px', lineHeight: '1.8' }}>
            Book a free 30-minute discovery consultation with one of our senior herbal practitioners today.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: ACCENT,
                color: '#fff',
                padding: '16px 36px',
                borderRadius: '50px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: `0 8px 24px ${ACCENT}55`,
              }}
            >
              Book Free Consultation
            </Link>
            <Link
              to="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                padding: '16px 36px',
                borderRadius: '50px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1rem',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              View All Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}