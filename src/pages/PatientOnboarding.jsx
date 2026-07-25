import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserCheck, FaFileMedical, FaVials, FaDownload, FaPlaneDeparture,
  FaGlobe, FaCheckCircle, FaArrowRight, FaPhoneAlt, FaChevronDown,
  FaShieldAlt, FaBriefcaseMedical, FaQuestionCircle, FaClock
} from 'react-icons/fa';

const TEAL = '#0f4c5c';
const PRIMARY = '#1a6e52';
const ACCENT = '#38bed5';
const DARK = '#0a1628';

export default function PatientOnboarding() {
  const [openStep, setOpenStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: Submit Medical Records & History',
      desc: 'Gather your recent pathology, diagnostic PET/CT scans, blood panels (CBC, LFT, KFT), and list of current medications.',
      details: 'Comprehensive diagnostic records allow our pharmacology board to evaluate tumor biology, organ filtration health, and potential herb-drug interactions before your initial session.',
      checklist: [
        'Pathology & Biopsy Reports (recent within 30-60 days)',
        'Diagnostic Scan Summaries (PET-CT, MRI, Ultrasound)',
        'Blood Biomarkers (CBC, Kidney & Liver Function Tests)',
        'Full List of Current Chemotherapy/Radiation Regimens & Dosages'
      ]
    },
    {
      title: 'Step 2: Initial Clinical Consultation',
      desc: 'Participate in a 45–60 minute video or in-person consultation with senior integrative oncology practitioners.',
      details: 'We review your baseline symptoms, energy patterns, metabolic status, and establish personalized treatment goals tailored to your oncology timeline.',
      checklist: [
        'Discuss baseline fatigue, digestive status, and pain levels',
        'Review oncological treatment schedule with senior consultants',
        'Establish clear quality-of-life benchmarks and recovery targets'
      ]
    },
    {
      title: 'Step 3: Formulation & Personalized Care Plan Delivery',
      desc: 'Receive your custom-compounded Herbal Chemotherapy (HCT) kit and clinical nutrition chart within 48–72 hours.',
      details: 'Every formulation is compounded using high-purity, standardized botanical extracts engineered for maximum bio-availability and targeted cellular action.',
      checklist: [
        'Custom herbal tinctures, extracts, or botanical capsules',
        'Clear daily dosing schedule aligned with meal times',
        'Anti-inflammatory dietary chart tailored to your metabolic profile'
      ]
    },
    {
      title: 'Step 4: Regular Biomarker Monitoring & Follow-Up',
      desc: 'Track clinical progress every 4-6 weeks with follow-up blood panels and formulation adjustments.',
      details: 'As your conventional treatment changes or organ biomarkers improve, our clinical team fine-tunes your botanical dosages to ensure optimal tolerance.',
      checklist: [
        'Bi-weekly check-ins with clinical support managers',
        'Re-evaluation of blood panels every 4–6 weeks',
        'Immediate formulation updates whenever conventional therapy changes'
      ]
    }
  ];

  const resources = [
    {
      icon: <FaBriefcaseMedical />,
      title: 'Pre-Visit Consultation Checklist',
      desc: 'Download our printable clinical checklist to prepare your files and medical questions prior to your consultation.',
      actionText: 'View Checklist'
    },
    {
      icon: <FaDownload />,
      title: 'Downloadable Clinical Manuals',
      desc: 'Access PDF guidebooks on Anti-Cancer Nutrition, Herbal Chemotherapy Principles, and Herb-Drug Integration.',
      actionText: 'Download Guides (PDF)'
    },
    {
      icon: <FaPlaneDeparture />,
      title: 'Travel & Accommodations Support',
      desc: 'Clinic logistics, wheelchair access, and hotel partner discounts for patients traveling to Bangalore.',
      actionText: 'View Travel Guide'
    },
    {
      icon: <FaGlobe />,
      title: 'International Patient Care Desk',
      desc: 'Customs clearance documentation, worldwide courier shipping, and multi-timezone video consultations.',
      actionText: 'International Help'
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* ══════════ HERO SECTION ══════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #062c35 0%, #0f4c5c 50%, #1e293b 100%)',
        padding: '140px 20px 80px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: ACCENT, opacity: 0.15, filter: 'blur(90px)' }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(14, 116, 144, 0.25)',
              border: '1px solid rgba(14, 116, 144, 0.45)',
              color: '#a5f3fc',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: '13.5px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '18px'
            }}
          >
            📋 Patient Portal & Intake
          </motion.span>

          <h1 style={{
            fontSize: 'clamp(2.3rem, 5.5vw, 4rem)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 800,
            marginBottom: '20px',
            lineHeight: 1.2
          }}>
            Patient <span style={{ color: '#22d3ee' }}>Onboarding</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: '1.8',
            maxWidth: '720px',
            margin: '0 auto'
          }}>
            Welcome to Cancer Herbalist. Our streamlined 4-step onboarding journey ensures your medical files are thoroughly reviewed, your personalized plan is compounded safely, and your care team is by your side.
          </p>
        </div>
      </section>

      {/* ══════════ ONBOARDING STEPS ══════════ */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '70px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <span style={{ color: PRIMARY, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Step-by-Step Roadmap</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: DARK, marginTop: '8px' }}>
            Your Onboarding Journey
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((step, idx) => {
            const isOpen = openStep === idx;
            return (
              <motion.div
                key={idx}
                style={{
                  background: '#fff',
                  borderRadius: '24px',
                  border: isOpen ? `2px solid ${PRIMARY}` : '1.5px solid #e2e8f0',
                  boxShadow: isOpen ? '0 10px 30px rgba(26, 110, 82, 0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                <button
                  onClick={() => setOpenStep(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '28px 32px',
                    background: isOpen ? `${PRIMARY}05` : '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isOpen ? PRIMARY : `${PRIMARY}15`,
                      color: isOpen ? '#fff' : PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 style={{ color: DARK, fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', fontFamily: 'Playfair Display, serif' }}>
                        {step.title}
                      </h3>
                      <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <FaChevronDown style={{ color: PRIMARY, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ padding: '0 32px 32px', borderTop: '1px solid #f1f5f9' }}
                    >
                      <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '0.98rem', marginTop: '20px' }}>
                        {step.details}
                      </p>

                      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px 24px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: DARK, fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Checklist & Key Actions:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {step.checklist.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FaCheckCircle style={{ color: PRIMARY, fontSize: '15px', flexShrink: 0 }} />
                              <span style={{ color: '#334155', fontSize: '0.92rem' }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════ RESOURCES GRID ══════════ */}
      <section style={{ background: '#fff', padding: '80px 20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Support Services</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: DARK, marginTop: '8px' }}>
              Essential Patient Resources
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '28px' }}>
            {resources.map((res, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${PRIMARY}15`, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>
                  {res.icon}
                </div>
                <h3 style={{ color: DARK, fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px' }}>{res.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '24px', flex: 1 }}>{res.desc}</p>
                <Link
                  to="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: PRIMARY,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textDecoration: 'none'
                  }}
                >
                  {res.actionText} <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: 'linear-gradient(135deg, #0f4c5c 0%, #062c35 100%)', padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '16px' }}>
            Ready to Begin Your Care Program?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
            Book your initial clinical consultation today and let our experts guide you through every step of onboarding.
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
              boxShadow: '0 8px 25px rgba(56,190,213,0.4)'
            }}
          >
            Start Patient Onboarding <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
