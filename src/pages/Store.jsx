import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaSearch, FaTimes, FaShoppingBag, FaStar, FaShieldAlt, FaCheck, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { products } from './ProductDetail';

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

const categories = ['All', 'Immunity', 'Anti-Tumor', 'Detox', 'Stress & Recovery', 'Nutrition', 'Essential Oils', 'Alkaline Therapy'];

// Placeholder image component
function ProductPlaceholder({ color, icon }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '3 / 4',
      background: `linear-gradient(135deg, ${color}18, ${color}38)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{ fontSize: '48px' }}>{icon}</span>
    </div>
  );
}

// ── Main Store Component ────────────────────────────────────────
export default function Store() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartCount, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState(products);
  const [searchFocused, setSearchFocused] = useState(false);

  React.useEffect(() => {
    const fetchDynamic = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/dynamic-products`);
        const data = await res.json();
        if (data.success && data.products) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.warn('Error fetching dynamic products:', err);
      }
    };
    fetchDynamic();
  }, []);

  const filtered = allProducts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        .store-btn-wishlist:hover .btn-icon-wishlist {
          transform: scale(1.2) rotate(-5deg);
        }
        .store-btn-cart:hover .btn-icon-cart {
          transform: scale(1.18) translate(1px, -1px);
        }
        .btn-icon-wishlist,
        .btn-icon-cart {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes cartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .cart-count-badge {
          animation: cartPulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #0f3460 60%, #1a5276 100%)`,
        padding: '130px 20px 70px', textAlign: 'center', color: '#fff',
      }}>
        <span style={{
          background: `${ACCENT}33`, border: `1px solid ${ACCENT}66`,
          color: ACCENT, padding: '6px 18px', borderRadius: '50px',
          fontSize: '13px', fontWeight: 600,
        }}>
          🌿 Herbal Medicine Store
        </span>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontFamily: 'Playfair Display, serif',
          margin: '20px 0 16px',
        }}>
          Clinically Validated <span style={{ color: ACCENT }}>Herbal Formulations</span>
        </h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.87, lineHeight: '1.8', fontSize: '1.05rem' }}>
          Personalised herbal supplements designed to support your cancer treatment journey.
          All products are evidence-based and complementary to conventional therapy.
        </p>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
          {['100% Natural', 'No Side Effects', 'Herbal Scientist Formulated', 'Free Consultation Included'].map(b => (
            <div key={b} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <FaShieldAlt style={{ color: ACCENT, fontSize: '11px' }} /> {b}
            </div>
          ))}
        </div>
      </section>

      {/* Filters + Search */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 12px 0' }}>

        {/* Store Toolbar (Search + Wishlist/Cart links) */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <FaSearch style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: searchFocused ? PRIMARY : '#64748b', 
              fontSize: '15px',
              transition: 'color 0.3s ease'
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search herbal products…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 20px 12px 46px',
                border: searchFocused ? `1.5px solid ${PRIMARY}` : '1.5px solid #cbd5e1', 
                borderRadius: '50px',
                fontSize: '14.5px', outline: 'none',
                background: searchFocused ? '#fff' : '#f8fafc', 
                color: '#374151',
                boxShadow: searchFocused ? `0 0 0 3px ${PRIMARY}22, 0 4px 12px rgba(0,0,0,0.05)` : '0 2px 4px rgba(0,0,0,0.02) inset',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          {/* Cart & Wishlist inline buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Wishlist Link */}
            <button
              onClick={() => navigate('/wishlist')}
              className="store-btn-wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fff',
                border: '1.5px solid #f43f5e',
                color: '#f43f5e',
                padding: '11px 22px',
                borderRadius: '50px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 6px rgba(244,63,94,0.08)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fff1f2';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(244,63,94,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(244,63,94,0.08)';
              }}
            >
              <FaHeart className="btn-icon-wishlist" /> My Wishlist
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="store-btn-cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `linear-gradient(135deg, ${PRIMARY}, #115e42)`,
                border: 'none',
                color: '#fff',
                padding: '12.5px 24px',
                borderRadius: '50px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(26,110,82,0.2)',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(26,110,82,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,110,82,0.2)';
              }}
            >
              <FaShoppingBag className="btn-icon-cart" /> My Cart 
              {cartCount > 0 && (
                <span 
                  className="cart-count-badge"
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #fff',
                    marginLeft: '4px'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Horizontally scrollable category pills */}
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto',
          paddingBottom: '10px', marginBottom: '20px',
          scrollbarWidth: 'none',
        }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 16px', borderRadius: '50px', border: 'none',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              flexShrink: 0,
              background: activeCategory === cat ? `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` : '#fff',
              color: activeCategory === cat ? '#fff' : '#64748b',
              boxShadow: activeCategory === cat ? `0 4px 14px ${ACCENT}44` : '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product count */}
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Product Grid — 2 cols on mobile, 3-4 on desktop */}
        <div className="store-grid" style={{ paddingBottom: '60px' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <FaLeaf style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }} />
              <p>No products found.</p>
            </div>
          ) : filtered.map((product, i) => (
            <motion.div
              key={product.id}
              className="store-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/store/${product.id}`)}
            >
              {/* Image */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3 / 4',
                overflow: 'hidden',
                background: '#f8f8f8',
              }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ProductPlaceholder color={product.color} icon={product.icon} />
                )}
                {product.badge && (
                  <span style={{
                    position: 'absolute', top: '8px', left: '8px',
                    background: product.badge === 'Premium'
                      ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                      : `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                    color: '#fff', padding: '3px 9px', borderRadius: '50px',
                    fontSize: '10px', fontWeight: 700, zIndex: 5
                  }}>
                    {product.badge}
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                    background: '#fff', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: isInWishlist(product.id) ? '#ef4444' : '#94a3b8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s'
                  }}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  {isInWishlist(product.id) ? <FaHeart style={{ fontSize: '14px' }} /> : <FaRegHeart style={{ fontSize: '14px' }} />}
                </button>

              </div>

              {/* Info */}
              <div className="store-card-body">
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                  <FaStar style={{ color: '#f59e0b', fontSize: '10px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>{product.rating}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>({product.reviews})</span>
                </div>

                <h3 className="store-card-title">{product.name}</h3>

                <p className="store-card-desc">
                  {product.description.substring(0, 60)}…
                </p>

                {/* Price row */}
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: PRIMARY }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '5px' }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/store/${product.id}`); }}
                    style={{
                      flex: 1, padding: '8px', background: '#f8fafc',
                      border: `1px solid ${PRIMARY}`, color: PRIMARY,
                      borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    Details
                  </button>
                  <button
                    className="store-card-btn"
                    style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); addToCart(product, 1); }}
                  >
                    <FaShoppingCart style={{ fontSize: '11px' }} /> Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Responsive styles */}
        <style>{`
          .store-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .store-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.07);
            cursor: pointer;
            transition: box-shadow 0.25s, transform 0.25s;
            border: 1px solid #f1f5f9;
          }
          .store-card:hover {
            box-shadow: 0 6px 24px rgba(0,0,0,0.12);
            transform: translateY(-3px);
          }
          .store-card-body {
            padding: 10px 12px 12px;
          }
          .store-card-title {
            font-size: 0.88rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
            line-height: 1.3;
          }
          .store-card-desc {
            font-size: 0.75rem;
            color: #64748b;
            line-height: 1.5;
            margin-bottom: 8px;
          }
          .store-card-btn {
            width: 100%;
            padding: 8px;
            background: ${PRIMARY};
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-family: inherit;
            transition: background 0.2s;
          }
          .store-card-btn:hover {
            background: #14533d;
          }
          @media (max-width: 1024px) {
            .store-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (max-width: 640px) {
            .store-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .store-card-body { padding: 8px 10px 10px; }
            .store-card-title { font-size: 0.82rem; }
            .store-card-desc { display: none; }
          }
        `}</style>
      </div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {/* Enquiry modal removed – navigation now opens detailed page */}
      </AnimatePresence>
    </div>
  );
}
