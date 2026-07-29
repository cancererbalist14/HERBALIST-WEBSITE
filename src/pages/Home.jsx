import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaLeaf, FaHeartbeat, FaShieldAlt, FaMicroscope,
  FaHandHoldingHeart, FaSeedling, FaArrowRight,
  FaRibbon, FaLungs, FaAppleAlt, FaTint, FaRegHospital,
  FaFlask, FaWhatsapp
} from 'react-icons/fa';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import TrustBadges from '../components/TrustBadges';
import TreatmentProcess from '../components/TreatmentProcess';
import SuccessStories from '../components/SuccessStories';
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';

/* ─── Why Choose Us – unique to Home ─── */
const whyChooseUs = [
  {
    icon: <FaMicroscope />,
    title: 'Personalized Protocols',
    desc: 'Every patient receives a unique herbal formula tailored to their specific cancer type, staging, and treatment history.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Safety-First Approach',
    desc: 'All herbs are screened against your medications to eliminate drug-herb interactions before we begin.',
  },
  {
    icon: <FaHandHoldingHeart />,
    title: 'Continuous Support',
    desc: 'Weekly check-ins, diet adjustments, and formula refinements so you are never alone on your healing path.',
  },
  {
    icon: <FaSeedling />,
    title: 'Certified Organic Sourcing',
    desc: 'We source from GMP-certified organic farms with full lab-tested purity and potency reports.',
  },
];

/* ─── Healing Pillars – unique to Home ─── */
const healingPillars = [
  { icon: <FaLeaf />, title: 'Herbal Formulation', stat: '20+', statLabel: 'Custom Blends', desc: 'Precision-crafted tinctures combining ancient wisdom with modern pharmacognosy research.' },
  { icon: <FaHeartbeat />, title: 'Lifestyle Integration', stat: '95%', statLabel: 'Patient Compliance', desc: 'Anti-cancer nutrition plans, breathing protocols, and stress-reduction frameworks.' },
  { icon: <FaShieldAlt />, title: 'Immune Optimization', stat: '87%', statLabel: 'Improved Markers', desc: 'Targeted adaptogens and immunomodulators to strengthen your bodys natural defenses.' },
];

