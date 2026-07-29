import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaClock, FaUser, FaCheckCircle, FaStar, FaLeaf, FaPlay } from 'react-icons/fa';

const ACCENT = '#38bed5';

const storyData = {
  1: {
    name: 'Mr. Sharath',
    condition: 'Hodgkin Lymphoma',
    status: 'Age 33 | Chemo No Response | NT & HCT Integration',
    videoUrl: 'https://www.youtube.com/embed/i5VuQjcV30w',
    thumbnail: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=1600&h=900',
    readTime: '10 min read',
    date: 'January 15, 2026',
    content: [
      {
        heading: 'The Diagnosis & Challenge',
        body: `Mr. Sharath was diagnosed with Hodgkin Lymphoma at the young age of 33. The diagnosis came as a profound shock, immediately introducing him to the aggressive world of clinical oncology. His medical team initiated standard first-line chemotherapy cycles, hoping for a swift and decisive response to target the lymphatic malignancy.`
      },
      {
        heading: 'Chemotherapy with No Response',
        body: `Unfortunately, after multiple exhausting rounds of conventional chemotherapy, follow-up imaging and clinical evaluations showed no response. The disease continued to progress, causing immense physical distress, severe weight loss, and critical organ strain. The conventional route alone was proving ineffective, leaving the family searching for alternative and complementary support mechanisms.`
      },
      {
        heading: 'Integrating Herbal Chemotherapy (HCT)',
        body: `Seeking to enhance his therapeutic options, Mr. Sharath decided to integrate a customized Herbal Chemotherapy (HCT) protocol alongside his standard salvage care. The medical and pharmacological teams worked together to formulate a strategy targeting non-dividing cancer cells and circulating tumor cells while protecting his vital organs from chemotherapy-induced toxicity.`
      },
      {
        heading: 'The Role of Nutritional Therapy (NT)',
        body: `A cornerstone of his recovery was the simultaneous initiation of intensive Nutritional Therapy (NT). Under strict dietary guidelines, Mr. Sharath focused on high-density botanical nutrition to optimize his metabolic health, strengthen his immune system, and repair the gut mucosal barrier, laying a strong foundation for his recovery.`
      },
      {
        heading: 'A Turnaround in Biomarkers',
        body: `Within months of starting the HCT and NT protocols, the results were visible in his laboratory reports. His tumor markers stabilized, and his immune system began showing active signs of recovery. Cellular markers that had been persistently abnormal started trending toward healthy ranges, demonstrating that HCT and conventional care could work synergistically.`
      },
      {
        heading: 'Restoring Vitality and Strength',
        body: `In addition to clinical improvements, Mr. Sharath experienced a dramatic return of physical strength. He successfully countered the debilitating muscle wasting and fatigue associated with advanced treatment, gaining back healthy body weight and restoring his overall quality-of-life score from a critical low to a highly functional level.`
      },
      {
        heading: 'Key Takeaways & Looking Forward',
        body: `Mr. Sharath's case is a powerful testament to the value of integrative oncology. Even in scenarios where standard chemotherapy initially fails to produce a response, combining it with targeted phytotherapy (HCT) and clinical nutritional therapy (NT) can support the body, manage toxicity, and help patients achieve clinical stability and renewed vitality.`
      }
    ]
  },
  2: {
    name: '78-Year-Old Patient (Shared by Daughter Kusuma)',
    condition: 'Blood Cancer (MDS)',
    status: 'Transfusion-Free & Active',
    videoUrl: 'https://www.youtube.com/embed/t6YiUIBDANk',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1600&h=900',
    readTime: '9 min read',
    date: 'March 5, 2026',
    content: [
      {
        heading: 'The Diagnosis: MDS & Age Challenges',
        body: `A female patient aged 78 was diagnosed with Myelodysplastic Syndrome (MDS), a form of blood cancer that prevents the bone marrow from producing enough healthy blood cells. At her advanced age, the diagnosis presented severe challenges. She suffered from extreme fatigue, severe anemia, and chronic pain, requiring biweekly blood transfusions to maintain minimal viability.`
      },
      {
        heading: 'Chemotherapy with Severe Side Effects',
        body: `Her medical team initiated conventional chemotherapy in an effort to control the disease progression. However, the aggressive treatment was too taxing on her elderly body. She developed severe side effects, including critical organ strain, extreme physical weakness, and debilitating nausea, making it impossible to continue the conventional protocol safely.`
      },
      {
        heading: 'Approaching Cancer Herbalist',
        body: `Faced with discontinued conventional options, the patient's family, led by her daughter Kusuma, approached the Cancer Herbalist clinic in Bangalore. Our team evaluated her specific hematological panel and organ capacity to draft a customized, non-toxic Herbal Nutraceutical Care Plan designed to stimulate natural blood synthesis and provide cellular protection.`
      },
      {
        heading: 'Immediate Recovery and Clinical Turnaround',
        body: `The response to the herbal nutraceutical care plan was immediate. Within just a few weeks of starting the protocol, the patient's blood counts stabilized. The most dramatic clinical milestone was that her biweekly blood transfusion requirement was completely eliminated, showing that her bone marrow was beginning to function adequately again.`
      },
      {
        heading: 'Restoring Independence and Mobility',
        body: `In addition to the stable hematological reports, the patient experienced a complete recovery of physical mobility. She was able to stand on her own legs, walk without support, and begin working on her daily activities independently. Her family observed a dramatic transformation in her physical stamina and energy levels.`
      },
      {
        heading: 'Significant Improvement in Pain & Quality of Life',
        body: `Her overall physical aura improved significantly, and her chronic pain levels dropped drastically. She regained a healthy appetite and stable sleep patterns. The clinical improvement in her quality of life was profound, providing immense relief and comfort to both the patient and her dedicated caregivers.`
      },
      {
        heading: 'Key Takeaways & Natural Healing',
        body: `This remarkable case highlights the efficacy of targeted, premium herbal nutraceuticals in elderly care. When aggressive conventional therapies cannot be tolerated, complementary botanical protocols offer a gentle, highly effective alternative to support hematological function, eliminate transfusion dependencies, and restore a happy, independent life. All these benefits can be seen only if the burden of cancer has been reduced to that extent.`
      }
    ]
  },
  3: {
    name: 'Stage IV Lung Cancer Patient',
    condition: 'Lung Cancer (Stage 4)',
    status: 'Complete PET Scan Remission',
    videoUrl: 'https://www.youtube.com/embed/3awpZRSwE1A',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1600&h=900',
    readTime: '11 min read',
    date: 'April 18, 2026',
    content: [
      {
        heading: 'The Metastatic Challenge',
        body: `In January 2018, a patient received a devastating diagnosis: Stage IV (Stage 4) Lung Cancer. Clinical imaging and PET scans revealed that the cancer was highly aggressive and had metastasized, spreading all over the body. The patient faced a challenging outlook as first-line oncology options and multiple therapies were failing to work in their favor.`
      },
      {
        heading: 'Seeking Nutritional Integration',
        body: `Confronted with progressive disease and declining vitality, the patient's family reached out to the Cancer Herbalist clinic in Bangalore to explore integrative options. The clinical focus turned to rebuilding cellular strength, correcting immunodeficiencies, and introducing targeted nutritional therapies to work alongside baseline medical care.`
      },
      {
        heading: 'The Nutrition Therapy Protocol',
        body: `The clinical team initiated an intensive Nutrition Therapy (NT) intervention. This highly customized care plan combined dense phytotherapy extracts with specialized antioxidant formulations and cell-protective herbs to target systemic inflammation and support normal respiratory cell functions.`
      },
      {
        heading: 'The July 2018 Turning Point',
        body: `The response to the clinical Nutrition Therapy intervention exceeded all expectations. In July 2018, just six months after starting the intensive integrative care plan, the patient underwent a follow-up whole-body PET scan. To the amazement of the medical staff, the scan failed to detect any active cancer in the entire body.`
      },
      {
        heading: 'Achieving Complete Remission',
        body: `The complete metabolic remission marked a grand success. Reversing systemic Stage IV metastasis demonstrated the power of restoring the body's natural defense mechanisms through precise nutrition and herbal medicine. The patient was declared cancer-free and successfully transitioned to a long-term preventative care program.`
      },
      {
        heading: 'Key Takeaways & Strong Will',
        body: `This grand success story highlights the potential of combining strong patient resolve with targeted nature-based therapies. Cancer Herbalist Bangalore remains dedicated to helping patients fight cancer at any stage, age, or condition. If you create a strong will to fight, nature and science can provide the path to healing.`
      }
    ]
  }
};

