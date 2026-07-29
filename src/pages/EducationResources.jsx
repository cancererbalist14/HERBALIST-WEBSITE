import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaClock, FaUser, FaBookOpen, FaLeaf, FaShieldAlt,
  FaAppleAlt, FaBrain, FaRunning, FaFlask, FaUtensils, FaRibbon,
  FaArrowRight, FaTimes, FaFilter, FaShareAlt, FaCheckCircle
} from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';
const DARK = '#0a1628';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: <FaBookOpen /> },
  { id: 'cancer-awareness', label: 'Cancer Awareness', icon: <FaRibbon /> },
  { id: 'cancer-prevention', label: 'Cancer Prevention', icon: <FaShieldAlt /> },
  { id: 'nutrition-guide', label: 'Nutrition Guide', icon: <FaAppleAlt /> },
  { id: 'herbal-medicine', label: 'Herbal Medicine', icon: <FaLeaf /> },
  { id: 'mental-wellness', label: 'Mental Wellness', icon: <FaBrain /> },
  { id: 'exercise-recovery', label: 'Exercise & Recovery', icon: <FaRunning /> },
  { id: 'research-updates', label: 'Research Updates', icon: <FaFlask /> },
  { id: 'healthy-recipes', label: 'Healthy Recipes', icon: <FaUtensils /> }
];

