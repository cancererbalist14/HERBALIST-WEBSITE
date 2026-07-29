import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaGoogle, FaCheckCircle } from 'react-icons/fa';

const reviewsList = [
  {
    name: 'Emily Watson',
    location: 'United Kingdom',
    rating: 5,
    text: 'Dr. Carter\'s team was incredibly supportive. We integrated the herbal mixtures alongside chemotherapy, and my oncology team was amazed at my blood count stability.',
    date: '2 weeks ago',
  },
  {
    name: 'Arthur Pendelton',
    location: 'United States',
    rating: 5,
    text: 'Getting a custom cancer herbal support protocol helped me regain my appetite and sleep. My fatigue levels went down significantly within the first 3 weeks.',
    date: '1 month ago',
  },
  {
    name: 'Kari Niemi',
    location: 'Finland',
    rating: 5,
    text: 'Absolutely recommend the free discovery call. They reviewed my biopsy and scan results, explaining the exact role of each herb in my personalized formulation.',
    date: '2 months ago',
  },
  {
    name: 'Devendra Sharma',
    location: 'India',
    rating: 5,
    text: 'The support doesn\'t stop at sending herbal supplements. The lifestyle diet charts and weekly follow-up consultations were vital in keeping me positive.',
    date: '3 months ago',
  },
];

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="section-padding"
      style={{ background: 'var(--white)' }}
    >
      <div className="container">
        {/* Rating Overview Header */}
        <div
          data-aos="fade-up"
          className="rating-overview-container"
          style={{
            background: 'var(--gray-1)',
            borderRadius: '24px',
            padding: 'var(--card-padding-lg, 36px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '48px',
            border: '1px solid var(--gray-2)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4285F4', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              <FaGoogle /> Google Patient Reviews
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--dark-2)' }}>
              Trusted by <span>Patients Worldwide</span>
            </h3>
          </div>

          <div className="rating-row" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Numeric Rating */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--dark-2)', lineHeight: 1 }}>
                4.9
              </div>
              <div style={{ display: 'flex', gap: '2px', color: 'var(--yellow)', margin: '4px 0' }}>
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-3)', fontWeight: '500' }}>
                Based on 2,500+ reviews
              </div>
            </div>

            {/* Verification badge */}
            <div
              className="divider"
              style={{
                height: '70px',
                width: '1px',
                background: 'var(--gray-2)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '20px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--dark-2)' }}>
                  100% Verified
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-3)' }}>
                  Patient identities anonymized for privacy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
            gap: '24px',
          }}
        >
          {reviewsList.map((review, i) => (
            <motion.div
              key={review.name}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              whileHover={{ y: -4 }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: 'var(--card-padding-sm, 24px)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--gray-2)',
                position: 'relative',
              }}
            >
              <FaQuoteLeft
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  fontSize: '24px',
                  color: 'var(--primary)',
                  opacity: 0.1,
                }}
              />

              <div style={{ display: 'flex', gap: '2px', color: 'var(--yellow)', marginBottom: '14px' }}>
                {[...Array(review.rating)].map((_, index) => (
                  <FaStar key={index} />
                ))}
              </div>

              <p
                style={{
                  fontSize: '13.5px',
                  color: 'var(--gray-3)',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                &ldquo;{review.text}&rdquo;
              </p>

              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--dark-2)' }}>
                  {review.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-3)', marginTop: '2px' }}>
                  <span>{review.location}</span>
                  <span>{review.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
