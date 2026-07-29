import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaClock, FaUser } from 'react-icons/fa';
import { useContent } from '../context/ContentContext';

const ACCENT = '#38bed5';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

const blogs = [
  {
    id: 1,
    title: 'A Remarkable Prostate Cancer Journey: When Symptoms Were Not Obvious',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    category: 'Nutrition',
    author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'February 21, 2026',
    excerpt: 'A 74-year-old man\'s prostate cancer diagnosis was delayed due to atypical symptoms. Learn how elevated PSA levels led to diagnosis and explore the role of supportive nutrition in his cancer care journey.',
  },
  {
    id: 2,
    author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'March 10, 2026',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    category: "Cancer Research",
    title: "The Rise of Precision Oncology: How Personalized Cancer Treatment Is Changing Lives",
    excerpt: "Discover how genetic testing, artificial intelligence, targeted therapies, and immunotherapy are transforming cancer treatment through personalized care and improved patient outcomes.",
  },

 {
    id: 3,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
   author: 'By Prof. Ramesh  ',
    readTime: '8 min read',
    date: 'February 28, 2026',
    category: "Cancer Awareness",
title: "10 Early Warning Signs of Cancer That Should Never Be Ignored",
excerpt: "Recognizing early warning signs of cancer—such as unexplained weight loss, persistent fatigue, unusual lumps, or chronic pain—can lead to timely diagnosis and significantly better treatment outcomes.",
  
},
];

export default function Blog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [allBlogs, setAllBlogs] = useState(blogs);
  const { content } = useContent();
  const contactInfo = content?.contact || {
    phone: '+91 88845 88835',
    email: 'cancerherbalist@gmail.com',
    whatsapp: '918884588835',
    timings: 'Mon–Sat, 9 AM–6 PM',
    address: 'Bangalore, India'
  };

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-blogs`);
        const data = await res.json();
        if (data.success && data.blogs) {
          setAllBlogs(data.blogs);
        }
      } catch (err) {
        console.warn('Failed to load dynamic blogs:', err);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = allBlogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: '130px 20px 70px', textAlign: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
        <div style={{ display: 'inline-block', padding: '8px 18px', borderRadius: '999px', background: '#dbeafe', color: ACCENT, fontWeight: '600', marginBottom: '20px' }}>
          Latest Articles &amp; Research
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#0f172a', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>
          Educational Blog
        </h1>
        <p style={{ maxWidth: '700px', margin: '0 auto 30px', color: '#64748b', lineHeight: '1.8', fontSize: '1.1rem' }}>
          Expert guidance on cancer awareness, nutrition, herbal support, wellness, and recovery.
        </p>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search articles by title, category, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              borderRadius: '999px',
              border: '1.5px solid #e2e8f0',
              outline: 'none',
              fontSize: '15px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = ACCENT;
              e.target.style.boxShadow = `0 4px 20px ${ACCENT}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
          />
          <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }} />
        </div>
      </section>

      {/* Blog Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
        <h2 style={{ marginBottom: '40px', color: '#0f172a', fontSize: '2rem', fontFamily: 'Playfair Display, serif' }}>
          {search ? `Results for "${search}"` : 'Recent Articles'}
        </h2>

        {filtered.length === 0 && (
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No articles found. Try a different search term.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '30px' }}>
          {filtered.map((blog) => (
            <div
              key={blog.id}
              style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: 'transform 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onClick={() => navigate(`/blog/${blog.id}`)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
                <img
                  src={blog.image}
                  alt={blog.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                />
                <span style={{ position: 'absolute', top: '16px', left: '16px', background: ACCENT, color: '#fff', padding: '4px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700 }}>
                  {blog.category}
                </span>
              </div>

              <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginTop: '0', color: '#0f172a', lineHeight: '1.4', fontSize: '1.1rem', fontFamily: 'Playfair Display, serif' }}>{blog.title}</h3>
                <p style={{ marginTop: '12px', color: '#64748b', lineHeight: '1.7', fontSize: '0.95rem' }}>{blog.excerpt}</p>

                <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser />{blog.author}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock />{blog.readTime}</span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/blog/${blog.id}`); }}
                  style={{ marginTop: 'auto', paddingTop: '20px', background: ACCENT, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Consultation CTA Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1a6e52 0%, #114a37 100%)', 
        padding: '90px 20px', 
        textAlign: 'center', 
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background shapes */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(56, 190, 213, 0.1)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(56, 190, 213, 0.15)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ 
            display: 'inline-block', 
            background: 'rgba(56, 190, 213, 0.2)', 
            color: '#38bed5', 
            padding: '8px 20px', 
            borderRadius: '999px', 
            fontSize: '14px', 
            fontWeight: 700, 
            letterSpacing: '1px', 
            textTransform: 'uppercase',
            marginBottom: '20px',
            border: '1px solid rgba(56, 190, 213, 0.3)'
          }}>
            Personalized Guidance
          </span>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontFamily: 'Playfair Display, serif', 
            margin: '0 0 20px',
            lineHeight: 1.2
          }}>
            Confused About Your Cancer Treatment Options?
          </h2>
          <p style={{ 
            maxWidth: '650px', 
            margin: '0 auto 40px', 
            opacity: 0.9, 
            fontSize: '1.1rem',
            lineHeight: '1.8'
          }}>
            Schedule a complimentary discovery call with our experts to discuss your health challenges. Learn how safe, personalized herbal protocols can complement your recovery.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => navigate('/contact')}
              style={{ 
                background: '#38bed5', 
                color: '#fff', 
                border: 'none', 
                padding: '16px 36px', 
                borderRadius: '999px', 
                fontWeight: 750, 
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                boxShadow: '0 8px 20px rgba(56, 190, 213, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = '#2bb0c7';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(56, 190, 213, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#38bed5';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(56, 190, 213, 0.3)';
              }}
            >
              Book Free Consultation
            </button>
            <a 
              href={`https://wa.me/${contactInfo.whatsapp}?text=Hi!%20I%20read%20your%20blog%20and%20would%20like%20to%20know%20more%20about%20herbal%20cancer%20protocols.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.3)', 
                padding: '16px 36px', 
                borderRadius: '999px', 
                fontWeight: 750, 
                cursor: 'pointer',
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, background-color 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}