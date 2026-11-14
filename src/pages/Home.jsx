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
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';

/* ─── Why Choose Us – unique to Home ─── */
const whyChooseUs = [
  {
    icon: <FaMicroscope />,
    title: 'Personalized Protocols',
    desc: 'We invite patients and caregivers to ask questions about products, ingredients, intended use and available documentation.',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Safety-First Approach',
    desc: 'Herbal products can interact with medicines. Discuss any product with your oncologist or pharmacist before use.',
  },
  {
    icon: <FaHandHoldingHeart />,
    title: 'Continuous Support',
    desc: 'Patients and caregivers can arrange a discussion to understand the institute and available product information.',
  },
  {
    icon: <FaSeedling />,
    title: 'Certified Organic Sourcing',
    desc: 'Ask us which quality documents and product-specific testing information are available.',
  },
];

/* ─── Healing Pillars – unique to Home ─── */
const healingPillars = [
  { icon: <FaLeaf />, title: 'Botanical Products', stat: '', statLabel: '', desc: 'Learn about ingredients, formulation details, intended use and available product documentation.' },
  { icon: <FaHeartbeat />, title: 'Nutrition Education', stat: '', statLabel: '', desc: 'Explore general nutrition information and questions to discuss with your oncology care team.' },
  { icon: <FaShieldAlt />, title: 'Product Safety & Interactions', stat: '', statLabel: '', desc: 'Understand possible interactions, contraindications and precautions before considering a product.' },
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
  const healingPillarsTitle = content?.healingPillars?.title || 'How We Share Information';
  const healingPillarsSubtitle = content?.healingPillars?.subtitle || 'Our focus is product transparency, general nutrition education and informed discussions about limitations and risks.';

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
              { step: '01', title: 'Listen & Understand', desc: 'We listen to the questions patients and caregivers want to discuss about the institute and products.' },
              { step: '02', title: 'Personalise', desc: 'Ask about product ingredients, intended use, directions and available documentation.' },
              { step: '03', title: 'Collaborate', desc: 'Our products are not cancer treatments. Discuss any product with your treating oncologist or pharmacist before use.' },
              { step: '04', title: 'Support Continuously', desc: 'We welcome questions about the institute and available product information.' }
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
              Explore information about our institute, botanical products and general nutrition education.
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
              { title: 'Breast Cancer', slug: 'breast-cancer', desc: 'Learn about relevant product information, intended use and available documentation.' },
              { title: 'Lung Cancer', slug: 'lung-cancer', desc: 'Learn about relevant product information, intended use and available documentation.' },
              { title: 'Colon Cancer', slug: 'colon-cancer', desc: 'Learn about relevant product ingredients, intended use and available documentation.' },
              { title: 'Prostate Cancer', slug: 'prostate-cancer', desc: 'Learn about relevant product information, intended use and available documentation.' },
              { title: 'Liver Cancer', slug: 'liver-cancer', desc: 'Learn about relevant product information, intended use and available documentation.' },
              { title: 'Blood Cancer', slug: 'blood-cancer', desc: 'Learn about relevant product information, intended use and available documentation.' }
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
                  Information for Patients & Caregivers
                </h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', marginBottom: '20px' }}>
                  Contact us to learn about Cancer Herbalist, our products and the information available. We do not provide cancer treatment.
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
              <FaFlask /> Botanical & Nutrition Information
            </span>
            <h2 className="section-title">
              Products & <span>Information</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Explore information about botanical products, nutrition education and product safety considerations.
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
                title: 'Botanical Product Information',
                icon: <FaLeaf />,
                color: '#1a6e52',
                desc: 'Learn about product ingredients, formulation details, intended use, directions and available documentation.',
              },
              {
                title: 'Nutrition Education',
                icon: <FaAppleAlt />,
                color: '#e28743',
                desc: 'Explore general nutrition information and questions to discuss with your oncology team or registered dietitian.',
              },
              {
                title: 'Botanical Product Information',
                icon: <FaHeartbeat />,
                color: '#e056fd',
                desc: 'Herbal ingredients may interact with medicines or be unsuitable for some people. Ask your oncologist or pharmacist before use.',
              },
              {
                title: 'Medication Screening',
                icon: <FaShieldAlt />,
                color: '#38bed5',
                desc: 'Ask questions about possible interactions, contraindications and precautions. No product is suitable for everyone.',
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
              <FaLeaf /> Our Information Framework
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
              Start an Information Discussion <FaArrowRight style={{ fontSize: '14px' }} />
            </Link>
          </div>
        </div>
      </section>



    </>
  );
}