export default function Home() {
  const { content } = useContent();

  const dynamicWhyChooseUs = (content?.whyChooseUs?.items || []).map((ds, idx) => {
    const staticItem = whyChooseUs[idx] || whyChooseUs[0];
    return {
      icon: staticItem.icon,
      title: ds.title,
      desc: ds.desc
    };
  });
  const activeWhyChooseUs = dynamicWhyChooseUs.length > 0 ? dynamicWhyChooseUs : whyChooseUs;
  const whyChooseUsTitle = content?.whyChooseUs?.title || 'Why Patients Trust Us';
  const whyChooseUsSubtitle = content?.whyChooseUs?.subtitle || 'Our integrative approach combines clinical precision with compassionate, whole-person care.';

  const dynamicHealingPillars = (content?.healingPillars?.items || []).map((ds, idx) => {
    const staticItem = healingPillars[idx] || healingPillars[0];
    return {
      icon: staticItem.icon,
      title: ds.title,
      stat: ds.stat,
      statLabel: ds.statLabel,
      desc: ds.desc
    };
  });
  const activeHealingPillars = dynamicHealingPillars.length > 0 ? dynamicHealingPillars : healingPillars;
  const healingPillarsTitle = content?.healingPillars?.title || 'Three Pillars of Recovery';
  const healingPillarsSubtitle = content?.healingPillars?.subtitle || 'A clinically structured framework that addresses the physical, nutritional, and immunological dimensions of cancer care.';

  return (
    <>
      <Hero />
      <Stats />
      <TrustBadges />

      {/* ═══ NEW: Our Approach ═══ */}
      <section
        className="section-padding"
        style={{ background: 'var(--gray-1)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(11, 91, 103, 0.04)', filter: 'blur(70px)', pointerEvents: 'none' }} />

        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-badge">
              <FaLeaf /> Methodology & Care
            </span>
            <h2 className="section-title">
              Our Care <span>Approach</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              {content?.aboutApproach?.subtitle || 'A four-principle framework that guides how we engage with every patient, every time.'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            {(content?.aboutApproach?.items || [
              { step: '01', title: 'Listen & Understand', desc: 'We begin by deeply understanding your diagnosis, medical history, current treatment, and personal goals — before prescribing anything.' },
              { step: '02', title: 'Personalise', desc: 'No two patients are the same. Every formula, dietary plan, and follow-up schedule is crafted specifically for you.' },
              { step: '03', title: 'Collaborate', desc: 'We work alongside your oncology team — sharing protocols, respecting boundaries, and ensuring complete safety.' },
              { step: '04', title: 'Support Continuously', desc: 'Healing is a journey. Monthly check-ins, WhatsApp support, and protocol adjustments ensure you are never alone.' }
            ]).map((item, i) => (
              <motion.div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(56, 190, 213, 0.12)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    fontSize: '48px',
                    fontWeight: '900',
                    color: 'rgba(56, 190, 213, 0.08)',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {item.step || `0${i + 1}`}
                </div>
                <h3
                  style={{
                    fontSize: '19px',
                    fontWeight: '700',
                    color: 'var(--dark-2)',
                    marginBottom: '14px',
                    fontFamily: 'Playfair Display, serif',
                    paddingRight: '40px',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-3)', lineHeight: '1.75', margin: 0 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW: Conditions We Support ═══ */}
      <section
        className="section-padding"
        style={{ background: 'var(--white)', position: 'relative' }}
      >
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-badge">
              <FaHeartbeat /> What We Support
            </span>
            <h2 className="section-title">
              Conditions We <span>Support</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We build specialized herbal protocols tailored to a wide range of diagnoses, helping optimize body resilience.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            {(content?.careProgramsList || [
              { title: 'Breast Cancer', slug: 'breast-cancer', desc: 'Targeted herbal formulas to regulate hormone levels, support cell health and minimise treatment side effects.' },
              { title: 'Lung Cancer', slug: 'lung-cancer', desc: 'Respiratory herbs that improve lung capacity, reduce coughing and support pulmonary tissue resilience.' },
              { title: 'Colon Cancer', slug: 'colon-cancer', desc: 'Gut-healing botanicals that optimise digestion, restore intestinal flora and soothe abdominal inflammation.' },
              { title: 'Prostate Cancer', slug: 'prostate-cancer', desc: 'Herbs targeting endocrine health, reducing pelvic inflammation and supporting urinary tract function.' },
              { title: 'Liver Cancer', slug: 'liver-cancer', desc: 'Hepatoprotective herbs that boost liver detoxification, aid cell regeneration and improve metabolic strength.' },
              { title: 'Blood Cancer', slug: 'blood-cancer', desc: 'Immune tonics and blood-purifying botanicals supporting marrow health and optimising energy levels.' }
            ]).slice(0, 6).map((svc, i) => {
              const icons = [<FaRibbon key={0} />, <FaLungs key={1} />, <FaAppleAlt key={2} />, <FaHeartbeat key={3} />, <FaRegHospital key={4} />, <FaTint key={5} />];
              return (
                <motion.div
                  key={svc.slug || svc.title}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                  whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '30px',
                    border: '1px solid rgba(56, 190, 213, 0.15)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #38bed5 0%, #2ca8be 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: 'white',
                        marginBottom: '20px',
                        boxShadow: '0 6px 16px rgba(56, 190, 213, 0.3)',
                      }}
                    >
                      {icons[i % icons.length]}
                    </div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--dark-2)',
                        marginBottom: '10px',
                        fontFamily: 'Playfair Display, serif',
                      }}
                    >
                      {svc.title}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.7', marginBottom: '20px' }}>
                      {svc.desc}
                    </p>
                  </div>
                  <Link
                    to={`/services/${svc.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--primary-dark)',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      textDecoration: 'none',
                    }}
                  >
                    Explore Program <FaArrowRight style={{ fontSize: '11px' }} />
                  </Link>
                </motion.div>
              );
            })}

            {/* Infinity Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay={6 * 80}
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'linear-gradient(135deg, #0b5b67 0%, #38bed5 100%)',
                borderRadius: '24px',
                padding: '30px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '40px', fontWeight: '900', lineHeight: 1, fontFamily: 'Georgia, serif', marginBottom: '10px' }}>
                  ∞
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', fontFamily: 'Playfair Display, serif', color: 'white' }}>
                  Every Cancer Type Supported
                </h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', marginBottom: '20px' }}>
                  No diagnosis is ever turned away. We formulate custom pathways for all common, complex, and rare cancer classifications.
                </p>
              </div>
              <Link
                to="/care-programs"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'white',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  textDecoration: 'underline',
                }}
              >
                See All Care Programs <FaArrowRight style={{ fontSize: '11px' }} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ NEW: Featured Treatments ═══ */}
      <section
        className="section-padding"
        style={{
          background: 'linear-gradient(180deg, var(--gray-1) 0%, var(--white) 100%)',
          position: 'relative',
        }}
      >
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-badge">
              <FaFlask /> Advanced Therapeutics
            </span>
            <h2 className="section-title">
              Featured <span>Treatments</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Explore our core botanical modalities and complementary therapies designed to support cancer warriors.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                title: 'Herbal Chemotherapy (HCT)',
                icon: <FaLeaf />,
                color: '#1a6e52',
                desc: 'Phytochemical formulations designed to target abnormal pathways, downregulate oncogenes, and inhibit abnormal cell reproduction.',
              },
              {
                title: 'Nutrition Therapy (NT)',
                icon: <FaAppleAlt />,
                color: '#e28743',
                desc: 'Organ-protecting, anti-inflammatory nutritional regimens designed to optimize immunity, starve tumor cells, and prevent cachexia.',
              },
              {
                title: 'Immune Optimization',
                icon: <FaHeartbeat />,
                color: '#e056fd',
                desc: 'Targeted adaptogens and standard immunomodulators that boost Natural Killer (NK) cells and T-cell defense markers.',
              },
              {
                title: 'Medication Screening',
                icon: <FaShieldAlt />,
                color: '#38bed5',
                desc: 'Strict screening protocols to check for drug-herb interactions, ensuring all formulations work safely with conventional chemotherapy.',
              },
            ].map((treat, i) => (
              <motion.div
                key={treat.title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(56, 190, 213, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `${treat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: treat.color,
                    marginBottom: '22px',
                  }}
                >
                  {treat.icon}
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--dark-2)',
                    marginBottom: '12px',
                    fontFamily: 'Playfair Display, serif',
                  }}
                >
                  {treat.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.7', margin: 0 }}>
                  {treat.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }} data-aos="fade-up">
            <Link to="/treatment-methods" className="btn-primary">
              Learn About Our Methods <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <TreatmentProcess />

      {/* ═══ Why Choose Us – unique to Home page ═══ */}
      <section
        className="section-padding"
        style={{ background: 'var(--white)' }}
      >
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-badge">
              <FaShieldAlt /> What Sets Us Apart
            </span>
            <h2 className="section-title">
              {whyChooseUsTitle}
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              {whyChooseUsSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: '24px',
            }}
          >
            {activeWhyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                data-aos="fade-up"
                data-aos-delay={i * 80}
                whileHover={{ y: -6 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  boxShadow: 'var(--shadow-md)',
                  border: `1px solid ${ACCENT}18`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: ACCENT,
                    filter: 'blur(50px)',
                    opacity: 0.08,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `${ACCENT}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    color: ACCENT,
                    marginBottom: '20px',
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--dark-2)',
                    marginBottom: '10px',
                    fontFamily: 'Playfair Display, serif',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-3)', lineHeight: '1.7' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW: Success Stories ═══ */}
      <SuccessStories />

      {/* ═══ Healing Pillars – unique to Home page ═══ */}
      <section
        className="section-padding"
        style={{
          background: 'linear-gradient(135deg, #f0fdfe 0%, #e0f7fa 50%, #f8fafc 100%)',
        }}
      >
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-badge">
              <FaLeaf /> Our Healing Framework
            </span>
            <h2 className="section-title">
              {healingPillarsTitle}
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              {healingPillarsSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: '28px',
            }}
          >
            {activeHealingPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                whileHover={{ y: -6, boxShadow: `0 16px 48px ${ACCENT}20` }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  boxShadow: 'var(--shadow-md)',
                  border: `1px solid ${ACCENT}22`,
                  textAlign: 'center',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: ACCENT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    color: 'white',
                    margin: '0 auto 20px',
                    boxShadow: `0 8px 24px ${ACCENT}33`,
                  }}
                >
                  {pillar.icon}
                </div>

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--dark-2)',
                    marginBottom: '8px',
                    fontFamily: 'Playfair Display, serif',
                  }}
                >
                  {pillar.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    gap: '6px',
                    marginBottom: '14px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: ACCENT,
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {pillar.stat}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-3)', fontWeight: '500' }}>
                    {pillar.statLabel}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.7' }}>
                  {pillar.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div data-aos="fade-up" style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: ACCENT,
                color: '#fff',
                padding: '16px 40px',
                borderRadius: '50px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: `0 8px 32px ${ACCENT}44`,
              }}
            >
              Start Your Healing Journey <FaArrowRight style={{ fontSize: '14px' }} />
            </Link>
          </div>
        </div>
      </section>



    </>
  );
}