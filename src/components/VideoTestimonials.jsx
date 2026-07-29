import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaTimes, FaVideo, FaCheckCircle, FaStar } from 'react-icons/fa';

const videos = [
  {
    id: 1,
    name: 'Mr. Sharath',
    condition: 'Hodgkin Lymphoma',
    status: 'Age 33 | Chemo No Response | NT & HCT Integration',
    title: 'When conventional chemotherapy failed, integrating HCT & Nutritional Therapy stabilized my condition.',
    thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=600&h=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video URL
    summary: `Introduction to HCT Integration:
- Diagnosed with Hodgkin Lymphoma at age 33.
- Experienced no response and disease progression with conventional chemotherapy.
- Initiated intensive Nutritional Therapy (NT) integrated with customized Herbal Chemotherapy (HCT) alongside clinical care.

Outcome & Progress:
- HCT targeted non-dividing, circulating, and metastasized cells to check progression.
- Mitigated chemotherapy toxicity, minimized organ strain, and successfully stabilized cell markers.
- Significantly restored physical strength, muscle mass, and baseline immunological markers.`
  },
  {
    id: 2,
    name: '78-Year-Old Patient (Shared by Daughter Kusuma)',
    condition: 'Blood Cancer (MDS)',
    status: 'Transfusion-Free & Active',
    title: 'Customized Herbal Nutraceuticals eliminated the need for biweekly blood transfusions.',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600&h=400',
    videoUrl: 'https://www.youtube.com/embed/t6YiUIBDANk',
    summary: `Patient Profile & Medical History:
- Female patient, aged 78, diagnosed with Blood Cancer (Myelodysplastic Syndrome - MDS).
- Underwent conventional chemotherapy, which was discontinued due to severe, intolerant side effects.

Intervention:
- The family, lead by the patient's daughter Kusuma, approached Cancer Herbalist, Bangalore for a personalized Herbal Nutraceutical Care Plan.

Clinical Outcomes:
- Responded immediately within weeks of starting the care plan.
- Eliminated the need for biweekly blood transfusions entirely.
- Restored mobility, allowing her to stand on her own legs and work independently.
- Drastic reduction in chronic pains, significant improvements in physical aura, and a greatly enhanced quality of life.`
  },
  {
    id: 3,
    name: 'Stage IV Lung Cancer Patient',
    condition: 'Lung Cancer (Stage 4)',
    status: 'Complete PET Scan Remission',
    title: 'PET scan failed to detect cancer in the whole body after Nutrition Therapy intervention.',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600&h=400',
    videoUrl: 'https://www.youtube.com/embed/3awpZRSwE1A',
    summary: `Patient Profile & Medical History:
- Diagnosed with Stage IV (Stage 4) Lung Cancer in January 2018.
- The malignancy had metastasized and spread all over the body.
- Conventional treatments and standard therapies were failing to show positive clinical responses.

Intervention:
- Initiated a clinical Nutrition Therapy (NT) program with personalized herbal support from Cancer Herbalist, Bangalore.

Clinical Outcomes:
- By July 2018, follow-up diagnostics showed a complete turnaround.
- The post-treatment PET scan failed to detect any cancer in the entire body, demonstrating full metabolic remission.
- Patient restored full physical health and achieved long-term healthy, active living.`
  },
];

export default function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section
      id="testimonials"
      className="section-padding"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F4FAF7 100%)',
        color: 'var(--dark-2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 60%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span
            className="section-badge"
            style={{
              background: 'var(--primary-light)',
              border: '1px solid rgba(46,125,50,0.2)',
              color: 'var(--primary-dark)',
            }}
          >
            <FaVideo /> Patient Video Journals
          </span>
          <h2 className="section-title">
            Inspiring <span>Success Stories</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto', color: 'var(--gray-3)' }}>
            Watch detailed accounts of our patients discussing their healing journeys, clinical milestones, and holistic experiences.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
          }}
        >
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-2)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveVideo(video)}
            >
              {/* Thumbnail Frame */}
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={video.thumbnail}
                  alt={video.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Play Button Overlay */}
                <div
                  className="video-card-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)')}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'var(--gradient-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-green)',
                      fontSize: '18px',
                      color: 'white',
                      paddingLeft: '4px',
                    }}
                  >
                    <FaPlay />
                  </motion.div>
                </div>
              </div>

              {/* Video Info */}
              <div style={{ padding: 'var(--card-padding-sm, 24px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--dark-2)' }}>{video.name}</div>
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--yellow)', fontSize: '12px' }}>
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', background: 'var(--gray-1)', padding: '4px 10px', borderRadius: '50px', color: 'var(--gray-3)', border: '1px solid var(--gray-2)' }}>
                    {video.condition}
                  </span>
                  <span style={{ fontSize: '11px', background: 'var(--secondary-light)', padding: '4px 10px', borderRadius: '50px', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCheckCircle style={{ fontSize: '9px' }} /> {video.status}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  &ldquo;{video.title}&rdquo;
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '800px',
                background: 'var(--dark-2)',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'background 0.3s',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => (e.target.style.background = 'rgba(255,23,68,0.8)')}
                onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.1)')}
              >
                <FaTimes />
              </button>

              {/* Video Iframe container (16:9) */}
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </div>

              {/* Video Summary */}
              <div style={{ padding: '24px', color: 'white' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: 'white', fontFamily: 'Playfair Display, serif' }}>
                  {activeVideo.name} — {activeVideo.condition}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', marginBottom: '16px' }}>
                  {activeVideo.status}
                </div>
                {activeVideo.summary && (
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)', 
                    fontSize: '13.5px', 
                    lineHeight: '1.7', 
                    color: 'rgba(255,255,255,0.85)',
                    whiteSpace: 'pre-line' 
                  }}>
                    {activeVideo.summary}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