export default function StoryDetail() {
  const { id } = useParams();
  const story = storyData[parseInt(id)];

  if (!story) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#0f172a' }}>Story not found</h2>
        <Link to="/testimonials" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>← Back to Success Stories</Link>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero with Video */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '120px 20px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Back + Meta */}
          <Link to="/testimonials" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <FaArrowLeft /> Back to Success Stories
          </Link>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ background: ACCENT, color: '#fff', padding: '5px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 700 }}>
              {story.condition}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#10b981', padding: '5px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaCheckCircle style={{ fontSize: '10px' }} /> {story.status}
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.3, marginBottom: '10px' }}>
            {story.name}&apos;s Healing Journey
          </h1>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '30px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser /> {story.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> {story.readTime}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaStar style={{ color: '#FBBF24' }} /> Featured Story
            </span>
          </div>

          {/* YouTube Video Embed */}
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            borderRadius: '20px 20px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -4px 40px rgba(56,190,213,0.2)',
          }}>
            <iframe
              src={story.videoUrl}
              title={`${story.name} - ${story.condition}`}
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
        </div>
      </div>

      {/* Story Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Patient Quick Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #f0fdfe, #e0f7fa)',
            borderRadius: '20px',
            padding: '28px 32px',
            marginBottom: '48px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'center',
            border: '1px solid rgba(56,190,213,0.15)',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>Patient</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>{story.name}</div>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>Diagnosis</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{story.condition}</div>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>Current Status</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaCheckCircle style={{ fontSize: '14px' }} /> {story.status}
            </div>
          </div>
        </motion.div>

        {/* Article Sections */}
        {story.content.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            style={{ marginBottom: '40px' }}
          >
            <h2 style={{
              color: '#0f172a',
              fontSize: '1.4rem',
              fontFamily: 'Playfair Display, serif',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <FaLeaf style={{ color: ACCENT, fontSize: '16px', flexShrink: 0 }} />
              {section.heading}
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.9', fontSize: '1.02rem' }}>{section.body}</p>
          </motion.div>
        ))}

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '16px', padding: '20px 24px', marginBottom: '40px' }}>
          <p style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
            ⚠️ <strong>Medical Disclaimer:</strong> This patient story is shared for educational and inspirational purposes only. Individual results vary significantly. Herbal support protocols are complementary and should never replace conventional cancer treatment. Always consult your oncologist and healthcare team before making any changes to your treatment plan.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f0fdfe, #e0f7fa)', borderRadius: '24px', padding: '40px' }}>
          <h3 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '12px' }}>
            Ready to Start Your Healing Journey?
          </h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Book a free consultation with our herbal medicine specialists today.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: ACCENT,
              color: '#fff',
              padding: '14px 36px',
              borderRadius: '50px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '1rem',
              boxShadow: `0 8px 24px ${ACCENT}44`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${ACCENT}66`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${ACCENT}44`; }}
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