const INITIAL_ARTICLES = [
  {
    id: 1,
    title: '10 Early Warning Signs of Cancer That Should Never Be Ignored',
    category: 'cancer-awareness',
    categoryLabel: 'Cancer Awareness',
    author: 'Prof. Ramesh Babu',
    readTime: '8 min read',
    date: 'February 28, 2026',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Recognizing early warning signs of cancer—such as unexplained weight loss, persistent fatigue, unusual lumps, or chronic pain—can lead to timely diagnosis and significantly better treatment outcomes.',
    content: `Early detection remains one of the most effective determinants of successful cancer therapy. When tumor tissues are identified before extensive local invasion or distant metastasis, therapeutic interventions yield dramatically higher remission rates.

Key Red Flags to Monitor:
1. Unexplained Weight Loss: Losing 5 kg or more without dietary modifications can indicate metabolic shifts driven by cytokines released by tumor cells.
2. Persistent Fatigue: Cancer-related fatigue differs from normal tiredness and does not resolve with rest.
3. Skin & Mole Alterations: Asymmetry, irregular borders, color variation, or diameter shifts in skin lesions.
4. Chronic Pain or Indigestive Distress: Unexplained persistent pain in organs, abdomen, or joints.
5. Non-healing Sores or Persistent Coughing: Symptoms lasting over 3 weeks warrant immediate medical evaluation.`
  },
  {
    id: 2,
    title: 'T-Cells vs NK Cells: Your Body\'s Cancer-Fighting Immune Warriors',
    category: 'research-updates',
    categoryLabel: 'Research Updates',
    author: 'Dr. Ramesh Babu',
    readTime: '10 min read',
    date: 'March 15, 2026',
    image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Discover the two key immune cell types—T-cells and Natural Killer (NK) cells—that form your body\'s frontline defense against cancer, and learn how immunomodulatory botanicals enhance their activity.',
    content: `The human immune system relies on specialized lymphocytes to perform continuous immune surveillance throughout the body.

Natural Killer (NK) Cells:
NK cells constitute 5–15% of circulating lymphocytes and serve as rapid-response innate immune cells. They possess the unique capability to recognize and destroy malignant cells without prior antigen exposure or MHC restriction.

Cytotoxic T-Cells (CD8+):
T-cells belong to the adaptive immune system. They require antigen presentation to target specific tumor antigens with precision, forming long-term immunological memory.

Phytotherapeutic Enhancement:
Medicinal polysaccharide extracts (such as beta-1,3/1,6-glucans from Ganoderma lucidum and Trametes versicolor) bind to dectin-1 and CR3 receptors on innate immune cells, amplifying NK cell cytotoxic activity by up to 300%.`
  },
  {
    id: 3,
    title: 'Precision Nutrition & The Warburg Effect: Starving Cancer Cells',
    category: 'nutrition-guide',
    categoryLabel: 'Nutrition Guide',
    author: 'Clinical Nutrition Team',
    readTime: '7 min read',
    date: 'April 02, 2026',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Understanding how cancer cells preferentially utilize glucose (the Warburg Effect) allows us to design targeted low-glycemic, anti-inflammatory dietary charts to deprive tumor microenvironments.',
    content: `In 1931, Nobel laureate Otto Warburg discovered that cancer cells produce energy via a high rate of anaerobic glycolysis rather than oxidative phosphorylation, even in the presence of abundant oxygen.

Nutritional Principles:
1. Low-Glycemic Index Foods: Minimizing blood glucose spikes prevents hyperinsulinemia, reducing insulin-like growth factor 1 (IGF-1) signals that stimulate tumor proliferation.
2. Polyphenol-Rich Phytonutrients: Consuming cruciferous vegetables rich in sulforaphane and indole-3-carbinol supports Phase II liver detox pathways.
3. Healthy Medium-Chain Triglycerides (MCTs): Providing clean ketone bodies as cellular energy that healthy tissues utilize efficiency while tumor cells struggle to metabolize.`
  },
  {
    id: 4,
    title: 'Standardized Phytotherapy: How Active Botanical Compounds Inhibit Oncogenes',
    category: 'herbal-medicine',
    categoryLabel: 'Herbal Medicine',
    author: 'Prof. Ramesh Babu',
    readTime: '9 min read',
    date: 'March 22, 2026',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'High-purity botanical extracts like curcumin, EGCG, and boswellic acids down-regulate inflammatory NF-kB signaling and inhibit angiogenesis in solid tumors.',
    content: `Herbal Chemotherapy (HCT) utilizes purified, standardized phytochemicals to target cellular signaling cascades involved in tumor survival and angiogenesis.

Key Botanical Actives:
- Curcuminoids (Curcuma longa): Inhibits NF-kB, COX-2, and cyclin D1, promoting cell cycle arrest.
- Epigallocatechin Gallate (EGCG from Green Tea): Suppresses VEGF receptor phosphorylation, reducing tumor vascularization.
- Boswellic Acids (Boswellia serrata): Inhibits 5-LOX inflammatory pathway and mitigates peritumoral edema.`
  },
  {
    id: 5,
    title: 'Mind-Body Resilience: The Neuro-Endocrine-Immune Connection',
    category: 'mental-wellness',
    categoryLabel: 'Mental Wellness',
    author: 'Integrative Wellness Board',
    readTime: '6 min read',
    date: 'January 18, 2026',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Chronic stress elevates cortisol and catecholamines, impairing NK cell surveillance. Learn evidence-based mindfulness and breathwork practices that restore autonomic nervous balance.',
    content: `Psycho-neuro-immunology (PNI) demonstrates the direct physical pathways connecting emotional state, hypothalamic-pituitary-adrenal (HPA) axis regulation, and immune function.

Key Interventions:
- Diaphragmatic Breathwork: Activates the vagus nerve, reducing circulating stress hormones.
- Guided Imagery & Meditation: Modulates inflammatory cytokine production (IL-6, TNF-alpha).`
  },
  {
    id: 6,
    title: 'Gentle Physical Movement & Lymphatic Drainage During Chemo',
    category: 'exercise-recovery',
    categoryLabel: 'Exercise & Recovery',
    author: 'Physical Rehabilitation Team',
    readTime: '6 min read',
    date: 'February 10, 2026',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Structured low-impact exercise stimulates lymphatic circulation, reduces chemo-induced peripheral neuropathy, and maintains lean muscle mass.',
    content: `Unlike the vascular system, the lymphatic system relies on muscle contractions to circulate lymph fluid and clear cellular metabolic waste.

Recommended Regimens:
1. Daily Gentle Walking (20-30 mins): Stimulates circulation without causing physical exhaustion.
2. Restorative Yoga & Stretching: Enhances joint mobility and mitigates joint pain from hormone therapies.`
  },
  {
    id: 7,
    title: 'Primary Cancer Prevention: Environmental Toxin Audits',
    category: 'cancer-prevention',
    categoryLabel: 'Cancer Prevention',
    author: 'Environmental Health Board',
    readTime: '7 min read',
    date: 'May 04, 2026',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Practical strategies to eliminate endocrine disruptors, heavy metals, and synthetic microplastics from your household and daily routine.',
    content: `Reducing body burden—the cumulative accumulation of synthetic chemicals—is a core pillar of long-term cancer prevention.

Action Steps:
- Filter Drinking Water: Utilize reverse osmosis (RO) to remove pesticides and heavy metals.
- Avoid Plastics in Food Prep: Use glass or stainless steel containers to prevent phthalate leaching.`
  },
  {
    id: 8,
    title: 'Anti-Inflammatory Golden Herbal Elixir & Nourishing Soups',
    category: 'healthy-recipes',
    categoryLabel: 'Healthy Recipes',
    author: 'Nutritional Kitchen',
    readTime: '5 min read',
    date: 'April 15, 2026',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Easy-to-prepare, highly bioavailable recipes featuring fresh turmeric, ginger, black pepper, and organic bone broth to soothe GI mucosa during treatment.',
    content: `Ingredients:
- 1 inch fresh Turmeric root (grated)
- 1 inch fresh Ginger root (grated)
- Pinch of cracked Black Pepper (enhances curcumin absorption by 2000%)
- 1 tsp Cold-pressed Coconut Oil
- 2 cups Organic Vegetable or Bone Broth

Simmer gently for 15 minutes. Strain and sip warm twice daily to calm digestive inflammation.`
  }
];

