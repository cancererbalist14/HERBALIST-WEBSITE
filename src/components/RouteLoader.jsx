/**
 * RouteLoader.jsx
 * Detects every route change and renders the appropriate skeleton layout
 * for ~650ms before revealing the real page content with a smooth fade-in.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SkeletonStyles,
  HomePageSkeleton,
  CareProgramsSkeleton,
  ServiceDetailSkeleton,
  BlogListSkeleton,
  BlogDetailSkeleton,
  StoreSkeleton,
  ProductDetailSkeleton,
  AboutSkeleton,
  DoctorsSkeleton,
  TestimonialsSkeleton,
  ContactSkeleton,
  CheckoutSkeleton,
  OrdersSkeleton,
  GenericPageSkeleton,
} from './Skeleton';

/* Map a pathname to the right skeleton component */
function resolveSkeleton(pathname) {
  if (pathname === '/')                                     return HomePageSkeleton;
  if (pathname === '/about')                               return AboutSkeleton;
  if (pathname === '/care-programs')                       return CareProgramsSkeleton;
  if (pathname === '/doctors')                             return DoctorsSkeleton;
  if (pathname.startsWith('/testimonials'))                return TestimonialsSkeleton;
  if (pathname.startsWith('/blog'))                        return BlogDetailSkeleton;
  if (pathname.startsWith('/services/'))                   return ServiceDetailSkeleton;
  if (pathname === '/store')                               return StoreSkeleton;
  if (pathname.startsWith('/store/'))                      return ProductDetailSkeleton;
  if (pathname === '/checkout')                            return CheckoutSkeleton;
  if (pathname === '/contact')                             return ContactSkeleton;
  if (['/my-orders', '/track-order', '/order-details', '/faqs'].some(p => pathname.startsWith(p)))
                                                           return OrdersSkeleton;
  // All other pages get a generic layout
  return GenericPageSkeleton;
}

/* How long to show the skeleton (ms) */
const SKELETON_DURATION = 150;

export default function RouteLoader({ children }) {
  const location = useLocation();
  const [loading, setLoading]   = useState(true);
  const [visible, setVisible]   = useState(false); // controls fade-in of real content
  const [SkeletonComponent, setSkeleton] = useState(() => resolveSkeleton(location.pathname));

  const runTransition = useCallback((pathname) => {
    setSkeleton(() => resolveSkeleton(pathname));
    setLoading(true);
    setVisible(false);

    const timer = setTimeout(() => {
      setLoading(false);
      // slight delay before showing real content for the fade to start
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, SKELETON_DURATION);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return runTransition(location.pathname);
  }, [location.pathname, runTransition]);

  return (
    <>
      <SkeletonStyles />

      {/* ── Skeleton layer ── */}
      {loading && (
        <div
          key={`sk-${location.pathname}`}
          style={{
            opacity: 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          <SkeletonComponent />
        </div>
      )}

      {/* ── Real content layer (fades in after skeleton) ── */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
          display: loading ? 'none' : 'block',
          minHeight: loading ? 0 : undefined,
        }}
      >
        {children}
      </div>
    </>
  );
}
