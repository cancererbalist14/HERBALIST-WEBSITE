import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaLeaf, FaHeart, FaShieldAlt, FaRegLightbulb, FaUserMd,
  FaSeedling, FaFlask, FaHandHoldingHeart, FaGlobe,
  FaArrowRight, FaCheckCircle, FaQuoteLeft, FaBuilding,
  FaMicroscope, FaVials, FaBriefcase, FaGraduationCap, FaPlay
} from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';
const DARK   = '#0a1628';

export default function About() {
  const { content } = useContent();

  // Load sections from context or default
  const aboutHero = content?.aboutHero || {};
  const aboutStory = content?.aboutStory || {};
  const aboutMission = content?.aboutMission || {};
  const aboutValues = content?.aboutValues || { items: [] };
  const aboutMilestones = content?.aboutMilestones || { items: [] };
  const aboutApproach = content?.aboutApproach || { items: [] };
  const aboutVideo = content?.aboutVideo || {};

  const [isPlaying, setIsPlaying] = useState(false);

  const doctorsList = content?.doctorsList || [
    {
      id: 1,
      name: 'Prof. Ramesh Babu',
      role: 'Pharmacologist — M.Pharm, PhD',
      experience: '22 Years Clinical Experience',
      specialty: 'Integrative Pharmacology & Herbal Oncology',
      bio: 'Prof. Ramesh is a highly accomplished Pharmacologist with over two decades of dedicated practice in natural products, herbal extraction, and integrative cancer care.',
      image: '/images/doctor1.png',
    },
    {
      id: 2,
      name: 'Nutraceutical Research Team',
      role: 'Multidisciplinary Research & Clinical Care Team',
      experience: '15+ Specialists',
      specialty: 'Clinical Nutrition, Botanical Research & Patient Support',
      bio: 'Comprised of dedicated professionals from medical, research, and pharmacology backgrounds working collaboratively to deliver personalized care.',
      image: '/images/doctor33.png',
    },
  ];

  return (
    <div style={{ background: '#f8fafc', fontFamily: 'Poppins, sans-serif' }}>

      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(10,22,40,0.93) 0%, rgba(10,22,40,0.65) 55%, rgba(56,190,213,0.18) 100%)' }} />

        <div className="hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(120px, 18vw, 160px) clamp(16px, 4vw, 40px) clamp(60px, 10vw, 100px)', width: '100%', boxSizing: 'border-box' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, color: ACCENT, padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '28px' }}>
              <FaLeaf /> {aboutHero.badge || 'About Cancer Herbalist'}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', color: '#fff', lineHeight: 1.2, marginBottom: '28px', maxWidth: '760px' }}>
            {aboutHero.headline || 'Two Decades of'} <br />
            <span style={{ color: ACCENT }}>{aboutHero.headlineAccent || 'Healing Through Nature'}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ color: 'rgba(255,255,255,0.80)', fontSize: '1.15rem', lineHeight: '1.9', maxWidth: '620px', marginBottom: '40px' }}>
            {aboutHero.subline || 'Cancer Herbalist has been a trusted leader in evidence-based botanical phytotherapy and clinical nutrition support.'}
          </motion.p>
        </div>
      </section>

      {/* ══════════ STORY SECTION ══════════ */}
      <section style={{ background: '#fff', padding: 'clamp(50px, 8vw, 100px) 20px' }}>
        <div className="about-story-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
          {/* Image side */}
          <motion.div data-aos="fade-right" style={{ position: 'relative', paddingBottom: '60px', paddingRight: '28px' }}>
            <img
              src={aboutStory.founderImage || '/images/doctor1.png'}
              alt={aboutStory.founderQuoteAuthor || 'Prof Ramesh Babu — Founder, Cancer Herbalist'}
              className="founder-img"
              style={{
                width: '100%',
                borderRadius: '28px',
                boxShadow: '0 24px 64px rgba(56,190,213,0.18)',
                display: 'block',
                position: 'relative',
                zIndex: 1,
                objectFit: 'cover',
                maxHeight: '520px',
              }}
            />

            {/* Quote card overlay */}
            <div className="quote-card" style={{
              position: 'absolute', bottom: '-32px', right: '-20px',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '20px',
              padding: '24px 28px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
              maxWidth: '290px',
              border: `1px solid ${ACCENT}22`,
              zIndex: 2,
            }}>
              <FaQuoteLeft style={{ color: ACCENT, fontSize: '24px', marginBottom: '12px' }} />
              <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.75', fontStyle: 'italic', margin: 0, fontFamily: 'Playfair Display, serif' }}>
                &ldquo;{aboutStory.founderQuote || 'Nature holds the answers when paired with rigorous pharmacology science.'}&rdquo;
              </p>
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '2px', background: ACCENT, borderRadius: '2px' }} />
                <p style={{ color: ACCENT, fontWeight: 700, fontSize: '12.5px', margin: 0, letterSpacing: '0.3px' }}>
                  {aboutStory.founderQuoteAuthor || 'Prof Ramesh Babu, Founder'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div data-aos="fade-left">
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {aboutStory.badge || 'Our Story'}
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: DARK, marginTop: '12px', marginBottom: '24px', lineHeight: 1.25 }}>
              A Mission Born from <span style={{ color: ACCENT }}>Compassion</span>
            </h2>
            {(aboutStory.paragraphs || [
              'Founded with a mission to bridge natural botanical therapies and modern oncology science, Cancer Herbalist provides personalized care for patients across the globe.',
              'Our formulations are compounded based on published cellular research, ensuring maximum bio-availability and safety alongside standard oncology treatments.'
            ]).map((p, i) => (
              <p key={i} style={{ color: '#475569', lineHeight: '1.9', fontSize: '1rem', marginBottom: '18px' }}>
                {p}
              </p>
            ))}

            {/* Key differentiators */}
            {(aboutStory.highlights || [
              'Standardized bio-active phytotherapy compounds',
              'Collaborative care alongside primary oncology',
              'Comprehensive organ safety and laboratory audits'
            ]).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <FaCheckCircle style={{ color: ACCENT, flexShrink: 0, marginTop: '3px', fontSize: '16px' }} />
                <span style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════ MISSION + VISION ══════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 50%, #0e6655 100%)', padding: 'clamp(50px, 8vw, 100px) 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', marginBottom: '16px' }}>
              Mission & <span style={{ color: ACCENT }}>Vision</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '560px', margin: '0 auto', lineHeight: '1.8' }}>
              Two guiding stars that shape every formulation and consultation we deliver.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '32px' }}>
            {/* Mission */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ACCENT}33`, borderRadius: '28px', padding: '44px 40px', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: ACCENT, borderRadius: '4px 0 0 4px' }} />
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${ACCENT}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: ACCENT, marginBottom: '24px' }}>
                <FaHeart />
              </div>
              <h3 style={{ color: '#fff', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '18px' }}>Our Mission</h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: '1.9', fontSize: '1rem' }}>
                {aboutMission.missionText || 'To provide safe, personalized, evidence-based herbal support that enhances quality of life and works synergistically alongside oncology care.'}
              </p>
            </div>

            {/* Vision */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${ACCENT}33`, borderRadius: '28px', padding: '44px 40px', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981', borderRadius: '4px 0 0 4px' }} />
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#10b981', marginBottom: '24px' }}>
                <FaGlobe />
              </div>
              <h3 style={{ color: '#fff', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '18px' }}>Our Vision</h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: '1.9', fontSize: '1rem' }}>
                {aboutMission.visionText || 'A world where every cancer patient has access to standardized, scientific natural medicine to support their healing journey.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ OUR PHILOSOPHY ══════════ */}
      <section style={{ background: '#f8fafc', padding: 'clamp(50px, 8vw, 100px) 20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ color: PRIMARY, fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Core Principles
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: DARK, marginTop: '12px', marginBottom: '16px' }}>
              Our <span style={{ color: PRIMARY }}>Philosophy</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1rem' }}>
              We believe in combining ancient botanical wisdom with modern evidence-based pharmacological research.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '28px' }}>
            {[
              {
                icon: <FaSeedling />,
                title: 'Evidence-Based Phytotherapy',
                desc: 'Every herb and botanical compound we use is backed by cellular research, pharmacological studies, and standardized active ingredients.'
              },
              {
                icon: <FaShieldAlt />,
                title: 'Synergy with Modern Care',
                desc: 'We do not replace conventional treatments; our integrative protocols work alongside chemotherapy, radiation, and surgery to support organ resilience.'
              },
              {
                icon: <FaHandHoldingHeart />,
                title: 'Holistic Patient-Centricity',
                desc: 'Cancer care extends beyond tumor targeted care — we focus on appetite support, vitality, cellular detox, and total quality of life.'
              },
              {
                icon: <FaFlask />,
                title: 'Safety & Quality Audits',
                desc: 'Strict quality control, heavy metal screening, and purity testing ensure zero contamination across all our herbal formulations.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: `${PRIMARY}12`,
                  color: PRIMARY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '20px'
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: DARK, margin: '0 0 12px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.93rem', lineHeight: '1.7', margin: 0 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ OUR TEAM SECTION (MOVED INSIDE ABOUT US) ══════════ */}
      <section id="our-team" style={{ background: '#fff', padding: 'clamp(60px, 8vw, 100px) 20px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ color: PRIMARY, fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Clinical Expertise
            </span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: DARK, marginTop: '12px', marginBottom: '16px' }}>
              Meet Our Expert <span style={{ color: PRIMARY }}>Clinical Team</span>
            </h2>
            <p style={{ color: '#64748b', maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1rem' }}>
              Our multidisciplinary team of pharmacologists, medical practitioners, and research specialists is dedicated to personalized cancer support.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '32px' }}>
            {doctorsList.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ y: -8 }}
                style={{
                  background: '#f8fafc',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '320px', overflow: 'hidden' }}>
                  <img
                    src={doc.image}
                    alt={doc.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: DARK, margin: '0 0 6px' }}>
                    {doc.name}
                  </h3>
                  <div style={{ color: PRIMARY, fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>
                    {doc.role}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.93rem', lineHeight: '1.7', marginBottom: '24px', flex: 1 }}>
                    {doc.bio}
                  </p>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <FaBriefcase style={{ color: PRIMARY }} />
                    <span>{doc.specialty}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WATCH OUR STORY VIDEO SECTION (AT THE END) ══════════ */}
      <section style={{ padding: '80px 20px', background: DARK, position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: ACCENT, fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '12px' }}>
            🎬 Watch Our Story
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', marginBottom: '20px' }}>
            {aboutVideo.title || 'Healing Through Nature & Science'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '640px', margin: '0 auto 40px', lineHeight: '1.8', fontSize: '1rem' }}>
            {aboutVideo.description || 'Watch our documentary to see how we blend traditional phytotherapy with modern clinical oncology research to support patients worldwide.'}
          </p>

          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            border: `1px solid ${ACCENT}33`,
            aspectRatio: '16 / 9',
            maxWidth: '900px',
            margin: '0 auto',
            background: '#000'
          }}>
            {!isPlaying ? (
              <div
                onClick={() => setIsPlaying(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  backgroundImage: aboutVideo.thumbnailUrl ? `url(${aboutVideo.thumbnailUrl})` : 'linear-gradient(135deg, #0e6655 0%, #0a1628 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: ACCENT,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  zIndex: 2,
                  boxShadow: '0 12px 32px rgba(56,190,213,0.5)',
                  paddingLeft: '4px',
                  transition: 'transform 0.3s ease'
                }}>
                  <FaPlay />
                </div>
              </div>
            ) : (
              <video
                src={aboutVideo.videoUrl || '/cancer-herbalist.mp4'}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-story-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}