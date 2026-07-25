import React from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

export default function Doctors() {
  const { content } = useContent();

  const hero = content?.doctorsHero || {
    badge: 'OUR NUTRACEUTICAL TEAM',
    title: 'Meet Our Expert Team',
    subtitle: 'Our multidisciplinary team of medical consultants, naturopaths, and botanical researchers is dedicated to providing comprehensive, personalized care for cancer patients.'
  };

  const doctorsList = content?.doctorsList || [
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

  return (
    <section className="section-padding" style={{ background: 'var(--gray-1)' }}>
      <div className="container">
        <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="section-badge">
            <FaUserMd /> {hero.badge}
          </span>
          <h2 className="section-title">
            {hero.title} <span></span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            {hero.subtitle}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: '30px',
          }}
        >
          {doctorsList.map((doctor) => (
            <motion.div
              key={doctor.id}
              data-aos="fade-up"
              whileHover={{ y: -8 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {/* Image Frame */}
              <div style={{ height: '320px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={doctor.image}
                  alt={doctor.name}
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
                  }}
                >
                  {doctor.name}
                </h3>
                <div
                  style={{
                    color: 'var(--primary-dark)',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '16px',
                  }}
                >
                  {doctor.role}
                </div>

                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--gray-3)',
                    lineHeight: '1.7',
                    marginBottom: '20px',
                  }}
                >
                  {doctor.bio}
                </p>

                {/* Specialty Footer */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--gray-2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dark-3)' }}>
                    <FaBriefcase style={{ color: 'var(--primary)', fontSize: '13px', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500' }}>{doctor.specialty}</span>
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