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
  {
    q: 'Is everyone eligible for Herbal Chemotherapy?',
    a: 'Yes, everyone is eligible for Herbal Chemotherapy. Since it utilizes safe, non-toxic, and premium standardized botanical extracts tailored to each patient’s specific pathology and organ filtration capacity, it is suitable for individuals of all ages and health conditions.'
  },
  {
    q: 'Is there a recovery time required for Herbal Chemotherapy?',
    a: 'No recovery time is required as there are no serious side effects from Herbal Chemotherapy. Unlike conventional cytotoxic chemotherapy, HCT is gentle on the body and does not cause systemic toxicity, hair loss, or organ strain, allowing patients to maintain their daily routine.'
  },
  {
    q: 'Is preparation required before starting Herbal Chemotherapy?',
    a: 'No preparation is required. You can start Herbal Chemotherapy at the earliest. Our medical and pharmacological team only requires a review of your recent blood panels, diagnostic scans, and current conventional medication list to screen for drug-herb interactions and personalize your formula.'
  },
  {
    q: 'Are all types of cancers eligible for Herbal Chemotherapy?',
    a: 'Yes, all types of cancers are eligible for Herbal Chemotherapy. Our protocols are customized to address various malignancies, including breast, lung, colon, prostate, liver, blood, and rare or advanced stage cancers, supporting the body’s healing response.'
  },
  {
    q: 'What are the key differences between HCT and conventional therapies (Ocean of differences)?',
    a: 'There is an ocean of differences. Few key comparisons:\na. HCT works on non-dividing cancer cells.\nb. HCT works on metastasized cancer cells too.\nc. HCT works on CCC (Circulating Cancer Cells) too.\nd. HCT works on CSC (Cancer Stem Cells) too.\nFor complete differences, please visit the last page of our English yellow brochure.'
  }
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
              Our Treatment <span style={{ color: ACCENT }}>Philosophy</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '680px', margin: '0 auto', lineHeight: '1.8' }}>
              We believe healing is multidimensional. Our six core pillars guide every decision we make for every patient we serve.
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
              Your Step-by-Step <span style={{ color: ACCENT }}>Treatment Journey</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '640px', margin: '0 auto', lineHeight: '1.8' }}>
              A structured, professional five-step methodology to ensure personalized, safe, and effective herbal cancer support.
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
            <h2 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', marginBottom: '24px', fontSize: '1.4rem' }}>Side Effects We Address</h2>
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
              Common questions about eligibility, recovery, and the unique mechanisms of Herbal Chemotherapy (HCT).
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
            ⚠️ <strong>Important Disclaimer:</strong> Our herbal support programs are complementary therapies designed to work alongside, not replace, conventional oncology treatment. All herbal protocols are reviewed for safety and drug-herb interactions. Always consult your oncologist before starting any complementary treatment program.
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