import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaShieldAlt, FaLeaf, FaCheck, FaArrowLeft,
  FaWhatsapp, FaPhoneAlt, FaShoppingBag, FaTruck,
  FaUndo, FaAward, FaChevronDown, FaChevronUp,
  FaTimes, FaPaperPlane, FaSpinner, FaCheckCircle, FaHeart, FaRegHeart, FaShoppingCart
} from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

// ── Shared product data (must match Store.jsx) ─────────────────────────────
import productsData from '../../backend/data/products.json';
export const products = productsData;

function StarRating({ rating, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <FaStar
            key={n}
            style={{
              color: n <= Math.round(rating) ? '#f59e0b' : '#e2e8f0',
              fontSize: '14px',
            }}
          />
        ))}
      </div>
      <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>{rating}</span>
      <span style={{ color: '#94a3b8', fontSize: '13px' }}>({count} verified reviews)</span>
    </div>
  );
}

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '16px 0', background: 'none',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>{title}</span>
        {open ? <FaChevronUp style={{ color: '#94a3b8' }} /> : <FaChevronDown style={{ color: '#94a3b8' }} />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ paddingBottom: '16px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

// ── Enquiry Modal ────────────────────────────────────────────────────────────
function EnquiryModal({ product, onClose }) {
  const ACCENT = '#38bed5';
  const PRIMARY = '#1a6e52';

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    message: `Hi, I am interested in ${product.name} (₹${product.price.toLocaleString('en-IN')}). Please share more details.`,
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.phone.trim()) return 'Please enter your phone number.';
    if (!form.email.trim()) return 'Please enter your email address.';
    return null;
  };

  const handleEmailSend = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg('');
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key:       WEB3FORMS_KEY,
          subject:          `🌿 Product Enquiry — ${product.name}`,
          from_name:        form.name,
          email:            form.email,   // Web3Forms uses this as reply-to
          // ── Fields that appear in the email body ──
          'Customer Name':    form.name,
          'Customer Phone':   form.phone,
          'Customer Email':   form.email,
          'Product':          product.name,
          'Category':         product.category,
          'Price':            `₹${product.price.toLocaleString('en-IN')}`,
          'Message':          form.message || 'No additional message.',
          'Product URL':      `${window.location.origin}/store/${product.id}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMsg('Failed to send. Please try WhatsApp below.');
    }
  };

  const waText = encodeURIComponent(
    `Hi, I am interested in *${product.name}* (₹${product.price.toLocaleString('en-IN')}).\n` +
    (form.name ? `Name: ${form.name}\n` : '') +
    (form.phone ? `Phone: ${form.phone}\n` : '') +
    `\n${form.message}`
  );

  const inStyle = {
    width: '100%', padding: '12px 16px', marginBottom: '14px',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    color: '#0f172a', boxSizing: 'border-box',
    fontFamily: 'Poppins, sans-serif', transition: 'border-color 0.2s',
  };
  const focus = (e) => (e.target.style.borderColor = ACCENT);
  const blur = (e) => (e.target.style.borderColor = '#e2e8f0');

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,20,40,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Modal card */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '24px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: '480px',
            maxHeight: '92vh', overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* ── Close button ── */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', fontSize: '16px', zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <FaTimes />
          </button>

          {/* ── Product Banner ── */}
          <div style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            borderRadius: '24px 24px 0 0',
            padding: '28px 28px 22px',
            display: 'flex', gap: '16px', alignItems: 'center',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              overflow: 'hidden', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {product.images?.[0] ? (
                <img
                  src={product.images[0]} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px', boxSizing: 'border-box' }}
                />
              ) : (
                <span style={{ fontSize: '32px' }}>{product.icon}</span>
              )}
            </div>
            <div>
              <p style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px'
              }}>
                Product Enquiry
              </p>
              <h3 style={{
                color: '#fff', fontFamily: 'Playfair Display, serif',
                fontSize: '1.15rem', margin: '0 0 6px', lineHeight: 1.3
              }}>
                {product.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span style={{
                  color: 'rgba(255,255,255,0.55)', fontSize: '13px',
                  textDecoration: 'line-through'
                }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>

              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '28px' }}>

            {status === 'success' ? (
              /* ── Success state ── */
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: `${ACCENT}18`, border: `3px solid ${ACCENT}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: '32px', color: ACCENT,
                }}>
                  <FaCheckCircle />
                </div>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif', color: '#0f172a',
                  fontSize: '1.4rem', marginBottom: '10px'
                }}>
                  Enquiry Sent! 🌿
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '8px' }}>
                  A confirmation has been sent to{' '}
                  <strong style={{ color: ACCENT }}>{form.email}</strong>.
                </p>
                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>
                  Our team will contact you at <strong>{form.phone}</strong> within 24 hours.
                </p>
                {/* WhatsApp follow-up */}
                <a
                  href={`https://wa.me/918884588835?text=${waText}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: '#25d366', color: '#fff',
                    padding: '12px 24px', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: 700, fontSize: '14px',
                  }}
                >
                  <FaWhatsapp style={{ fontSize: '18px' }} /> Also message on WhatsApp
                </a>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <p style={{
                  color: '#64748b', fontSize: '13.5px', lineHeight: 1.7,
                  marginBottom: '20px', marginTop: 0
                }}>
                  Fill in your details and we&apos;ll get back to you within 24 hours.
                </p>

                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#334155', marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Full Name *</label>
                <input
                  type="text" name="name" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={handleChange}
                  style={inStyle} onFocus={focus} onBlur={blur}
                />

                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#334155', marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Phone Number *</label>
                <input
                  type="tel" name="phone" placeholder="+91 98765 43210"
                  value={form.phone} onChange={handleChange}
                  style={inStyle} onFocus={focus} onBlur={blur}
                />

                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#334155', marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Email Address *</label>
                <input
                  type="email" name="email" placeholder="your@email.com"
                  value={form.email} onChange={handleChange}
                  style={inStyle} onFocus={focus} onBlur={blur}
                />

                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 700,
                  color: '#334155', marginBottom: '6px', textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Message</label>
                <textarea
                  name="message" rows={3}
                  value={form.message} onChange={handleChange}
                  style={{ ...inStyle, resize: 'vertical' }}
                  onFocus={focus} onBlur={blur}
                />

                {(errorMsg || status === 'error') && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
                    ⚠ {errorMsg || 'Something went wrong. Try WhatsApp below.'}
                  </p>
                )}

                {/* ── Dual CTA ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>

                  {/* Email send */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleEmailSend}
                    disabled={status === 'sending'}
                    style={{
                      width: '100%', padding: '15px',
                      background: status === 'sending'
                        ? '#94a3b8'
                        : `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontWeight: 700, fontSize: '14px', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', fontFamily: 'inherit',
                      boxShadow: status !== 'sending' ? `0 6px 20px ${ACCENT}44` : 'none',
                    }}
                  >
                    {status === 'sending'
                      ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Sending Enquiry…</>
                      : <><FaPaperPlane /> Send Enquiry via Email</>
                    }
                  </motion.button>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  {/* WhatsApp */}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    href={`https://wa.me/918884588835?text=${waText}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      width: '100%', padding: '14px',
                      background: '#25d366',
                      color: '#fff', borderRadius: '12px',
                      fontWeight: 700, fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', textDecoration: 'none', boxSizing: 'border-box',
                    }}
                  >
                    <FaWhatsapp style={{ fontSize: '18px' }} /> Enquire via WhatsApp
                  </motion.a>

                  {/* Call */}
                  <a
                    href="tel:8884588835"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', color: PRIMARY, fontWeight: 600, fontSize: '13px',
                      textDecoration: 'none', padding: '10px',
                      border: `1.5px solid ${PRIMARY}44`, borderRadius: '10px',
                    }}
                  >
                    <FaPhoneAlt /> Call Us: 88845 88835
                  </a>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const getMockReviewsForProduct = (productId) => {
  const defaults = [
    { name: "Rajesh Kumar", rating: 5, date: "2 days ago", title: "Highly recommend", text: "Very effective and high-quality formulation. It was packaged well and delivered quickly.", verified: true },
    { name: "Simran S.", rating: 5, date: "1 week ago", title: "Very clean ingredients", text: "I have been using this supplement alongside my standard therapy and my vitality levels are back to normal.", verified: true },
    { name: "Dr. A. Verma", rating: 4, date: "3 weeks ago", title: "Great complementary aid", text: "Highly standardized botanical extract. Clean, pure, and works well for cellular defense support.", verified: true }
  ];

  const productSpecifics = {
    1: [
      { name: "Suresh K.", rating: 5, date: "3 days ago", title: "Excellent immune booster", text: "My energy levels recovered very well after starting CH95 capsules. Highly recommended for oncology support.", verified: true },
      { name: "Anita Rao", rating: 5, date: "1 week ago", title: "Helped with post-treatment fatigue", text: "This has been a game-changer. I was feeling extremely weak after my sessions, but this helped stabilize my WBC count and stamina.", verified: true },
      { name: "David M.", rating: 4, date: "3 weeks ago", title: "Good quality, fast delivery", text: "Standardized capsules, very easy to swallow. The shipping was incredibly fast, arrived in 2 days in Delhi.", verified: true }
    ],
    2: [
      { name: "Dr. Sandeep", rating: 5, date: "2 days ago", title: "Highly bioavailable MCT blend", text: "Recommended this Curcumin MCT blend to my patients. Excellent absorption and helps maintain weight without blood sugar spikes.", verified: true },
      { name: "Meena Patel", rating: 5, date: "2 weeks ago", title: "Tastes good in warm water", text: "Very premium packaging. Has helped control inflammation and feels very light on the stomach.", verified: true },
      { name: "Amit B.", rating: 4, date: "1 month ago", title: "Effective formulation", text: "Good calorie source. Has helped preserve muscle mass during chemotherapy. A bit expensive but worth it.", verified: true }
    ],
    3: [
      { name: "Pooja Hegde", rating: 5, date: "4 days ago", title: "Great alkaline support", text: "Helps buffer acidity immediately. Take it on an empty stomach in the morning for best results.", verified: true },
      { name: "Ramesh G.", rating: 4, date: "2 weeks ago", title: "Pure and effective", text: "Standardized minerals, high solubility. Appreciate the detailed guidance on the jar.", verified: true }
    ],
    5: [
      { name: "Vikram Sen", rating: 5, date: "1 day ago", title: "Premium Curcumin extract", text: "This is high potency. The addition of BioPerine makes a visible difference in absorption. Very happy with it.", verified: true },
      { name: "Sita Nair", rating: 5, date: "10 days ago", title: "Excellent anti-inflammatory support", text: "Joint comfort and energy are much better. Highly recommend AC95 to anyone searching for high quality curcumin.", verified: true }
    ]
  };

  return productSpecifics[productId] || defaults;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(() => products.find(p => p.id === Number(id)));
  const [activeImg, setActiveImg] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  // ── Real-time Shipping Estimate ──
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, shipToday: true });
  const [deliveryDates, setDeliveryDates] = useState({ start: '', end: '' });

  useEffect(() => {
    const calculateTimeAndDates = () => {
      const now = new Date();
      const cutoffHour = 15; // 3:00 PM cutoff time
      const currentHour = now.getHours();
      
      let shipToday = true;
      let targetTime = new Date();
      
      if (currentHour < cutoffHour) {
        // Ships today
        targetTime.setHours(cutoffHour, 0, 0, 0);
        shipToday = true;
      } else {
        // Ships tomorrow
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(cutoffHour, 0, 0, 0);
        shipToday = false;
      }
      
      const diffMs = targetTime - now;
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      setTimeLeft({ hours, minutes, shipToday });
      
      // Calculate delivery range (3 to 5 days, skip Sunday)
      const addDaysSkippingSundays = (date, days) => {
        let result = new Date(date);
        let added = 0;
        while (added < days) {
          result.setDate(result.getDate() + 1);
          if (result.getDay() !== 0) { // 0 is Sunday
            added++;
          }
        }
        return result;
      };
      
      const startShipDate = shipToday ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const deliveryStart = addDaysSkippingSundays(startShipDate, 3);
      const deliveryEnd = addDaysSkippingSundays(startShipDate, 5);
      
      const options = { day: 'numeric', month: 'short' };
      setDeliveryDates({
        start: deliveryStart.toLocaleDateString('en-IN', options),
        end: deliveryEnd.toLocaleDateString('en-IN', options)
      });
    };
    
    calculateTimeAndDates();
    const interval = setInterval(calculateTimeAndDates, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // ── Interactive Product Reviews ──
  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', email: '', rating: 5, title: '', text: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!product) return;
    const mocks = getMockReviewsForProduct(product.id);
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(`ch_reviews_${product.id}`) || '[]');
    } catch (e) {
      console.warn('Failed to load reviews from local storage', e);
    }
    setReviewsList([...stored, ...mocks]);
    setSubmitSuccess(false);
    setShowReviewForm(false);
  }, [product?.id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.title.trim() || !newReview.text.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    
    const reviewToAdd = {
      name: newReview.name,
      rating: newReview.rating,
      date: 'Just now',
      title: newReview.title,
      text: newReview.text,
      verified: true
    };
    
    // Save to local storage
    try {
      const stored = JSON.parse(localStorage.getItem(`ch_reviews_${product.id}`) || '[]');
      const updatedStored = [reviewToAdd, ...stored];
      localStorage.setItem(`ch_reviews_${product.id}`, JSON.stringify(updatedStored));
    } catch (err) {
      console.warn(err);
    }
    
    setReviewsList(prev => [reviewToAdd, ...prev]);
    setSubmitSuccess(true);
    setNewReview({ name: '', email: '', rating: 5, title: '', text: '' });
    
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowReviewForm(false);
    }, 3000);
  };

  const totalReviewsCount = reviewsList.length;
  const averageRating = totalReviewsCount > 0 
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
    : (product ? product.rating : 4.8);

  const starCounts = [0, 0, 0, 0, 0];
  reviewsList.forEach(r => {
    const starIdx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    starCounts[starIdx]++;
  });

  useEffect(() => {
    const checkDynamic = async () => {
      let apiSucceeded = false;
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-products`);
        const data = await res.json();
        if (data.success && data.products) {
          apiSucceeded = true;
          const found = data.products.find(p => p.id === Number(id));
          if (found) {
            setProduct(found);
          } else {
            setProduct(null);
          }
        }
      } catch (e) {
        console.warn('Failed to load dynamic product:', e);
      }
      if (!apiSucceeded) {
        const foundStatic = products.find(p => p.id === Number(id));
        if (foundStatic) {
          setProduct(foundStatic);
        }
      }
    };
    checkDynamic();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    // 1. Update Title
    const pageTitle = `${product.name} | Integrative Cancer Support | Cancer Herbalist Store`;
    document.title = pageTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', product.description);

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
    updateOGTag('og:description', product.description);
    updateOGTag('og:url', window.location.href);
    if (product.images && product.images.length > 0) {
      updateOGTag('og:image', `${window.location.origin}${product.images[0]}`);
    }

    // 4. Inject Product Schema Markup
    const existingScript = document.getElementById('seo-schema-markup');
    if (existingScript) {
      existingScript.remove();
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.images && product.images.length > 0 ? `${window.location.origin}${product.images[0]}` : '',
      'description': product.description,
      'category': product.category,
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'INR',
        'price': product.price,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'url': window.location.href,
        'priceValidUntil': '2027-12-31'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': product.rating,
        'reviewCount': product.reviews
      }
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
  }, [product]);

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <FaLeaf style={{ fontSize: '48px', color: ACCENT, opacity: 0.5 }} />
        <h2 style={{ color: '#0f172a' }}>Product not found</h2>
        <Link to="/store" style={{ color: ACCENT, fontWeight: 600 }}>← Back to Store</Link>
      </div>
    );
  }

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const savings = product.originalPrice - product.price;


  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', overflowX: 'hidden' }}>

      {/* Breadcrumb / Top Store Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Breadcrumbs Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link to="/store" style={{ color: '#64748b', textDecoration: 'none' }}>Store</Link>
            <span>›</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
          </div>

          {/* Cart & Wishlist Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/wishlist')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1.5px solid #ef4444',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <FaHeart style={{ fontSize: '12px' }} /> Wishlist
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: PRIMARY,
                border: 'none',
                color: '#fff',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#14533d'}
              onMouseLeave={e => e.currentTarget.style.background = PRIMARY}
            >
              <FaShoppingBag style={{ fontSize: '12px' }} /> Cart 
              {cartCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #fff',
                  marginLeft: '2px'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/store')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: '14px', marginBottom: '24px',
            padding: '8px 0', fontFamily: 'inherit',
          }}
        >
          <FaArrowLeft /> Back to Store
        </button>

        {/* Main Product Layout */}
        <div className="pd-layout">

          {/* ── LEFT: Image Gallery ── */}
          <div className="pd-gallery">

            {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
            <div className="pd-thumbs">
              {product.images && product.images.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: '68px', height: '68px', borderRadius: '8px',
                    overflow: 'hidden', cursor: 'pointer',
                    background: '#fff',
                    border: activeImg === i
                      ? `3px solid ${ACCENT}`
                      : '2px solid #e2e8f0',
                    flexShrink: 0,
                    boxShadow: activeImg === i ? `0 2px 12px ${ACCENT}44` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <img src={img} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', boxSizing: 'border-box' }} />
                </motion.div>
              ))}
            </div>

            {/* Main Image */}
            <motion.div
              key={activeImg}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="pd-main-img"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
              }}
            >
              {product.badge && (
                <span style={{
                  position: 'absolute', top: '16px', left: '16px', zIndex: 2,
                  background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                  color: '#fff', padding: '5px 14px', borderRadius: '50px',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  {product.badge}
                </span>
              )}

              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', padding: '12px', boxSizing: 'border-box' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${product.color}15, ${product.color}35)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '96px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>{product.icon}</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="pd-info">

            {/* Category pill */}
            <span style={{
              display: 'inline-block',
              background: `${product.color}18`,
              color: product.color,
              border: `1px solid ${product.color}44`,
              padding: '4px 14px', borderRadius: '50px',
              fontSize: '11px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              marginBottom: '12px',
            }}>
              {product.category}
            </span>

            <h1 style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontFamily: 'Playfair Display, serif',
              color: '#0f172a', margin: '0 0 6px', lineHeight: '1.2',
            }}>
              {product.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 14px', fontStyle: 'italic' }}>
              {product.tagline}
            </p>

            <StarRating rating={Number(averageRating)} count={totalReviewsCount} />

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />

            {/* Pricing */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: PRIMARY }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span style={{
                  background: '#dcfce7', color: '#16a34a',
                  padding: '3px 10px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 700,
                }}>
                  Save ₹{savings.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }}>
                Inclusive of all taxes. Free shipping on orders above ₹999.
              </p>
            </div>

            {/* Pack size */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <FaLeaf style={{ color: PRIMARY, fontSize: '14px', flexShrink: 0 }} />
              <span style={{ color: '#374151', fontSize: '13.5px', fontWeight: 600 }}>{product.size}</span>
            </div>

            {/* Trust icons row */}
            <div style={{
              display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px',
            }}>
              {[
                { icon: <FaTruck />, label: 'Free Delivery' },
                { icon: <FaUndo />, label: '7-Day Returns' },
                { icon: <FaShieldAlt />, label: 'FSSAI Certified' },
                { icon: <FaAward />, label: 'Drug Discovery Scientist Formulated' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: '8px', padding: '7px 12px',
                  fontSize: '12px', color: '#374151', fontWeight: 500,
                  flexShrink: 0, maxWidth: '100%',
                }}>
                  <span style={{ color: PRIMARY, fontSize: '12px', flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{t.label}</span>
                </div>
              ))}
            </div>

            {/* In Stock / Out of Stock Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
            }}>
              {product.inStock === false ? (
                <>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#ef4444', display: 'inline-block',
                    boxShadow: '0 0 6px #ef444488',
                  }} />
                  <span style={{
                    color: '#b91c1c', fontWeight: 700, fontSize: '14px',
                    background: '#fef2f2', padding: '3px 12px', borderRadius: '20px',
                    border: '1px solid #fecaca',
                  }}>🚫 Out of Stock — Currently Unavailable</span>
                </>
              ) : (
                <>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#22c55e', display: 'inline-block',
                    boxShadow: '0 0 6px #22c55e88',
                  }} />
                  <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>In Stock — Ready to Ship</span>
                </>
              )}
            </div>

            {/* Real-time Shipping Estimate Banner — only show when in stock */}
            {product.inStock !== false && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#166534' }}>
                    {timeLeft.shipToday ? (
                      <>Order within <strong style={{ color: '#15803d' }}>{timeLeft.hours}h {timeLeft.minutes}m</strong> to ship <strong style={{ textTransform: 'uppercase' }}>Today!</strong></>
                    ) : (
                      <>Order within <strong style={{ color: '#15803d' }}>{timeLeft.hours}h {timeLeft.minutes}m</strong> to ship <strong style={{ textTransform: 'uppercase' }}>Tomorrow Morning!</strong></>
                    )}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '13px', paddingLeft: '28px' }}>
                  <span style={{ color: PRIMARY }}>📦</span>
                  <span>Estimated delivery: <strong>{deliveryDates.start}</strong> – <strong>{deliveryDates.end}</strong> (via Shiprocket Express)</span>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>

              {/* Row 1: Add to Cart + Buy Now (50% / 50%) */}
              <div className="pd-btn-row">
                <motion.button
                  whileHover={product.inStock !== false ? { scale: 1.02 } : {}}
                  whileTap={product.inStock !== false ? { scale: 0.98 } : {}}
                  onClick={() => product.inStock !== false && addToCart(product, 1)}
                  disabled={product.inStock === false}
                  style={{
                    flex: 1, height: '54px',
                    background: product.inStock === false ? '#f1f5f9' : '#f8fafc',
                    color: product.inStock === false ? '#94a3b8' : PRIMARY,
                    border: product.inStock === false ? '2px solid #e2e8f0' : `2px solid ${PRIMARY}`,
                    borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px',
                    cursor: product.inStock === false ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', fontFamily: 'inherit',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden',
                    boxSizing: 'border-box',
                    opacity: product.inStock === false ? 0.55 : 1,
                  }}
                >
                  <FaShoppingCart style={{ fontSize: '16px', flexShrink: 0 }} />
                  {product.inStock === false ? 'Unavailable' : 'Add to Cart'}
                </motion.button>

                <motion.button
                  whileHover={product.inStock !== false ? { scale: 1.02 } : {}}
                  whileTap={product.inStock !== false ? { scale: 0.98 } : {}}
                  onClick={() => product.inStock !== false && navigate('/checkout', { state: { product, qty: 1 } })}
                  disabled={product.inStock === false}
                  style={{
                    flex: 1, height: '54px',
                    background: product.inStock === false
                      ? '#e2e8f0'
                      : `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                    color: product.inStock === false ? '#94a3b8' : '#fff',
                    border: 'none', borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px',
                    cursor: product.inStock === false ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', fontFamily: 'inherit',
                    boxShadow: product.inStock === false ? 'none' : `0 8px 20px ${ACCENT}40`,
                    transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden',
                    boxSizing: 'border-box',
                    opacity: product.inStock === false ? 0.55 : 1,
                  }}
                >
                  <FaShoppingBag style={{ fontSize: '16px', flexShrink: 0 }} />
                  {product.inStock === false ? 'Out of Stock' : 'Buy Now'}
                </motion.button>
              </div>

              {/* Out of Stock notice */}
              {product.inStock === false && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>🚫</span>
                  <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', lineHeight: '1.6', fontWeight: 500 }}>
                    This product is currently <strong>Out of Stock</strong>. You can still enquire below or add it to your wishlist to get notified when it&apos;s back.
                  </p>
                </div>
              )}

              {/* Row 2: Enquire + Wishlist (50% / 50%) */}
              <div className="pd-btn-row">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEnquiryOpen(true)}
                  style={{
                    flex: 1, height: '54px',
                    background: '#f8fafc',
                    color: PRIMARY, border: `2px solid ${PRIMARY}`, borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s', whiteSpace: 'nowrap', overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                >
                  Enquire
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    flex: 1, height: '54px',
                    background: '#fff',
                    border: isInWishlist(product.id) ? '2px solid #f43f5e' : '2px solid #cbd5e1',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', cursor: 'pointer',
                    color: isInWishlist(product.id) ? '#f43f5e' : '#64748b',
                    fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden',
                  }}
                  title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  {isInWishlist(product.id) ? (
                    <><FaHeart style={{ fontSize: '16px', flexShrink: 0 }} /> Wishlisted</>
                  ) : (
                    <><FaRegHeart style={{ fontSize: '16px', flexShrink: 0 }} /> Wishlist</>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Medical disclaimer */}
            <div style={{
              background: '#fffbeb', border: '1px solid #fbbf24',
              borderRadius: '10px', padding: '12px 16px',
            }}>
              <p style={{ color: '#92400e', fontSize: '12px', margin: 0, lineHeight: '1.7' }}>
                ⚕️ <strong>Medical Note:</strong> This product is a complementary herbal supplement and is not a substitute for conventional cancer treatment. Please consult your oncologist before use.
              </p>
            </div>

            {/* Appearance disclaimer */}
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              background: '#f8fafc', border: '1px dashed #cbd5e1',
              borderRadius: '10px', padding: '11px 14px', marginTop: '10px',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>🎨</span>
              <p style={{ color: '#64748b', fontSize: '11.5px', margin: 0, lineHeight: '1.75' }}>
                <strong style={{ color: '#475569' }}>Appearance Note:</strong>{' '}
                Product colour, packaging, or label design may vary slightly from the images shown — a natural result of batch-to-batch sourcing of premium botanicals.
                Rest assured, the <strong style={{ color: PRIMARY }}>formulation, potency, and therapeutic efficacy remain exactly the same</strong> in every batch.
              </p>
            </div>
          </div>
        </div>

        {/* ── Product Details Accordion ── */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          padding: '8px 32px', marginTop: '32px',
        }}>
          <AccordionItem title="Product Description">
            <p>{product.description}</p>
          </AccordionItem>
          <AccordionItem title="Key Benefits">
            <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {product.benefits.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <FaCheck style={{ color: PRIMARY, fontSize: '12px', marginTop: '3px', flexShrink: 0 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </AccordionItem>
          <AccordionItem title="Ingredients">
            <p>{product.ingredients}</p>
          </AccordionItem>
          <AccordionItem title="Dosage & Usage">
            <p>{product.dosage}</p>
          </AccordionItem>
        </div>

        {/* Reviews Section */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          padding: '32px', marginTop: '32px',
        }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', marginBottom: '24px', fontSize: '1.4rem' }}>
            Customer Reviews
          </h2>
          
          <div style={{
            display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px'
          }} className="reviews-summary-row">
            
            {/* Average Rating Block */}
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {averageRating}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#f59e0b', margin: '10px 0' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <FaStar key={n} style={{ color: n <= Math.round(averageRating) ? '#f59e0b' : '#e2e8f0', fontSize: '18px' }} />
                ))}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Based on {totalReviewsCount} verified reviews
              </div>
            </div>
            
            {/* Stars Breakdown Progress Bars */}
            <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = starCounts[stars - 1] || 0;
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <span style={{ minWidth: '40px', fontWeight: 600, color: '#475569' }}>{stars} Star</span>
                    <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                    </div>
                    <span style={{ minWidth: '30px', color: '#94a3b8', textAlign: 'right' }}>{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
            
            {/* Action CTA Button */}
            <div style={{ minWidth: '180px' }}>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{
                  width: '100%', padding: '12px 18px', background: PRIMARY, color: '#fff',
                  border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13.5px',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
                  boxShadow: `0 4px 12px ${PRIMARY}22`
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#14533d'}
                onMouseLeave={e => e.currentTarget.style.background = PRIMARY}
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            </div>
          </div>

          {/* Collapsible Write a Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                onSubmit={handleReviewSubmit}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  padding: '24px', background: '#f8fafc', marginBottom: '24px',
                  overflow: 'hidden'
                }}
              >
                {submitSuccess ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <span style={{ fontSize: '32px', color: '#22c55e' }}>✓</span>
                    <h4 style={{ margin: '8px 0 4px', color: '#1e293b' }}>Review Submitted!</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Thank you for sharing your feedback with the community.</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Share Your Experience</h3>
                    
                    {/* Star Rating Select Input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Overall Rating:</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(stars => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setNewReview(prev => ({ ...prev, rating: stars }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <FaStar style={{ color: stars <= newReview.rating ? '#f59e0b' : '#cbd5e1', fontSize: '20px' }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="review-form-row">
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={newReview.name}
                          onChange={e => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13.5px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address (Confidential)</label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={newReview.email}
                          onChange={e => setNewReview(prev => ({ ...prev, email: e.target.value }))}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13.5px' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Review Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Highly beneficial / Works really well"
                        value={newReview.title}
                        onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13.5px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Review Description</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="How has this supplement helped your clinical care and energy recovery?"
                        value={newReview.text}
                        onChange={e => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13.5px', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px', background: PRIMARY, color: '#fff', border: 'none',
                        borderRadius: '8px', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      Submit Review
                    </button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviewsList.map((review, i) => (
              <div
                key={i}
                style={{
                  borderBottom: i < reviewsList.length - 1 ? '1px solid #f1f5f9' : 'none',
                  paddingBottom: i < reviewsList.length - 1 ? '20px' : '0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* User Avatar Circle */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: `${PRIMARY}12`, color: PRIMARY, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', textTransform: 'uppercase'
                    }}>
                      {review.name ? review.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '13.5px' }}>{review.name}</span>
                        {review.verified && (
                          <span style={{
                            background: '#dcfce7', color: '#15803d', padding: '2px 6px',
                            borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '3px'
                          }}>
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{review.date}</span>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <FaStar key={n} style={{ color: n <= review.rating ? '#f59e0b' : '#e2e8f0', fontSize: '12px' }} />
                    ))}
                  </div>
                </div>

                <h4 style={{ margin: '6px 0 4px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  {review.title}
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: 1.6 }}>
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── You May Also Like ── */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', marginBottom: '20px', fontSize: '1.4rem' }}>
            You May Also Like
          </h2>
          <div className="pd-related">
            {products.filter(p => p.id !== product.id).slice(0, 3).map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                onClick={() => navigate(`/store/${p.id}`)}
                style={{
                  background: '#fff', borderRadius: '14px', overflow: 'hidden',
                  border: '1px solid #e2e8f0', cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.25s',
                }}
              >
                <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${p.color}18, ${p.color}38)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '48px' }}>{p.icon}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px 14px 14px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>{p.category}</p>
                  <h4 style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700, margin: '0 0 8px' }}>{p.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: PRIMARY, fontSize: '15px' }}>₹{p.price.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '12px' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .pd-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .pd-gallery {
          display: flex;
          gap: 12px;
          position: sticky;
          top: 90px;
          align-items: start;
        }
        .pd-thumbs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .pd-main-img {
          flex: 1;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          height: 500px;
          min-height: 400px;
        }
        .pd-related {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .pd-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .pd-gallery {
            position: static;
            flex-direction: column;
          }
          .pd-main-img {
            height: 320px;
            min-height: 260px;
          }
          .pd-thumbs {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
          }
          .pd-thumbs::-webkit-scrollbar { display: none; }
          .pd-related {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .pd-main-img {
            height: 280px;
            min-height: 220px;
          }
          .pd-thumbs > div {
            width: 56px !important;
            height: 56px !important;
          }
          .pd-related {
            grid-template-columns: 1fr;
          }
        }
        .pd-btn-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
        }
        @media (max-width: 480px) {
          .pd-btn-row {
            flex-direction: column;
          }
          .pd-btn-row > button,
          .pd-btn-row > a {
            width: 100% !important;
            flex: unset !important;
          }
        }
        /* Prevent any child element from breaking out of viewport */
        @media (max-width: 768px) {
          .pd-layout * {
            max-width: 100%;
            word-break: break-word;
          }
        }
        .review-form-row {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 560px) {
          .review-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Enquiry Modal */}
      {enquiryOpen && product && (
        <EnquiryModal product={product} onClose={() => setEnquiryOpen(false)} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
