import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  FaUsers, FaGlobe, FaCalendarCheck,
  FaLeaf, FaAward, FaHospital
} from 'react-icons/fa';

import { useContent } from '../context/ContentContext';

const stats = [
  {
    icon: <FaUsers />,
    value: 4000,
    suffix: '+',
    label: 'Patients Served',
    sublabel: 'Worldwide',
    color: '#38bed5',
    gradient: 'linear-gradient(135deg, #38bed5, #1a6e52)',
  },
  {
    icon: <FaGlobe />,
    value: 10,
    suffix: '+',
    label: 'Countries',
    sublabel: 'Global Reach',
    color: '#38bed5',
    gradient: 'linear-gradient(135deg, #0b5b67, #38bed5)',
  },
  {
    icon: <FaCalendarCheck />,
    value: 7000,
    suffix: '+',
    label: 'Consultations',
    sublabel: 'Completed',
    color: '#38bed5',
    gradient: 'linear-gradient(135deg, #38bed5, #2ca8be)',
  },
  {
    icon: <FaLeaf />,
    value: 35,
    suffix: '+',
    label: 'Years of Research Experience',
    sublabel: 'Expert Practice',
    color: '#1a6e52',
    gradient: 'linear-gradient(135deg, #1a6e52, #38bed5)',
  },
  {
    icon: <FaHospital />,
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    sublabel: 'Patient Feedback',
    color: '#38bed5',
    gradient: 'linear-gradient(135deg, #2ca8be, #0b5b67)',
  },
];

export default function Stats() {
  const { content } = useContent();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const dynamicStats = (content?.stats || []).map((ds, idx) => {
    const staticStat = stats[idx] || stats[0];
    return {
      icon: staticStat.icon,
      color: staticStat.color,
      gradient: staticStat.gradient,
      value: Number(ds.value) || 0,
      suffix: ds.suffix || '',
      label: ds.label || '',
      sublabel: ds.sublabel || ''
    };
  });
  const activeStats = dynamicStats.length > 0 ? dynamicStats : stats;

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #EBF5F0 0%, #F4FAF7 100%)',
        padding: '60px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(46,125,50,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,125,50,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container" ref={ref}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, calc(50% - 10px)), 1fr))',
            gap: '20px',
          }}
        >
          {activeStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, translateY: -4 }}
              style={{
                background: 'var(--white)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${stat.color}20`,
                borderRadius: '20px',
                boxShadow: 'var(--shadow-md)',
                padding: '24px 20px',
                textAlign: 'center',
                cursor: 'default',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '22px',
                  color: 'white',
                  boxShadow: `0 8px 24px ${stat.color}20`,
                }}
              >
                {stat.icon}
              </div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: '800',
                  background: stat.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}
              >
                {inView ? (
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    separator=","
                  />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>
              <div
                style={{
                  color: 'var(--dark-2)',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '2px',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  color: 'var(--gray-3)',
                  fontSize: '11px',
                }}
              >
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
