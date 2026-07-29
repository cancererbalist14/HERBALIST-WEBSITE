import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft, FaLeaf } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { products } from './ProductDetail'; // Importing products from ProductDetail or Store

const ACCENT = '#38bed5';
const PRIMARY = '#1a6e52';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = React.useState(products);

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

  const wishlistProducts = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/store')}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
              width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <FaArrowLeft />
          </button>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#0f172a', margin: 0, fontSize: '2rem' }}>
            My Wishlist 
          </h1>
        </div>

        {wishlistProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FaHeart style={{ fontSize: '32px', color: '#cbd5e1' }} />
            </div>
            <h2 style={{ color: '#0f172a', margin: '0 0 12px' }}>Your wishlist is empty</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Explore our store and find the right herbal products for you.</p>
            <button
              onClick={() => navigate('/store')}
              style={{
                padding: '12px 24px', background: PRIMARY, color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {wishlistProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#fff', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                {/* Image Section */}
                <div style={{ position: 'relative', height: '240px', background: '#f8fafc', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${product.color}18, ${product.color}38)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                    }}>
                      <span style={{ fontSize: '64px' }}>{product.icon}</span>
                    </div>
                  )}
                  
                  {/* Remove from wishlist */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    title="Remove from wishlist"
                  >
                    <FaTrash style={{ fontSize: '14px' }} />
                  </button>
                  
                  {product.badge && (
                    <span style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: PRIMARY, color: '#fff', padding: '4px 10px', borderRadius: '50px',
                      fontSize: '11px', fontWeight: 700
                    }}>
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{product.name}</h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px', flex: 1 }}>{product.category}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: PRIMARY }}>₹{product.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => addToCart(product, 1)}
                      style={{
                        flex: 1, padding: '12px',
                        background: '#0f172a', color: '#fff', border: 'none',
                        borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#1e293b'}
                      onMouseLeave={(e) => e.target.style.background = '#0f172a'}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/store/${product.id}`)}
                      style={{
                        padding: '12px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0',
                        borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                      onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                      title="View Details"
                    >
                      <FaLeaf />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
