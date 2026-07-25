import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Contact from './pages/Contact';
import ManageAppointment from './pages/ManageAppointment';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import CancerOverview from './pages/CancerOverview';
import Services from './pages/Services';
import TreatmentMethods from './pages/TreatmentMethods';
import CarePrograms from './pages/CarePrograms';
import Doctors from './pages/Doctors';
import Testimonials from './pages/Testimonials';
import StoryDetail from './pages/StoryDetail';
import ServiceDetail from './pages/ServiceDetail';
import EducationResources from './pages/EducationResources';
import PatientOnboarding from './pages/PatientOnboarding';
import ProductsHub from './pages/ProductsHub';
import IntegrativeTherapies from './pages/IntegrativeTherapies';
import PersonalizedTreatmentPlansPage from './pages/PersonalizedTreatmentPlans';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Wishlist from './pages/Wishlist';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MedicalDisclaimer from './pages/MedicalDisclaimer';
import DataRetentionPolicy from './pages/DataRetentionPolicy';
import DataDeletionPolicy from './pages/DataDeletionPolicy';
import RefundPolicy from './pages/RefundPolicy';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import OrderFAQ from './pages/OrderFAQ';
import ZohoConsent from './pages/ZohoConsent';
import Support from './pages/Support';
import WhatsAppButton from './components/WhatsAppButton';
import StickyMobileBar from './components/StickyMobileBar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import RouteLoader from './components/RouteLoader';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentContext';
import { LanguageProvider } from './context/LanguageContext';
import CartDrawer from './components/CartDrawer';
import SEO from './components/SEO';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: 'mobile',
    });
  }, []);

  return (
    <LanguageProvider>
    <ContentProvider>
      <CartProvider>
        <WishlistProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <SEO />
          <div
            className="App"
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflowX: 'hidden',
              position: 'relative',
            }}
          >
            <Navbar />

            <main style={{ flex: 1 }}>
              <RouteLoader>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cancer-overview" element={<CancerOverview />} />
                  <Route path="/services" element={<Navigate to="/care-programs" replace />} />
                  <Route path="/treatment-methods" element={<TreatmentMethods />} />
                  <Route path="/care-programs" element={<CarePrograms />} />
                  <Route path="/doctors" element={<Navigate to="/about#our-team" replace />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/testimonials/:id" element={<StoryDetail />} />
                  
                  {/* Education Resources routes */}
                  <Route path="/education-resources" element={<EducationResources />} />
                  <Route path="/blog" element={<Navigate to="/education-resources" replace />} />
                  <Route path="/patient-education" element={<Navigate to="/education-resources" replace />} />

                  {/* Patient Onboarding routes */}
                  <Route path="/patient-onboarding" element={<PatientOnboarding />} />
                  <Route path="/patient-resources" element={<Navigate to="/patient-onboarding" replace />} />

                  {/* Products Hub & E-Commerce */}
                  <Route path="/products" element={<ProductsHub />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/store/:id" element={<ProductDetail />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route style={{ contentVisibility: 'auto' }} path="/my-orders" element={<MyOrders />} />

                  <Route path="/services/:id" element={<ServiceDetail />} />
                  <Route path="/integrative-therapies" element={<IntegrativeTherapies />} />
                  <Route path="/personalized-treatment-plans" element={<PersonalizedTreatmentPlansPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/manage-appointment" element={<ManageAppointment />} />
                  <Route path="/order-details/:orderId" element={<OrderDetails />} />
                  <Route path="/faqs" element={<OrderFAQ />} />
                  <Route path="/consent" element={<ZohoConsent />} />
                  <Route path="/support" element={<Support />} />

                  {/* Legal Pages */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/terms-and-conditions" element={<Navigate to="/terms-of-service" replace />} />
                  <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />
                  <Route path="/data-deletion-policy" element={<DataDeletionPolicy />} />
                  <Route path="/data-retention-policy" element={<DataRetentionPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />

                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </RouteLoader>
            </main>

            <Footer />
            <WhatsAppButton />
            <Chatbot />
            <CartDrawer />
            <StickyMobileBar />
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </ContentProvider>
  </LanguageProvider>
  );
}

export default App;