export default function EducationResources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'all';
  
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);

  useEffect(() => {
    const fetchDynamic = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-blogs`);
        const data = await res.json();
        if (data.success && data.blogs && data.blogs.length > 0) {
          const formatted = data.blogs.map((b, idx) => ({
            id: b.id || `dyn-${idx}`,
            title: b.title,
            category: b.category ? b.category.toLowerCase().replace(/\s+/g, '-') : 'research-updates',
            categoryLabel: b.category || 'Research Updates',
            author: b.author || 'Clinical Board',
            readTime: b.readTime || '7 min read',
            date: b.date || '2026',
            image: b.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
            excerpt: b.excerpt || '',
            content: b.content || b.excerpt || ''
          }));
          // Deduplicate: only add dynamic articles not already present (by title)
          setArticles(prev => {
            const existingTitles = new Set(prev.map(a => a.title.trim().toLowerCase()));
            const newOnly = formatted.filter(a => !existingTitles.has(a.title.trim().toLowerCase()));
            return newOnly.length > 0 ? [...prev, ...newOnly] : prev;
          });
        }
      } catch (err) {
        console.warn('Failed to load external articles:', err);
      }
    };
    fetchDynamic();
  }, []);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const filteredArticles = articles.filter(art => {
    const matchesCat = activeCategory === 'all' || art.category === activeCategory || art.category.includes(activeCategory);
    const matchesSearch = searchTerm === '' || 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a6e52 50%, #0f3460 100%)',
        padding: '140px 20px 80px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: ACCENT, opacity: 0.15, filter: 'blur(90px)' }} />
        
        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            background: `${ACCENT}22`,
            border: `1px solid ${ACCENT}55`,
            color: ACCENT,
            padding: '8px 24px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '18px'
          }}>
            📚 Patient Education & Knowledge Hub
          </span>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 800,
            marginBottom: '20px',
            lineHeight: 1.2
          }}>
            Education <span style={{ color: ACCENT }}>Resources</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: '1.8',
            maxWidth: '720px',
            margin: '0 auto 36px'
          }}>
            Empowering cancer patients, survivors, and families with evidence-based guides across 8 essential health categories.
          </p>

          {/* Search Input */}
          <div style={{ position: 'relative', maxWidth: '540px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search articles by topic, keyword, or herb..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 24px 16px 54px',
                borderRadius: '50px',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                background: '#fff',
                color: DARK
              }}
            />
            <FaSearch style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '18px' }} />
          </div>
        </div>
      </section>

      {/* CATEGORY BAR */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: '70px',
        zIndex: 90,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  border: isActive ? `1.5px solid ${PRIMARY}` : '1px solid #e2e8f0',
                  background: isActive ? PRIMARY : '#f8fafc',
                  color: isActive ? '#fff' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '14px', color: isActive ? '#fff' : ACCENT }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN ARTICLES GRID */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 100px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, margin: 0 }}>
              {activeCategory === 'all' ? 'All Educational Guides' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '4px 0 0' }}>
              Showing {filteredArticles.length} articles
            </p>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '60px 20px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <FaBookOpen style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: DARK, margin: '0 0 8px' }}>No resources found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your search terms or select another category above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '32px' }}>
            {filteredArticles.map(art => (
              <motion.div
                key={art.id}
                whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
                style={{
                  background: '#fff',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedArticle(art)}
              >
                <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                  <img
                    src={art.image}
                    alt={art.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: PRIMARY,
                    color: '#fff',
                    padding: '5px 14px',
                    borderRadius: '50px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {art.categoryLabel}
                  </span>
                </div>

                <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: DARK, margin: '0 0 12px', lineHeight: 1.4 }}>
                    {art.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.7', margin: '0 0 20px', flex: 1 }}>
                    {art.excerpt}
                  </p>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser /> {art.author}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> {art.readTime}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ARTICLE FULL MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,22,40,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} onClick={() => setSelectedArticle(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '28px',
                maxWidth: '800px',
                maxHeight: '90vh',
                width: '100%',
                overflowY: 'auto',
                padding: 'clamp(24px, 5vw, 44px)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: DARK,
                  fontSize: '18px'
                }}
              >
                <FaTimes />
              </button>

              <span style={{ background: `${PRIMARY}15`, color: PRIMARY, padding: '6px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedArticle.categoryLabel}
              </span>

              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: DARK, marginTop: '16px', marginBottom: '16px', lineHeight: 1.3 }}>
                {selectedArticle.title}
              </h2>

              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                <span>✍️ {selectedArticle.author}</span>
                <span>⏱️ {selectedArticle.readTime}</span>
                <span>📅 {selectedArticle.date}</span>
              </div>

              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '20px', marginBottom: '28px' }}
              />

              <div style={{ color: '#334155', lineHeight: '1.9', fontSize: '1.02rem', whiteSpace: 'pre-line' }}>
                {selectedArticle.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
