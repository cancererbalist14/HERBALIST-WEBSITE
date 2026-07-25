import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaTimes, FaVideo, FaCheckCircle, FaStar, FaQuoteLeft, FaBookmark, FaRegChartBar, FaNotesMedical, FaRegClock, FaRibbon, FaFlask, FaUsers, FaGlobe, FaCalendarAlt, FaStethoscope, FaHourglassHalf } from 'react-icons/fa';

const ACCENT = '#38bed5';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');

function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  
  if (url.includes('youtube.com/watch')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      const id = parts[1].split(/[?#]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  }
  return url;
}

const videos = [
  {
    id: 1,
    name: 'Mr. Sharath',
    condition: 'Hodgkin Lymphoma',
    status: 'Age 33 | Chemo No Response | NT & HCT Integration',
    title: 'When conventional chemotherapy failed, integrating HCT & Nutritional Therapy stabilized my condition.',
    thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=600&h=400',
    videoUrl: 'https://www.youtube.com/watch?v=i5VuQjcV30w',
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
    videoUrl: 'https://www.youtube.com/watch?v=t6YiUIBDANk',
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
    videoUrl: 'https://www.youtube.com/watch?v=3awpZRSwE1A',
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

const reviewsList = [
  { name: 'Subash Ricardo S', location: 'Chennai', rating: 5, text: `My uncle was diagnosed with advanced colon cancer, and we started treatment at Cancer Herbalist after several cycles of chemotherapy. Although it was very late, the consultants and staff were supportive and always available for guidance.

After taking the herbal kit, my uncle felt better for several months. Sadly, he later passed away. We are grateful to the entire Cancer Herbalist team for their care, support, and compassion during a difficult time.`, date: 'Recent' },
  { name: 'Anand Keerthana', location: 'Vandawasi, near Chennai', rating: 5, text: 'My son Sarvesh is 2 years old and diagnosed with Adrenal cancer. We gave treatment of radiotherapy and chemotherapy after surgery. Last scan showed spread to bones. With the fear of losing him, we went to Cancer Herbalist, Bangalore and started herbal therapy. It was the right place. Now after 6 months, the child is very active, normal and no pain or swelling. The leg bone spread appears to be not active. Sarvesh also gained 3 kg weight. Don\'t fear for herbal therapy. It is safe for children.', date: 'a year ago' },
  { name: 'Nayana Gowda', location: 'Bangalore, India', rating: 5, text: 'It\'s really heartening to see my friend getting relieved from breast cancer after taking treatment from Cancer Herbalist Bangalore. Best part is no side effects and economical. Hope she completely gets cured. I recommend all cancer patients to try once.', date: '3 years ago' },
  { name: 'Devendra Sharma', location: 'India', rating: 5, text: 'The support doesn\'t stop at sending herbal supplements. The lifestyle diet charts and weekly follow-up consultations were vital in keeping me positive throughout my treatment.', date: '3 months ago' },
];

const caseStudies = [
  {
    id: 'breast',
    tabTitle: 'Hodgkin Lymphoma',
    patientName: 'Mr. Sharath',
    ageGender: '33 Years, Male',
    diagnosis: 'Hodgkin Lymphoma (Chemo No Response)',
    duration: '18 Months Support',
    biomarkers: [
      { metric: 'Chemotherapy Response', pre: 'No Response / Progression', post: 'Stable / Inactive' },
      { metric: 'Nutritional Therapy (NT)', pre: 'Not Initiated', post: 'Integrated with HCT' },
      { metric: 'Quality-of-Life Score', pre: 'Poor / Severe Organ Strain', post: 'Optimized / Restored' }
    ],
    protocol: 'Standardized phytotherapy targeting non-dividing and circulating cells, integrated with Nutritional Therapy (NT) alongside salvage chemotherapy.',
    clinicalSummary: 'Diagnosed at age 33 with Hodgkin Lymphoma. Conventional chemotherapy yielded no response. Upon initiating customized Herbal Chemotherapy (HCT) combined with intensive Nutritional Therapy (NT) alongside conventional care, the patient experienced minimized toxic effects, stabilized cellular markers, and restored physical strength.',
  },
  {
    id: 'adrenal',
    tabTitle: 'Pediatric Adrenal Cancer',
    patientName: 'Sarvesh (Son of Anand Keerthana)',
    ageGender: '2 Years, Male',
    diagnosis: 'Adrenal Cancer with bone metastasis (post-chemo/radiotherapy)',
    duration: '6 Months Support',
    biomarkers: [
      { metric: 'Leg Bone Metastasis', pre: 'Active Spread', post: 'Inactive / Stable' },
      { metric: 'Pain & Swelling', pre: 'Severe / Debilitating', post: 'Fully Resolved' },
      { metric: 'Body Weight', pre: 'Underweight', post: '+3 kg Gained' }
    ],
    protocol: 'Pediatric-safe phytotherapy protocol, bone-supportive herbal extracts, customized easy-to-digest nutrition charts.',
    clinicalSummary: 'Following conventional surgery, radiotherapy, and chemotherapy, follow-up scans revealed bone metastasis. Within 6 months of starting complementary herbal therapy, the child became highly active, pain-free, bone lesions stabilized as inactive, and he gained 3 kg.',
  },
  {
    id: 'colon',
    tabTitle: 'Advanced Colon Cancer',
    patientName: 'Uncle of Subash Ricardo S',
    ageGender: 'Male',
    diagnosis: 'Advanced Colon Cancer (Late-stage Chemotherapy support)',
    duration: 'Several Months Care',
    biomarkers: [
      { metric: 'Chemo-induced Distress', pre: 'Severe Fatigue & Pain', post: 'Eased / Manageable' },
      { metric: 'Digestive Comfort', pre: 'Critical Appetite Loss', post: 'Improved Food Intake' },
      { metric: 'Quality-of-Life Duration', pre: 'Low Vitality', post: 'Maintained Comfortably' }
    ],
    protocol: 'Hepatoprotective liver-safe herbs, digestive comfort extracts, weekly follow-up consultations.',
    clinicalSummary: 'Integrated the herbal support plan in the very late stages of advanced colon cancer after multiple cycles of chemotherapy. Although the patient later passed away, the protocol provided crucial comfort, support, and pain relief for several months.',
  },
];

export default function Testimonials() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('breast');
  const activeCaseStudy = caseStudies.find(study => study.id === activeTab);
  const [allReviews, setAllReviews] = useState(reviewsList);

  React.useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-testimonials`);
        const data = await res.json();
        if (data.success && data.testimonials) {
          setAllReviews(data.testimonials);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <>
      {/* Website Impact Statistics Banner */}
      <section style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a6e52 50%, #0e6655 100%)', padding: '130px 20px 60px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: ACCENT, opacity: 0.15, filter: 'blur(90px)' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}55`, color: ACCENT, padding: '8px 24px', borderRadius: '50px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '18px' }}>
            🌟 Real Results & Clinical Milestones
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, marginBottom: '20px' }}>
            Patient Stories & <span style={{ color: ACCENT }}>Impact Metrics</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.85)', maxWidth: '720px', margin: '0 auto 48px', lineHeight: '1.8' }}>
            Discover verified healing journeys and real clinical outcomes achieved through Herbal Chemotherapy (HCT) and Integrative Clinical Support.
          </p>

          {/* Hero description ends here */}
        </div>
      </section>


      {/* Video Testimonials Section */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 60%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="section-badge" style={{ background: 'var(--secondary-light)', border: '1px solid var(--primary-light)', color: 'var(--primary-dark)' }}>
              <FaVideo /> Patient Video Journeys
            </span>
            <h2 className="section-title">Inspiring <span>Success Stories</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto', color: 'var(--gray-3)' }}>
              Watch detailed accounts of our patients discussing their healing journeys, clinical milestones, and holistic experiences.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '30px' }}>
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                data-aos="fade-up"
                data-aos-delay={i * 150}
                whileHover={{ scale: 1.02 }}
                style={{ background: 'var(--white)', border: '1px solid var(--gray-2)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => setActiveVideo(video)}
              >
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                  <img src={video.thumbnail} alt={video.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="video-card-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s ease' }}>
                    <motion.div whileHover={{ scale: 1.15 }} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)', fontSize: '18px', color: 'white', paddingLeft: '4px' }}>
                      <FaPlay />
                    </motion.div>
                  </div>
                </div>
                <div style={{ padding: 'var(--card-padding-sm, 24px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--dark-2)' }}>{video.name}</div>
                    <div style={{ display: 'flex', gap: '2px', color: '#FBBF24', fontSize: '12px' }}>
                      {[...Array(5)].map((_, idx) => <FaStar key={idx} />)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', background: 'var(--gray-1)', padding: '4px 10px', borderRadius: '50px', color: 'var(--gray-3)', border: '1px solid var(--gray-2)' }}>{video.condition}</span>
                    <span style={{ fontSize: '11px', background: 'var(--secondary-light)', padding: '4px 10px', borderRadius: '50px', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaCheckCircle style={{ fontSize: '9px' }} /> {video.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '16px' }}>"{video.title}"</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/testimonials/${video.id}`); }}
                    style={{
                      width: '100%',
                      background: ACCENT || 'var(--gradient-primary)',
                      color: '#fff',
                      border: 'none',
                      padding: '11px 24px',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '14px',
                      transition: 'opacity 0.2s, transform 0.2s',
                      marginTop: 'auto',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Read Full Story →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
              onClick={() => setActiveVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ width: '100%', maxWidth: '800px', background: 'var(--dark-2)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setActiveVideo(null)} style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', zIndex: 10 }}>
                  <FaTimes />
                </button>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe src={getEmbedUrl(activeVideo.videoUrl)} title={activeVideo.name} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                </div>
                <div style={{ padding: '24px', color: 'white' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: 'white', fontFamily: 'Playfair Display, serif' }}>{activeVideo.name} — {activeVideo.condition}</div>
                  <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', marginBottom: '16px' }}>{activeVideo.status}</div>
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

      {/* Written Reviews Section */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div data-aos="fade-up" className="rating-overview-container" style={{ background: 'var(--gray-1)', borderRadius: '24px', padding: 'var(--card-padding-lg, 36px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: '48px', border: '1px solid var(--gray-2)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                <FaPlay /> Patient Testimonials
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--dark-2)' }}>Trusted by <span>Patients Worldwide</span></h3>
            </div>
            <div className="rating-row" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--dark-2)', lineHeight: 1 }}>4.5</div>
                <div style={{ display: 'flex', gap: '2px', color: '#FBBF24', margin: '4px 0' }}>
                  {[...Array(5)].map((_, idx) => <FaStar key={idx} />)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-3)', fontWeight: '500' }}>Based on 2,500+ reviews</div>
              </div>
              <div className="divider" style={{ height: '70px', width: '1px', background: 'var(--gray-2)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '20px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--dark-2)' }}>100% Verified</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-3)' }}>Patient identities anonymized for privacy</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
            {allReviews.map((review, i) => (
              <motion.div
                key={review.name + i}
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
                  cursor: review.videoUrl ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden'
                }}
                onClick={() => {
                  if (review.videoUrl) {
                    setActiveVideo({
                      name: review.name,
                      videoUrl: review.videoUrl,
                      condition: review.location,
                      status: 'Verified Patient Story'
                    });
                  }
                }}
              >
                <div>
                  {review.thumbnailUrl && (
                    <div style={{ height: '160px', margin: '-24px -24px 16px -24px', position: 'relative', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                      <img src={review.thumbnailUrl} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {review.videoUrl && (
                        <div className="video-card-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)', fontSize: '14px', color: 'white', paddingLeft: '3px' }}>
                            <FaPlay />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    <FaQuoteLeft style={{ position: 'absolute', top: '0', right: '0', fontSize: '24px', color: 'var(--primary)', opacity: 0.1 }} />
                    <div style={{ display: 'flex', gap: '2px', color: '#FBBF24', marginBottom: '14px' }}>
                      {[...Array(review.rating)].map((_, idx) => <FaStar key={idx} />)}
                    </div>
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--gray-3)', lineHeight: '1.6', marginBottom: '20px' }}>"{review.text}"</p>
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--dark-2)' }}>{review.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-3)', marginTop: '2px' }}>
                    <span>{review.location}</span>
                    <span>{review.date}</span>
                  </div>

                  {review.videoUrl && !review.thumbnailUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveVideo({ name: review.name, videoUrl: review.videoUrl, condition: review.location, status: 'Verified Patient Story' }); }}
                      style={{
                        width: '100%',
                        background: 'var(--gradient-primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '12px',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaPlay style={{ fontSize: '9px' }} /> Watch Journey Video
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Demographics & Reach Section */}
      <section className="section-padding" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)', borderTop: '1px solid var(--gray-2)', borderBottom: '1px solid var(--gray-2)' }}>
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-badge" style={{ background: 'var(--secondary-light)', border: '1px solid var(--primary-light)', color: 'var(--primary-dark)' }}>
              <FaRegChartBar /> Overview & Demographics
            </span>
            <h2 className="section-title">Insights from <span>Our Success Stories</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto', color: 'var(--gray-3)' }}>
              A collective summary of patient groups, conditions, and geographic origins highlighting our holistic and integrative care model.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '24px' }}>
            {/* Age Distribution Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay="0"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid var(--gray-2)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '24px', marginBottom: '20px' }}>
                <FaCalendarAlt />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark-2)', marginBottom: '10px', fontFamily: 'inherit' }}>Age Distribution</h3>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '8px' }}>45–75 Years</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6' }}>
                The most common age group seeking our support, indicating a strong preference for gentle, supportive therapy among mature adults.
              </p>
            </motion.div>

            {/* Cancer Types Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay="100"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid var(--gray-2)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '24px', marginBottom: '20px' }}>
                <FaStethoscope />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark-2)', marginBottom: '10px', fontFamily: 'inherit' }}>Cancer Types</h3>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '8px' }}>Breast, Lung, Liver & Stomach</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6' }}>
                Frequently reported cancers include breast, lung, liver, and stomach, where our botanical protocols act as a supportive aid.
              </p>
            </motion.div>

            {/* Geographic Reach Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay="200"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid var(--gray-2)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '24px', marginBottom: '20px' }}>
                <FaGlobe />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark-2)', marginBottom: '10px', fontFamily: 'inherit' }}>Geographic Reach</h3>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '8px' }}>Across India & Internationally</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6' }}>
                Supporting patients from multiple regions across India and internationally with customized remote consults and global deliveries.
              </p>
            </motion.div>

            {/* Treatment Stages Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay="300"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid var(--gray-2)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '24px', marginBottom: '20px' }}>
                <FaHourglassHalf />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark-2)', marginBottom: '10px', fontFamily: 'inherit' }}>Treatment Stages</h3>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '8px' }}>During Every Stage</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6' }}>
                Support is sought before, during, and after conventional treatments, helping reduce side effects and accelerate recovery.
              </p>
            </motion.div>

            {/* Family Involvement Card */}
            <motion.div
              data-aos="fade-up"
              data-aos-delay="400"
              whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid var(--gray-2)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(56, 190, 213, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '24px', marginBottom: '20px' }}>
                <FaUsers />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--dark-2)', marginBottom: '10px', fontFamily: 'inherit' }}>Family Involvement</h3>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '8px' }}>Active Caregivers</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-3)', lineHeight: '1.6' }}>
                Family members play an active role in administering care, monitoring nutritional charts, and keeping patient spirits high.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="section-padding" style={{ background: 'var(--gray-1)' }}>
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="section-badge"><FaFlask /> Clinical Case Studies</span>
            <h2 className="section-title">Evidence-Based <span>Outcomes</span></h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>A detailed review of patient biomarkers, treatments, and clinical timelines showcasing our integrative healing approach.</p>
          </div>

          <div className="tabs-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }} data-aos="fade-up">
            {caseStudies.map((study) => (
              <button
                key={study.id}
                onClick={() => setActiveTab(study.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: activeTab === study.id ? 'none' : '1px solid var(--primary-light)',
                  background: activeTab === study.id ? 'var(--gradient-primary)' : 'white',
                  color: activeTab === study.id ? 'white' : 'var(--primary-dark)',
                  cursor: 'pointer',
                  boxShadow: activeTab === study.id ? 'var(--shadow-primary)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {study.tabTitle}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{ background: 'white', borderRadius: '24px', padding: 'var(--card-padding-lg, 40px)', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '40px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)', fontSize: '18px' }}>
                      <FaNotesMedical />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark-2)' }}>{activeCaseStudy.patientName}</h3>
                      <div style={{ fontSize: '12px', color: 'var(--gray-3)' }}>Age/Gender: {activeCaseStudy.ageGender}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '6px' }}>Diagnosis</div>
                    <div style={{ fontSize: '14.5px', color: 'var(--dark-2)', fontWeight: '600' }}>{activeCaseStudy.diagnosis}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '12px' }}>
                      <FaRegChartBar style={{ color: 'var(--primary)' }} /> Biomarker Progression
                    </div>
                    <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                      <table style={{ width: '100%', minWidth: '280px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--gray-2)', textAlign: 'left' }}>
                            <th style={{ padding: '8px 0', color: 'var(--gray-3)', whiteSpace: 'nowrap' }}>Biomarker / Metric</th>
                            <th style={{ padding: '8px 0', color: '#EF4444', whiteSpace: 'nowrap' }}>Pre HCT</th>
                            <th style={{ padding: '8px 0', color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>Post HCT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeCaseStudy.biomarkers.map((bio, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--gray-1)' }}>
                              <td style={{ padding: '10px 10px 10px 0', fontWeight: '500', color: 'var(--dark-3)' }}>{bio.metric}</td>
                              <td style={{ padding: '10px 10px 10px 0', color: '#EF4444', fontWeight: '600', whiteSpace: 'nowrap' }}>{bio.pre}</td>
                              <td style={{ padding: '10px 0', color: 'var(--primary-dark)', fontWeight: '600', whiteSpace: 'nowrap' }}>{bio.post}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--secondary-light)', border: '1px solid rgba(37,99,235,0.15)', color: 'var(--primary-dark)', padding: '6px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginBottom: '24px' }}>
                      <FaRegClock /> {activeCaseStudy.duration}
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '8px' }}>
                        <FaRibbon style={{ color: 'var(--primary)' }} /> Supportive Herbal Protocol
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--dark-3)', lineHeight: '1.7', fontWeight: '500' }}>{activeCaseStudy.protocol}</p>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-3)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '8px' }}>
                        <FaBookmark style={{ color: 'var(--secondary)' }} /> Clinical Summary
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--gray-3)', lineHeight: '1.7' }}>{activeCaseStudy.clinicalSummary}</p>
                    </div>
                  </div>
                  <div style={{ background: 'var(--gray-1)', padding: '14px 18px', borderRadius: '12px', fontSize: '11px', color: 'var(--gray-3)', borderLeft: '3px solid var(--primary)', lineHeight: '1.5' }}>
                    <strong>Disclaimer:</strong> Herbal protocols are complementary support systems. Outcomes vary and should be administered in coordination with a certified oncologist.
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .rating-overview-container { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .rating-row { flex-direction: column !important; align-items: center !important; gap: 16px !important; width: 100% !important; }
          .rating-row .divider { display: none !important; }
          .tabs-container { flex-direction: column !important; align-items: center !important; width: 100% !important; gap: 8px !important; }
          .tabs-container button { width: 100% !important; text-align: center !important; padding: 10px 16px !important; }
        }
      `}</style>
    </>
  );
}