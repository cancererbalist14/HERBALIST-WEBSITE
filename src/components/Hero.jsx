import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLeaf, FaPlay, FaArrowRight, FaCheckCircle,
  FaClock, FaFlask, FaShieldAlt, FaHandHoldingHeart,
  FaChevronLeft, FaChevronRight, FaUserMd, FaStar
} from 'react-icons/fa';

import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

/* ─── Slide Data ─────────────────────────────────────── */
const CANCER_TYPES = [
  'Breast','Lung','Colon','Prostate','Liver','Blood',
  'Cervical','Ovarian','Pancreatic','Thyroid','Bladder',
  'Kidney','Brain','Skin / Melanoma','Bone','Oral',
  'Oesophageal','Uterine','Lymphoma','Myeloma',
  'Testicular','Rectal','Gallbladder','Stomach',
];

const slides = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #f0fbfd 0%, #e0f7fa 60%, #f8fafc 100%)',
    accentColor: ACCENT,
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 60%, #eff6ff 100%)',
    accentColor: '#2563eb',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 60%, #fdf4ff 100%)',
    accentColor: '#db2777',
    cancerTicker: true,
  },
  {
    id: 4,
    bg: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 60%, #f5f3ff 100%)',
    accentColor: '#7c3aed',
  },
  {
    id: 5,
    bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 60%, #fff7ed 100%)',
    accentColor: '#ea580c',
  },
  {
    id: 6,
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fffdf0 100%)',
    accentColor: '#d97706',
  },
];

/* ─── Slide transition variants ──────────────────────── */
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
};

