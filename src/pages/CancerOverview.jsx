import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDna, FaMicroscope, FaExclamationTriangle, FaStethoscope,
  FaShieldAlt, FaQuestionCircle, FaChevronDown, FaArrowRight,
  FaCapsules, FaRadiation, FaUserMd, FaHeartbeat, FaLeaf,
  FaCheckCircle, FaFlask, FaVials, FaAppleAlt
} from 'react-icons/fa';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';
const DARK = '#0a1628';

export default function CancerOverview() {
  const [activeTab, setActiveTab] = useState('what-is-cancer');
  const [openFaq, setOpenFaq] = useState(null);

  const tabs = [
    { id: 'what-is-cancer', label: 'What is Cancer', icon: <FaDna /> },
    { id: 'symptoms', label: 'Symptoms & Red Flags', icon: <FaExclamationTriangle /> },
    { id: 'treatments', label: 'Conventional Treatments', icon: <FaStethoscope /> },
    { id: 'risk-factors', label: 'Risk Factors', icon: <FaShieldAlt /> },
    { id: 'faqs', label: 'Patient FAQs', icon: <FaQuestionCircle /> },
  ];

  const faqs = [
    {
      q: 'How does cancer originate at the cellular level?',
      a: 'Cancer begins when normal cellular DNA undergoes genetic mutations or epigenetic changes that disrupt normal cell growth control. Instead of undergoing natural cell death (apoptosis), damaged cells replicate uncontrollably, forming abnormal tissue masses called tumors or proliferating through the bloodstream.'
    },
    {
      q: 'What is the difference between benign and malignant tumors?',
      a: 'Benign tumors are non-cancerous growth clusters that remain localized and do not invade neighboring tissue or metastasize to distant organs. Malignant tumors are cancerous cells that can infiltrate surrounding healthy tissues, enter lymphatic or blood vessels, and spread (metastasize) throughout the body.'
    },
    {
      q: 'Can integrative herbal therapy replace conventional cancer treatments?',
      a: 'Our integrative herbal protocols are designed to complement—not replace—standard oncological treatments like chemotherapy, radiation, or surgery. Herbal Chemotherapy (HCT) and clinical nutrition help mitigate side effects, optimize organ function, and support overall cellular resilience during treatment.'
    },
    {
      q: 'Why are early warning signs so crucial in cancer diagnosis?',
      a: 'Detecting cancer at an early stage (Stage I or II) before it metastasizes significantly increases treatment efficacy and long-term survival rates. Recognizing subtle persistent symptoms allows consultants to perform diagnostic imaging and biopsies promptly.'
    },
    {
      q: 'How do lifestyle factors influence cancer development?',
      a: 'According to oncology research, up to 40–50% of cancer cases are linked to modifiable lifestyle factors, including chronic metabolic inflammation, tobacco smoke, high sugar diets leading to hyperinsulinemia, environmental toxins, and chronic stress.'
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* ══════════ HERO SECTION ══════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a6e52 50%, #0e6655 100%)',
        padding: '140px 20px 80px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: ACCENT, opacity: 0.15, filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: '#10b981', opacity: 0.1, filter: 'blur(80px)' }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `${ACCENT}22`,
              border: `1px solid ${ACCENT}55`,
              color: ACCENT,
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '18px'
            }}
          >
            🧬 Medical Knowledge Center
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.3rem, 5.5vw, 4rem)',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 800,
              marginBottom: '20px',
              lineHeight: 1.2
            }}
          >
            Cancer <span style={{ color: ACCENT }}>Overview</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.8',
              maxWidth: '720px',
              margin: '0 auto'
            }}
          >
            A comprehensive, evidence-based guide to understanding cellular biology, recognizing early symptoms, evaluating conventional treatments, identifying key risk factors, and navigating FAQs.
          </motion.p>
        </div>
      </section>

      {/* ══════════ NAVIGATION TABS ══════════ */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        sticky: 'top',
        position: 'sticky',
        top: '70px',
        zIndex: 90,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '18px 22px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${PRIMARY}` : '3px solid transparent',
                  color: isActive ? PRIMARY : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px', color: isActive ? PRIMARY : '#94a3b8' }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ TAB CONTENT AREA ══════════ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* 1. WHAT IS CANCER */}
        {activeTab === 'what-is-cancer' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              marginBottom: '40px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${PRIMARY}15`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  <FaDna />
                </div>
                <div>
                  <span style={{ color: ACCENT, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cellular Biology</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
                    What is Cancer?
                  </h2>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.9', fontSize: '1.02rem', marginBottom: '24px' }}>
                At its core, <strong>cancer</strong> is a complex metabolic and genetic condition characterized by the uncontrolled division, proliferation, and survival of abnormal cells. In a healthy human body, cells constantly grow, divide, and die through a carefully orchestrated process called <em>apoptosis</em> (programmed cell death).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px', margin: '32px 0' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: PRIMARY, fontSize: '24px', marginBottom: '12px' }}><FaMicroscope /></div>
                  <h4 style={{ color: DARK, fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>1. Genetic Mutation</h4>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
                    DNA mutations alter cellular signals, causing cells to bypass growth checkpoints and resist natural death instructions.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: ACCENT, fontSize: '24px', marginBottom: '12px' }}><FaVials /></div>
                  <h4 style={{ color: DARK, fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>2. Tumor Formation</h4>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
                    Replicating cells aggregate into localized masses called primary tumors, demanding blood supply via angiogenesis.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#e11d48', fontSize: '24px', marginBottom: '12px' }}><FaHeartbeat /></div>
                  <h4 style={{ color: DARK, fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>3. Metastasis</h4>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
                    Malignant cells break away, travel via bloodstream or lymphatic fluid, and colonize secondary organ sites.
                  </p>
                </div>
              </div>

              <div style={{ background: '#f0fdfe', borderLeft: `4px solid ${ACCENT}`, borderRadius: '12px', padding: '20px 24px', marginTop: '32px' }}>
                <h4 style={{ color: DARK, fontWeight: 700, margin: '0 0 6px', fontSize: '1rem' }}>💡 Benign vs. Malignant Tumors</h4>
                <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: '1.7', margin: 0 }}>
                  <strong>Benign tumors</strong> stay within their local tissue envelope and do not invade distant tissue. <strong>Malignant tumors</strong> aggressively infiltrate neighboring structures and possess metastatic capacity.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. SYMPTOMS & RED FLAGS */}
        {activeTab === 'symptoms' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  <FaExclamationTriangle />
                </div>
                <div>
                  <span style={{ color: '#e11d48', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Early Identification</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
                    Cancer Symptoms & Warning Signs
                  </h2>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', marginBottom: '32px' }}>
                Symptoms vary significantly depending on tumor location and stage. While many symptoms can stem from non-cancerous conditions, persistent indicators lasting over 2–3 weeks require medical examination.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '24px' }}>
                {[
                  { title: 'Systemic / Body-Wide Signs', items: ['Unexplained weight loss (5kg+ without effort)', 'Persistent, overwhelming fatigue', 'Unexplained fever or night sweats', 'Chronic low blood counts (anemia)'] },
                  { title: 'Localized Physical Changes', items: ['Firm, non-tender lumps in breast, neck, or groin', 'Persistent cough or hoarseness (> 3 weeks)', 'Changes in skin moles or non-healing sores', 'Difficulty swallowing or chronic indigestion'] },
                  { title: 'Excretory & Digestive Indicators', items: ['Unusual bleeding or discharge (urine, stool, phlegm)', 'Persistent changes in bowel habits (constipation/diarrhea)', 'Unexplained pain in bones, joints, or abdominal region', 'Abdominal bloating or rapid feeling of fullness'] }
                ].map((cat, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: DARK, fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
                      {cat.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cat.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <FaCheckCircle style={{ color: PRIMARY, flexShrink: 0, marginTop: '4px', fontSize: '14px' }} />
                          <span style={{ color: '#475569', fontSize: '0.93rem', lineHeight: '1.6' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. CONVENTIONAL TREATMENTS */}
        {activeTab === 'treatments' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${PRIMARY}15`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  <FaStethoscope />
                </div>
                <div>
                  <span style={{ color: PRIMARY, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Oncology Care</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
                    Conventional Cancer Treatments
                  </h2>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', marginBottom: '32px' }}>
                Modern oncology utilizes multimodal treatment strategies depending on the tumor type, stage, genetic biomarkers, and overall patient fitness.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
                {[
                  { icon: <FaCapsules />, title: 'Chemotherapy', desc: 'Systemic cytotoxic medications designed to eliminate rapidly dividing cancer cells. May cause collateral fatigue, hair loss, or low blood counts.' },
                  { icon: <FaRadiation />, title: 'Radiation Therapy', desc: 'High-energy ionizing beams targeted precisely to destroy malignant cell DNA and shrink tumors in localized regions.' },
                  { icon: <FaUserMd />, title: 'Surgical Resection', desc: 'Operative removal of primary solid tumor mass along with surrounding safety margins and nearby sentinel lymph nodes.' },
                  { icon: <FaShieldAlt />, title: 'Immunotherapy', desc: 'Biologic agents (such as checkpoint inhibitors) that unmask cancer cells, allowing the patient\'s immune system to attack tumors.' },
                  { icon: <FaFlask />, title: 'Targeted Therapy', desc: 'Drugs tailored to specific molecular targets (e.g., EGFR, HER2) that block tumor growth signals while sparing healthy cells.' }
                ].map((t, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${ACCENT}22`, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>
                      {t.icon}
                    </div>
                    <h3 style={{ color: DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>{t.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. RISK FACTORS */}
        {activeTab === 'risk-factors' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  <FaShieldAlt />
                </div>
                <div>
                  <span style={{ color: '#d97706', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prevention & Etiology</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
                    Cancer Risk Factors
                  </h2>
                </div>
              </div>

              <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', marginBottom: '32px' }}>
                While some risk factors like age and genetics are non-modifiable, lifestyle and environmental modifications can significantly lower overall risk profiles.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
                {[
                  { title: 'Genetic & Hereditary Drivers', desc: 'Inherited mutations in suppressor genes (e.g., BRCA1/2, Lynch Syndrome) increase baseline susceptibility for specific cancer types.' },
                  { title: 'Lifestyle & Dietary Influences', desc: 'Diets rich in ultra-processed foods, refined sugars, tobacco consumption, heavy alcohol intake, and sedentary habits.' },
                  { title: 'Environmental & Occupational Carcinogens', desc: 'Prolonged exposure to radiation, heavy metals, asbestos, industrial solvents, and urban airborne pollutants.' },
                  { title: 'Chronic Metabolic Inflammation', desc: 'Persistent systemic low-grade inflammation, insulin resistance, and oxidative stress damage DNA and impair immune surveillance.' }
                ].map((rf, i) => (
                  <div key={i} style={{ background: '#fffbeb', borderRadius: '20px', padding: '28px', border: '1px solid #fde68a' }}>
                    <h3 style={{ color: '#92400e', fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px' }}>{rf.title}</h3>
                    <p style={{ color: '#78350f', fontSize: '0.93rem', lineHeight: '1.7', margin: 0 }}>{rf.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. FAQS */}
        {activeTab === 'faqs' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: 'clamp(28px, 5vw, 48px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${PRIMARY}15`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  <FaQuestionCircle />
                </div>
                <div>
                  <span style={{ color: PRIMARY, fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Patient Guidance</span>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
                    Frequently Asked Questions
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={i}
                      style={{
                        borderRadius: '16px',
                        border: isOpen ? `2px solid ${PRIMARY}` : '1px solid #e2e8f0',
                        overflow: 'hidden',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          background: isOpen ? `${PRIMARY}08` : '#f8fafc',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit'
                        }}
                      >
                        <span style={{ color: DARK, fontWeight: 700, fontSize: '1.02rem' }}>{faq.q}</span>
                        <FaChevronDown style={{ color: PRIMARY, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ padding: '20px 24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}
                          >
                            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.95rem', margin: 0 }}>{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* CTA FOOTER BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #1a6e52 0%, #0d3b2e 100%)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '16px' }}>
            Need Personalized Guidance for Your Condition?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
            Our team of pharma experts, pharmacologists, and nutritionists is ready to review your health reports and suggest a personalized nutraceutical supplement protocol.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: ACCENT,
              color: '#fff',
              padding: '16px 36px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(56,190,213,0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            Schedule Consultation <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
