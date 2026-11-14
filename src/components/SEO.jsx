import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND = 'Cancer Herbalist';
const BASE_URL = 'https://www.cancerherbalist.com';

const seoData = {
  '/': {
    title: 'Cancer Herbalist | Botanical Products & Herbal Nutrition Information in Bengaluru',
    description: 'Discover Cancer Herbalist in Bengaluru, India. Learn about our botanical and nutraceutical products, ingredients, general nutrition information and how to discuss limitations and potential risks before use. Products are not cancer treatments.',
    keywords: 'Cancer Herbalist Bengaluru, botanical products, herbal nutrition, nutraceutical products, complementary wellness information, product ingredients, product safety',
    schema: null
  },
  '/about': {
    title: 'About Prof. Ramesh Babu & Cancer Herbalist Team | Bengaluru',
    description: 'Learn about Cancer Herbalist in Bengaluru, its purpose, botanical and nutraceutical product information, and commitment to transparent conversations about limitations and risks.',
    keywords: 'about cancer herbalist, prof ramesh babu, herbal medicine team, cancer care team, natural oncology research',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About Cancer Herbalist',
      'description': 'Learn about Cancer Herbalist in Bengaluru, its purpose, botanical and nutraceutical product information, and commitment to transparent conversations about limitations and risks.',
      'mainEntity': {
        '@type': 'Person',
        'name': 'Prof. Ramesh Babu',
        'jobTitle': 'Founder',
        'worksFor': {
          '@type': 'Organization',
          'name': 'Cancer Herbalist'
        }
      }
    }
  },
  '/care-programs': {
    title: 'Specialized Cancer Care Programs | Cancer Herbalist',
    description: 'Explore product information, general nutrition education and opportunities to discuss botanical products, intended use, limitations and potential risks. These products are not cancer treatments.',
    keywords: 'Cancer Herbalist information, botanical product information, herbal nutrition, nutraceutical product precautions, complementary wellness education',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Specialized Cancer Care Programs',
      'description': 'Explore product information, general nutrition education and opportunities to discuss botanical products, intended use, limitations and potential risks. These products are not cancer treatments.'
    }
  },
  '/treatment-methods': {
    title: 'Botanical Product Information & Safety | Cancer Herbalist',
    description: 'Understand Cancer Herbalist's approach to sharing botanical product information, general nutrition education, evidence limitations and product safety considerations.',
    keywords: 'herbal product information, botanical ingredients, nutraceutical safety, herbal supplement interactions, nutrition education',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Holistic & Integrative Treatment Methods'
    }
  },
  '/doctors': {
    title: 'Our Team | Cancer Herbalist',
    description: 'Learn about the Cancer Herbalist team and contact the institute in Bengaluru for information about botanical and nutraceutical products.',
    keywords: 'Cancer Herbalist team, Bengaluru, botanical product information, nutraceutical enquiries',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Our Team'
    }
  },
  '/testimonials': {
    title: 'Patient Experiences & Information | Cancer Herbalist',
    description: 'Patient experiences are being reviewed for documentation, context and permission. Individual accounts are not clinical evidence and cannot establish that a product treats cancer.',
    keywords: 'Cancer Herbalist patient experiences, individual accounts, product information, complementary wellness',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Patient Experiences & Information'
    }
  },
  '/blog': {
    title: 'Cancer Health & Herbal Support Blog | Cancer Herbalist',
    description: 'Read educational information about cancer awareness, nutrition, botanical products and questions to discuss with your healthcare team.',
    keywords: 'cancer blog, herbal medicine blog, cancer nutrition tips, adaptogens research, oncologist complementary support',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'Cancer Health & Herbal Support Blog',
      'description': 'Read educational information about cancer awareness, nutrition, botanical products and questions to discuss with your healthcare team.'
    }
  },
  '/patient-education': {
    title: 'Patient Education & Resources | Cancer Herbalist',
    description: 'Read patient and caregiver education about cancer awareness, nutrition, botanical products, product safety and questions to discuss with your healthcare team.',
    keywords: 'patient education, cancer awareness, nutrition during cancer care, herbal product safety, supplement interactions',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Patient Education & Resources'
    }
  },
  '/patient-education/tcells-vs-nk-cells': {
    title: 'T-Cells vs. NK Cells: Boosting Cellular Immunity | Cancer Herbalist',
    description: 'An educational overview of T-cells and Natural Killer cells. Immune cell biology does not establish that a herbal product activates these cells or treats cancer.',
    keywords: 'T cells, NK cells, immune cell biology, cancer patient education',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'T-Cells vs. NK Cells: Boosting Cellular Immunity'
    }
  },
  '/store': {
    title: 'Botanical & Nutraceutical Products | Cancer Herbalist',
    description: 'Browse botanical and nutraceutical products. Review the product label, ingredients, intended use, warnings and available quality documents before purchase.',
    keywords: 'Cancer Herbalist store, botanical products, herbal nutraceuticals, product labels, ingredient information',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      'name': 'Cancer Herbalist Store',
      'description': 'Browse botanical and nutraceutical products. Review the product label, ingredients, intended use, warnings and available quality documents before purchase.'
    }
  },
  '/wishlist': {
    title: 'My Saved Formulas | Cancer Herbalist Store',
    description: 'View and manage your saved herbal formulations and complementary support products.',
    keywords: 'wishlist, saved formulas, organic supplements list',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'My Saved Formulas'
    }
  },
  '/checkout': {
    title: 'Secure Checkout | Cancer Herbalist Store',
    description: 'Finalize your order for premium supportive herbal formulations securely.',
    keywords: 'secure checkout, buy cancer herbs, place order',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CheckoutPage',
      'name': 'Secure Checkout'
    }
  },
  '/contact': {
    title: 'Contact Us & Book a Free Consultation | Cancer Herbalist',
    description: 'Contact Cancer Herbalist in Bengaluru to ask about our institute, botanical products and product information. Arrange an in-person or telephone discussion about intended use, limitations and potential risks.',
    keywords: 'contact cancer herbalist, book consultation, clinic location, teleconsultation phone number',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact Us & Book a Free Consultation',
      'mainEntity': {
        '@type': 'ContactPoint',
        'telephone': '+91 88845 88835',
        'contactType': 'customer support',
        'areaServed': 'Worldwide'
      }
    }
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Cancer Herbalist',
    description: 'Read the privacy policy of Cancer Herbalist regarding user data collection and protection.',
    keywords: 'privacy policy, data collection',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Privacy Policy'
    }
  },
  '/terms-of-service': {
    title: 'Terms of Service | Cancer Herbalist',
    description: 'Read the terms of service governing the use of the Cancer Herbalist website and programs.',
    keywords: 'terms of service, user agreement',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Terms of Service'
    }
  },
  '/refund-policy': {
    title: 'Refund Policy | Cancer Herbalist',
    description: 'Read our refund policy regarding our herbal formulas and support consultations.',
    keywords: 'refund policy, cancellation policy',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Refund Policy'
    }
  }
};

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const data = seoData[pathname];
    if (!data) return;

    // 1. Update Title
    document.title = data.title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', data.description);

    // 3. Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', data.keywords);

    // Keep the canonical URL in sync with the active route.
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${BASE_URL}${pathname === '/' ? '/' : pathname}`);

    // 4. Update Open Graph tags
    const updateOGTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', data.title);
    updateOGTag('og:description', data.description);
    updateOGTag('og:url', `${BASE_URL}${pathname}`);
    updateOGTag('og:type', 'website');
    const updateMetaName = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    updateMetaName('twitter:title', data.title);
    updateMetaName('twitter:description', data.description);

    // 5. Inject/Update Schema Markup (Structured Data)
    const existingScript = document.getElementById('seo-schema-markup');
    if (existingScript) {
      existingScript.remove();
    }

    if (data.schema) {
      const script = document.createElement('script');
      script.id = 'seo-schema-markup';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(data.schema);
      document.head.appendChild(script);
    }

  }, [pathname]);

  return null;
}