export default function Hero() {
  const { content } = useContent();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const dynamicSlides = (content?.heroSlides || []).map((ds, idx) => {
    const staticSlide = slides[idx] || slides[0];
    const headlineWords = ds.headline ? ds.headline.split(', ') : ['Fight Cancer', 'Holistically'];
    return {
      id: ds.id || idx + 1,
      bg: staticSlide.bg,
      accentColor: staticSlide.accentColor,
      badge: ds.badge,
      headline: headlineWords,
      headlineAccent: ds.headlineAccent,
      subline: ds.subline,
      highlights: ds.highlights || [],
      stat: { value: ds.statValue, label: ds.statLabel },
      cta: { label: ds.ctaLabel, href: ds.ctaHref },
      secondaryCta: { label: ds.secondaryCtaLabel, href: ds.secondaryCtaHref },
      cancerTicker: staticSlide.cancerTicker || false,
    };
  });

  const activeSlides = dynamicSlides.length > 0 ? dynamicSlides : [];

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const goTo = useCallback((idx, dir = 1) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    if (activeSlides.length === 0) return;
    goTo((current + 1) % activeSlides.length, 1);
  }, [current, goTo, activeSlides.length]);

  const prev = useCallback(() => {
    if (activeSlides.length === 0) return;
    goTo((current - 1 + activeSlides.length) % activeSlides.length, -1);
  }, [current, goTo, activeSlides.length]);

  // Auto-advance every 8s — always on
  useEffect(() => {
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [next]);

  const slide = activeSlides[current] || {};

  return (
    <section
      id="home"
      style={{
        minHeight: isMobile ? 'auto' : 'min(82vh, 760px)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: isMobile ? '90px' : '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* ── Animated background ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'absolute', inset: 0, background: slide.bg, zIndex: 0 }}
        />
      </AnimatePresence>

      {/* Floating leaves (decorative) */}
      {!isMobile && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i}
              animate={{ y: [-20, 20, -20], rotate: [0, 180, 360], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
              style={{ position: 'absolute', left: `${(i * 17) % 100}%`, top: `${(i * 13) % 100}%`, color: slide.accentColor, fontSize: `${10 + i * 3}px` }}
            >
              <FaLeaf />
            </motion.div>
          ))}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${slide.accentColor}08 1px, transparent 1px), linear-gradient(90deg, ${slide.accentColor}08 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        </div>
      )}

      {/* ── Slide Content ── */}
      <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '24px', paddingBottom: '48px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero-slide-content"
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'center' }}
          >
            {/* LEFT — Text */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${slide.accentColor}18`, border: `1px solid ${slide.accentColor}30`, color: slide.accentColor, padding: '6px 14px', borderRadius: '50px', fontSize: '12.5px', fontWeight: '700', marginBottom: '16px' }}>
                {slide.badge}
              </div>

              {/* Headline */}
              <h1 style={{ fontSize: 'clamp(28px, 3.8vw, 44px)', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', marginBottom: '14px' }}>
                {slide.headline.map((line, li) => (
                  <span key={li} style={{ display: 'block', color: line === slide.headlineAccent ? slide.accentColor : '#0f172a' }}>
                    {line}
                  </span>
                ))}
              </h1>

              {/* Subline */}
              <p style={{ fontSize: 'clamp(14px, 1.2vw, 15.5px)', color: '#475569', lineHeight: '1.65', marginBottom: '20px', maxWidth: '520px' }}>
                {slide.subline}
              </p>

              {/* Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '24px' }}>
                {slide.highlights.map((h) => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '500', color: '#334155' }}>
                    <FaCheckCircle style={{ color: slide.accentColor, fontSize: '12.5px', flexShrink: 0 }} /> {h}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="hero-btns" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={slide.cta.href}
                  style={{ fontSize: '14.5px', padding: '12px 26px', background: slide.accentColor, color: 'white', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: '700', boxShadow: `0 8px 20px ${slide.accentColor}33`, transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {slide.cta.label} <FaArrowRight />
                </a>
                <a href={slide.secondaryCta.href}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1e293b', textDecoration: 'none', fontSize: '13.5px', fontWeight: '600', padding: '12px 20px', border: `2px solid ${slide.accentColor}40`, borderRadius: '50px', background: 'rgba(255,255,255,0.8)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${slide.accentColor}12`; e.currentTarget.style.borderColor = slide.accentColor; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = `${slide.accentColor}40`; }}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: slide.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FaPlay style={{ color: 'white', fontSize: '9px' }} />
                  </div>
                  {slide.secondaryCta.label}
                </a>
              </div>
            </div>

            {/* RIGHT — Visual panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {slide.cancerTicker ? (
                /* ── Cancer types card (slide 3 only) ── */
                <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', border: `1px solid ${slide.accentColor}25`, boxShadow: `0 16px 40px ${slide.accentColor}12`, position: 'relative', overflow: 'hidden' }}>
                  {/* Glow blob */}
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: slide.accentColor, opacity: 0.08, filter: 'blur(40px)' }} />

                  {/* Slide counter */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '11px', fontWeight: '700', color: `${slide.accentColor}80`, letterSpacing: '1px' }}>
                    {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </div>

                  {/* Infinity symbol */}
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ fontSize: 'clamp(44px, 5vw, 64px)', fontWeight: '900', color: slide.accentColor, lineHeight: 1, fontFamily: 'Georgia, serif', letterSpacing: '-2px' }}>∞</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>Every Cancer. Every Patient.</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500', marginBottom: '14px' }}>No diagnosis is ever turned away</div>

                  <div style={{ height: '1px', background: `${slide.accentColor}15`, marginBottom: '14px' }} />

                  {/* Pill grid — scrollable on small screens */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto', paddingRight: '4px' }}>
                    {CANCER_TYPES.map((name) => (
                      <span key={name} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '50px',
                        fontSize: '11px', fontWeight: '600',
                        background: `${slide.accentColor}10`,
                        border: `1px solid ${slide.accentColor}25`,
                        color: '#1e4d4a',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: slide.accentColor, display: 'inline-block', flexShrink: 0 }} />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Normal stat card ── */
                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '30px 24px', border: `1px solid ${slide.accentColor}20`, boxShadow: `0 16px 40px ${slide.accentColor}10`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: slide.accentColor, opacity: 0.07, filter: 'blur(30px)' }} />
                  <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '11px', fontWeight: '700', color: `${slide.accentColor}80`, letterSpacing: '1px' }}>
                    {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', color: slide.statDanger ? '#ef4444' : slide.accentColor, lineHeight: 1, fontFamily: 'Poppins, sans-serif' }}>
                      {slide.stat.value}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
                      {slide.stat.label}
                    </div>
                  </div>
                  <div style={{ height: '1px', background: `${slide.accentColor}15`, marginBottom: '18px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {slide.highlights.map((h) => (
                      <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: `${slide.accentColor}12`, border: `1px solid ${slide.accentColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          <FaCheckCircle style={{ color: slide.accentColor, fontSize: '9px' }} />
                        </div>
                        <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: '500', lineHeight: '1.3' }}>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust strip — always shown */}
              <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', borderRadius: '14px', padding: '10px 16px', border: `1px solid ${slide.accentColor}15`, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { icon: <FaStar />, v: '4.9★', s: 'Rating' },
                  { icon: <FaUserMd />, v: '22 Yrs', s: 'Experience' },
                  { icon: <FaShieldAlt />, v: 'FSSAI', s: 'Certified' },
                ].map((t) => (
                  <div key={t.v} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: slide.accentColor, fontSize: '13px' }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{t.v}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '500' }}>{t.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Controls ── */}
      {/* Prev / Next arrows */}
      {!isMobile && (
        <>
          <button onClick={prev}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: `1px solid ${slide.accentColor}30`, color: slide.accentColor, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
            onMouseEnter={e => { e.currentTarget.style.background = slide.accentColor; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = slide.accentColor; }}
          >
            <FaChevronLeft />
          </button>
          <button onClick={next}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: `1px solid ${slide.accentColor}30`, color: slide.accentColor, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }}
            onMouseEnter={e => { e.currentTarget.style.background = slide.accentColor; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = slide.accentColor; }}
          >
            <FaChevronRight />
          </button>
        </>
      )}

      {/* Dot indicators + progress bar */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {activeSlides.map((s, i) => (
            <button key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              style={{ width: current === i ? '32px' : '8px', height: '8px', borderRadius: '4px', background: current === i ? slide.accentColor : `${slide.accentColor}40`, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.35s ease', boxShadow: current === i ? `0 2px 8px ${slide.accentColor}66` : 'none' }}
            />
          ))}
        </div>
        {/* Auto-play progress bar */}
        <div style={{ width: '120px', height: '2px', background: `${slide.accentColor}25`, borderRadius: '1px', overflow: 'hidden' }}>
          <motion.div
            key={current}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4, ease: 'linear' }}
            style={{ height: '100%', background: slide.accentColor, borderRadius: '1px' }}
          />
        </div>
      </div>

      {/* Mobile swipe hint */}
      {isMobile && (
        <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '6px', alignItems: 'center' }}>
          <FaChevronLeft style={{ fontSize: '10px', color: `${slide.accentColor}80` }} />
          <span style={{ fontSize: '10px', color: `${slide.accentColor}80`, fontWeight: '600', letterSpacing: '1px' }}>SWIPE</span>
          <FaChevronRight style={{ fontSize: '10px', color: `${slide.accentColor}80` }} />
        </div>
      )}

      <style>{`
        .hero-slide-content {
          width: 100%;
        }
        @media (max-width: 900px) {
          .hero-slide-content {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 480px) {
          #home { padding-top: 72px !important; }
        }
      `}</style>
    </section>
  );
}