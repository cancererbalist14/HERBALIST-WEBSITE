import React from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const staticExperts = [
  {
    id: 1,
    name: 'Prof. Ramesh Babu',
    role: 'Pharmacologist — M.Pharm, PhD',
    experience: '22 Years Experience',
    specialty: 'Integrative Pharmacology & Herbal Oncology',
    bio: 'Prof. Ramesh is a highly accomplished Pharmacologist with a strong academic background and extensive experience in the field of herbal medicine. He holds a Master of Pharmacy (M.Pharm), demonstrating his deep expertise in natural products and integrative oncology. With over two decades of dedicated practice, he has made significant contributions to herbal formulation and patient-centric cancer care.',
    image: '/images/doctor1.png',
  },
  {
    id: 2,
    name: 'Nutraceutical Team',
    role: 'Multidisciplinary Research & Care Team',
    specialty: 'Clinical Nutrition, Herbal Research & Patient Support',
    bio: "Comprised of dedicated professionals from diverse medical, research, and healthcare backgrounds, our team works collaboratively to deliver comprehensive care and personalized support to every patient. By combining clinical expertise, evidence-based practices, and a patient-centered approach, we strive to address each individual's unique needs throughout their treatment journey.",
    image: '/images/doctor33.png',
  },
];

export default function ExpertProfiles() {
  const { content } = useContent();
  const doctorsList = content?.doctorsList || staticExperts;

  return (
    <section
      id="experts"
      className="section-padding"
      style={{ background: 'var(--white)' }}
    >
      <div className="container">
        <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="section-badge">
            <FaUserMd /> Clinical & Research Team
          </span>
          <h2 className="section-title">
            Meet Our <span>Specialists</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Meet our multidisciplinary team of medical consultants, naturopaths, and botanical researchers dedicated to your recovery.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: '30px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {doctorsList.map((expert, i) => (
            <motion.div
              key={expert.id || expert.name}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              whileHover={{ y: -8 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(56, 190, 213, 0.15)',
              }}
            >
              {/* Image Frame */}
              <div style={{ height: '340px', overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
                <img
                  src={expert.image}
                  alt={expert.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1.0)')}
                />
              </div>

              {/* Card Body */}
              <div style={{ padding: 'var(--card-padding-sm, 28px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--dark-2)',
                    marginBottom: '4px',
                    fontFamily: 'Playfair Display, serif',
                  }}
                >
                  {expert.name}
                </h3>
                <div
                  style={{
                    color: '#2ca8be',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '16px',
                  }}
                >
                  {expert.role}
                </div>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--gray-3)',
                    lineHeight: '1.75',
                    marginBottom: '20px',
                  }}
                >
                  {expert.bio}
                </p>

                {/* Details Footer */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--gray-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {expert.experience && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--dark-3)',
                      }}
                    >
                      <FaGraduationCap style={{ color: '#38bed5', fontSize: '15px', flexShrink: 0 }} />
                      <span style={{ fontWeight: '500' }}>{expert.experience}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--dark-3)',
                    }}
                  >
                    <FaBriefcase style={{ color: '#1a6e52', fontSize: '14px', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>{expert.specialty}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
