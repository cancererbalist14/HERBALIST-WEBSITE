import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaClock, FaUser, FaCalendarAlt, FaLeaf } from 'react-icons/fa';

const ACCENT = '#38bed5';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://cancer-herbalist-rhgj.vercel.app').replace(/\/+$/, '');

const blogData = {
  1: {
    title: 'A Remarkable Prostate Cancer Journey: When Symptoms Were Not Obvious',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=80',
    category: 'Nutrition',
    author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'February 21, 2026',
    content: [
     {
heading: 'Introduction',
body: `Prostate cancer often develops silently, with many patients experiencing few or no noticeable symptoms during the early stages. This patient story highlights the journey of a 74-year-old man whose diagnosis was delayed because most of the classic signs of prostate cancer were absent. His initial symptoms were unexplained weight loss and reduced appetite, leading to multiple medical consultations before further investigations revealed significantly elevated PSA levels, an enlarged prostate, and ultimately a diagnosis of prostate cancer.`
},
{
heading: 'A Challenging Diagnosis',
body: `The patient's journey to diagnosis was not straightforward. Despite repeated visits to physicians, the underlying cause remained uncertain because the typical urinary symptoms commonly associated with prostate cancer were largely absent. Additional testing eventually revealed a markedly elevated Prostate-Specific Antigen (PSA) level and an enlarged prostate gland. Following specialist evaluation by oncologists, prostate cancer was confirmed. This case demonstrates how prostate cancer can sometimes present atypically and highlights the importance of thorough medical evaluation when unexplained weight loss or appetite changes occur in older adults.`
},
{
heading: 'Treatment Decisions and Family Considerations',
body: `Following the diagnosis, the family faced a difficult decision regarding treatment options. Surgery, chemotherapy, and radiation therapy were all considered. Given the patient's age and concerns regarding treatment-related side effects and quality of life, the family explored supportive nutritional approaches while remaining under medical supervision. Their goal was to support overall health and well-being while carefully monitoring disease progression and treatment outcomes.`
},
{
heading: 'Nutritional Support Program',
body: `The patient began a structured nutritional support program that incorporated foods, herbs, and nutrients commonly recognized for their health-supporting properties. These included turmeric, ginger, black pepper, tulasi (holy basil), ashwagandha, amla, tomatoes, grapes, and Coenzyme Q10 (CoQ10). During the first month, the family observed improvements in appetite, energy levels, and overall clinical well-being. However, PSA levels initially remained elevated, prompting continued monitoring and ongoing discussions regarding all available treatment options.`
},
{
heading: 'Encouraging Clinical Progress',
body: `With continued nutritional support and regular follow-up, subsequent assessments revealed encouraging changes. Over time, the patient's PSA levels decreased substantially from approximately 443 ng/mL to 55 ng/mL. The family viewed these developments positively and continued their chosen care plan while maintaining regular medical supervision. Every patient's cancer journey is unique, and outcomes can vary significantly. Nevertheless, this experience reinforced the value of persistence, monitoring, and informed decision-making throughout treatment.`
},
{
heading: 'Lessons from This Patient Story',
body: `This case highlights several important observations. Prostate cancer may occasionally present without obvious urinary symptoms, making diagnosis more challenging. Unexplained weight loss and reduced appetite should never be ignored, particularly in older adults. Elevated PSA levels require appropriate medical evaluation and follow-up. Treatment decisions should be individualized based on age, overall health, cancer stage, and patient preferences. Supportive nutritional strategies may contribute to overall wellness and quality of life when used as part of a comprehensive care approach.`
},
{
heading: 'Frequently Asked Questions',
body: `What are the early symptoms of prostate cancer? Early prostate cancer may not cause noticeable symptoms, although some patients experience urinary difficulties, frequent urination, or pelvic discomfort. What is PSA? Prostate-Specific Antigen (PSA) is a protein produced by the prostate gland, and elevated levels may indicate prostate cancer or other prostate conditions. Does a high PSA level always mean cancer? No, elevated PSA levels can also occur due to benign prostate enlargement or inflammation. Can nutrition support cancer patients? Good nutrition may help support overall health, immune function, energy levels, and quality of life during treatment. Patients should always consult qualified healthcare professionals regarding treatment and nutritional decisions.`
},
{
heading: 'Conclusion',
body: `This patient's journey demonstrates that prostate cancer can sometimes present in unexpected ways, making diagnosis more complex. Through continued monitoring, informed decision-making, and a commitment to supportive care, the patient and family navigated a challenging situation with determination and hope. While every individual's experience is different, the story underscores the importance of early investigation, personalized treatment planning, and comprehensive support throughout the cancer care journey.`
}

    ]
  },
  2: {
    title: 'The Rise of Precision Oncology: How Personalized Cancer Treatment Is Changing Lives',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80',
    category: 'Cancer Research',
    author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'March 10, 2026',
    content: [
     {
heading: 'Introduction',
body: `Cancer treatment is undergoing a revolutionary transformation. Rather than treating all patients with the same approach, modern oncology is increasingly focused on precision medicine—an approach that tailors treatment based on the unique genetic and molecular characteristics of a patient's cancer. Advances in genomic testing, artificial intelligence, and targeted therapies are enabling consultants to select treatments that are more effective and potentially less toxic than traditional approaches.`
},
{
heading: 'What is Precision Oncology?',
body: `Precision oncology is a personalized approach to cancer treatment that uses information about a patient's genes, proteins, and tumor characteristics to guide medical decisions. Through advanced diagnostic technologies such as genomic sequencing and biomarker testing, oncologists can identify specific mutations driving cancer growth and select therapies that directly target those abnormalities. This represents a significant shift from the traditional one-size-fits-all model of cancer care.`
},
{
heading: 'The Growing Role of Genetic Testing',
body: `Genetic and molecular testing have become increasingly important in modern cancer care. By analyzing tumor DNA, clinicians can identify actionable mutations associated with cancers such as lung cancer, breast cancer, colorectal cancer, prostate cancer, and melanoma. These findings help determine whether patients may benefit from targeted therapies, immunotherapy, or participation in clinical trials exploring innovative treatment approaches.`
},
{
heading: 'Artificial Intelligence in Cancer Diagnosis',
body: `Artificial intelligence is rapidly becoming a valuable tool in oncology. AI-powered systems can analyze medical images, pathology slides, and genomic data with remarkable speed and accuracy. Researchers are developing algorithms capable of detecting early-stage cancers, predicting treatment responses, and helping clinicians identify personalized treatment options. While AI is not replacing oncologists, it is increasingly serving as a powerful decision-support tool.`
},
{
heading: 'Targeted Therapy and Immunotherapy Advances',
body: `Recent years have seen significant progress in targeted therapies and immunotherapy. Targeted drugs are designed to attack specific molecules involved in cancer growth while minimizing damage to healthy cells. Immunotherapy works differently by helping the immune system recognize and destroy cancer cells. New combinations of immunotherapy and targeted treatments are showing promising results across multiple cancer types and continue to be a major focus of cancer research worldwide.`
},
{
heading: 'Benefits and Challenges',
body: `Personalized cancer treatment offers several potential benefits, including improved treatment effectiveness, reduced side effects, and better quality of life. However, challenges remain. Advanced genetic testing may not be accessible to all patients, some cancers do not yet have effective targeted therapies, and treatment costs can be substantial. Ongoing research aims to expand access and improve outcomes for a wider range of patients.`
},
{
heading: 'How Lifestyle and Nutrition Still Matter',
body: `Even as cancer treatment becomes increasingly sophisticated, foundational health practices remain important. Proper nutrition, regular physical activity, adequate sleep, stress management, and adherence to medical recommendations can help support overall well-being during cancer treatment. Integrative care approaches often combine evidence-based medical treatment with nutritional and lifestyle support to optimize patient outcomes and quality of life.`
},
{
heading: 'Conclusion',
body: `Precision oncology represents one of the most exciting developments in modern cancer care. By leveraging genetic insights, advanced diagnostics, artificial intelligence, and innovative therapies, healthcare professionals are moving closer to truly personalized cancer treatment. As research continues to advance, patients can expect increasingly targeted, effective, and individualized approaches to cancer management in the years ahead.`
}

    ]
  },
  3: {
    title: '10 Early Warning Signs of Cancer That Should Never Be Ignored',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
    category: 'Cancer Awareness',
    author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'February 28, 2026',
    content: [
      {
  heading: 'Introduction',
  body: `Early detection remains one of the most important factors in improving cancer outcomes. While many symptoms may be caused by non-cancerous conditions, persistent or unexplained changes in your body should never be ignored. Recognizing potential warning signs and seeking timely medical evaluation can significantly increase treatment options and improve prognosis.`
},
{
  heading: 'Unexplained Weight Loss',
  body: `Losing weight without changes to diet or exercise may be an early warning sign of several cancers, including pancreatic, stomach, lung, and esophageal cancers. A sudden loss of more than 5% of body weight over a short period should be discussed with a healthcare professional.`
},
{
  heading: 'Persistent Fatigue',
  body: `Cancer-related fatigue differs from ordinary tiredness. It often persists despite adequate rest and may interfere with daily activities. Persistent exhaustion can be associated with blood cancers, colon cancer, stomach cancer, and many other conditions that require medical evaluation.`
},
{
  heading: 'Changes in Bowel or Bladder Habits',
  body: `Long-lasting constipation, diarrhea, blood in stool, difficulty urinating, or changes in urinary frequency should not be ignored. These symptoms can sometimes indicate colorectal, bladder, or prostate cancer, among other medical conditions.`
},
{
  heading: 'Persistent Pain',
  body: `Pain that continues for weeks or months without a clear cause warrants investigation. Chronic headaches, bone pain, abdominal pain, or unexplained back pain may occasionally be linked to underlying cancers and should be evaluated by a healthcare provider.`
},
{
  heading: 'Unusual Lumps or Swelling',
  body: `Any new lump, thickening, or swelling in the breast, neck, testicles, armpits, or elsewhere in the body should be examined by a medical professional. While many lumps are benign, early assessment is important for accurate diagnosis.`
},
{
  heading: 'Changes in Skin Appearance',
  body: `New moles, changes in existing moles, sores that do not heal, or unusual skin discoloration can be warning signs of skin cancer. The ABCDE rule—Asymmetry, Border irregularity, Color variation, Diameter, and Evolution—can help identify suspicious lesions.`
},
{
  heading: 'Persistent Cough or Hoarseness',
  body: `A cough lasting more than several weeks, coughing up blood, or persistent hoarseness may indicate respiratory or throat-related conditions that require prompt medical evaluation. Smokers and former smokers should be particularly vigilant.`
},
{
  heading: 'The Importance of Early Detection',
  body: `Many cancers are more treatable when diagnosed in their early stages. Regular health screenings, awareness of family history, healthy lifestyle choices, and prompt attention to unusual symptoms can all contribute to earlier diagnosis and better outcomes.`
},
{
  heading: 'Conclusion',
  body: `Most warning signs do not automatically mean cancer, but persistent symptoms should never be ignored. If you experience unexplained changes in your health, consult a qualified healthcare professional for proper evaluation. Early action can make a significant difference in treatment options and long-term health outcomes.`
}
    ]
  }
};

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = React.useState(() => blogData[parseInt(id)]);

  React.useEffect(() => {
    const checkDynamic = async () => {
      let apiSucceeded = false;
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-blogs`);
        const data = await res.json();
        if (data.success && data.blogs) {
          apiSucceeded = true;
          const found = data.blogs.find(b => b.id === parseInt(id));
          if (found) {
            setBlog({
              title: found.title,
              image: found.image,
              category: found.category,
              author: found.author,
              readTime: found.readTime,
              date: found.date,
              content: Array.isArray(found.content)
                ? found.content
                : [{ heading: 'Content', body: found.content || found.excerpt }]
            });
          } else {
            setBlog(null);
          }
        }
      } catch (e) {
        console.warn('Failed to load dynamic blog details:', e);
      }

      if (!apiSucceeded) {
        const foundStatic = blogData[parseInt(id)];
        if (foundStatic) {
          setBlog(foundStatic);
        }
      }
    };
    checkDynamic();
  }, [id]);

  React.useEffect(() => {
    if (!blog) return;

    // 1. Update Title
    const pageTitle = `${blog.title} | Cancer Herbalist Blog`;
    document.title = pageTitle;

    // 2. Update Meta Description
    const excerpt = blog.content[0]?.body ? blog.content[0].body.substring(0, 155) + '...' : '';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', excerpt);

    // 3. Update OG Tags
    const updateOGTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', pageTitle);
    updateOGTag('og:description', excerpt);
    updateOGTag('og:url', window.location.href);
    updateOGTag('og:image', blog.image);
    updateOGTag('og:type', 'article');

    // 4. Inject BlogPosting Schema Markup
    const existingScript = document.getElementById('seo-schema-markup');
    if (existingScript) {
      existingScript.remove();
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': blog.title,
      'image': blog.image,
      'datePublished': blog.date,
      'author': {
        '@type': 'Person',
        'name': 'Prof. Ramesh Babu'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Cancer Herbalist',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.cancerherbalist.com/logo.png'
        }
      },
      'description': excerpt
    };

    const script = document.createElement('script');
    script.id = 'seo-schema-markup';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const scriptToRemove = document.getElementById('seo-schema-markup');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [blog]);

  if (!blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#0f172a' }}>Article not found</h2>
        <Link to="/blog" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>← Back to Blog</Link>
      </div>
    );
  }


  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,30,60,0.85) 0%, rgba(10,30,60,0.45) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 5%', maxWidth: '860px' }}>
          <Link to="/blog" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
            <FaArrowLeft /> Back to Blog
          </Link>
          <span style={{ background: ACCENT, color: '#fff', padding: '4px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, width: 'fit-content', marginBottom: '16px' }}>{blog.category}</span>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem,3.5vw,2.4rem)', fontFamily: 'Playfair Display, serif', lineHeight: 1.3 }}>{blog.title}</h1>
          <div style={{ display: 'flex', gap: '24px', marginTop: '18px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser />{blog.author}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt />{blog.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock />{blog.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 20px' }}>
        {blog.content.map((section, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}
            style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#0f172a', fontSize: '1.4rem', fontFamily: 'Playfair Display, serif', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaLeaf style={{ color: ACCENT, fontSize: '16px', flexShrink: 0 }} />{section.heading}
            </h2>
            <p style={{ color: '#475569', lineHeight: '1.9', fontSize: '1.02rem' }}>{section.body}</p>
          </motion.div>
        ))}

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '16px', padding: '20px 24px', marginBottom: '40px' }}>
          <p style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.7' }}>
            ⚠️ <strong>Medical Disclaimer:</strong> This article is for educational purposes only and does not constitute medical advice. Always consult your oncologist and healthcare team before making any changes to your treatment or supplement regimen.
          </p>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f0fdfe, #e0f7fa)', borderRadius: '24px', padding: '40px' }}>
          <h3 style={{ color: '#0f172a', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '12px' }}>Ready to Start Your Healing Journey?</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Book a free consultation with our herbal medicine specialists today.</p>
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
            }}
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
