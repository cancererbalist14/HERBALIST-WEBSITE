import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND = 'Cancer Herbalist';
const BASE_URL = 'https://www.cancerherbalist.com';

const seoData = {
  '/': {
    title: 'Cancer Herbalist | Natural & Holistic Cancer Support & Care',
    description: 'Evidence-based herbal cancer treatment and personalized care support. Discover holistic therapies, certified practitioners, and life-changing success stories.',
    keywords: 'cancer herbalist, herbal cancer support, natural cancer care, holistic cancer therapy, integrative oncology, herbal medicine, cancer nutrition',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      'name': 'Cancer Herbalist',
      'image': 'https://www.cancerherbalist.com/logo.png',
      'url': 'https://www.cancerherbalist.com',
      'telephone': '+91 88845 88835',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Bangalore',
        'addressRegion': 'Karnataka',
        'addressCountry': 'IN'
      },
      'founder': {
        '@type': 'Person',
        'name': 'Prof. Ramesh Babu'
      },
      'description': 'Evidence-based herbal cancer treatment and personalized care support. Discover holistic therapies, certified practitioners, and life-changing success stories.'
    }
  },
  '/about': {
    title: 'About Prof. Ramesh Babu & Our Team | Cancer Herbalist',
    description: 'Learn about our founder, Prof. Ramesh Babu, his background in pharmacology, and our mission to provide evidence-based, integrative cancer support.',
    keywords: 'about cancer herbalist, prof ramesh babu, herbal medicine team, cancer care team, natural oncology research',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About Cancer Herbalist',
      'description': 'Learn about our founder, Prof. Ramesh Babu, his background in pharmacology, and our mission to provide evidence-based, integrative cancer support.',
      'mainEntity': {
        '@type': 'Person',
        'name': 'Prof. Ramesh Babu',
        'jobTitle': 'Founder & Senior Practitioner',
        'worksFor': {
          '@type': 'Organization',
          'name': 'Cancer Herbalist'
        }
      }
    }
  },
  '/care-programs': {
    title: 'Specialized Cancer Care Programs | Cancer Herbalist',
    description: 'Explore our specialized herbal care programs for breast, lung, colon, prostate, liver, and blood cancers, designed to complement conventional treatments.',
    keywords: 'cancer care programs, lung cancer herbal care, breast cancer support, colon cancer recovery, prostate cancer therapies, liver cancer hepatoprotection, blood cancer bone marrow support',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      'name': 'Specialized Cancer Care Programs',
      'description': 'Explore our specialized herbal care programs for breast, lung, colon, prostate, liver, and blood cancers, designed to complement conventional treatments.'
    }
  },
  '/treatment-methods': {
    title: 'Holistic & Integrative Treatment Methods | Cancer Herbalist',
    description: 'Discover our complementary treatment methodologies including personalized herbal formulations, immune system support, and dietary optimization.',
    keywords: 'treatment methods, herbal cancer therapy, custom phytotherapy, cancer immune modulation, gut microbiota support',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      'name': 'Holistic & Integrative Treatment Methods'
    }
  },
  '/doctors': {
    title: 'Our Team | Cancer Herbalist',
    description: 'Meet our team of experienced practitioners and researchers led by Prof. Ramesh Babu, dedicated to safe, integrative cancer support.',
    keywords: 'cancer herbalist consultants, medical team, herbal specialists, prof ramesh babu team',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      'name': 'Our Team'
    }
  },
  '/testimonials': {
    title: 'Patient Recovery Stories & Demographics | Cancer Herbalist',
    description: 'Read inspiring testimonials and success stories from patients across India and internationally who integrated our herbal support protocols.',
    keywords: 'cancer survivor stories, herbal cancer recovery, patient testimonials, cancer treatment success',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Patient Recovery Stories & Demographics'
    }
  },
  '/blog': {
    title: 'Cancer Health & Herbal Support Blog | Cancer Herbalist',
    description: 'Stay informed with the latest research, wellness tips, and dietary guidance for cancer support and integrative health.',
    keywords: 'cancer blog, herbal medicine blog, cancer nutrition tips, adaptogens research, oncologist complementary support',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'Cancer Health & Herbal Support Blog',
      'description': 'Stay informed with the latest research, wellness tips, and dietary guidance for cancer support and integrative health.'
    }
  },
  '/patient-education': {
    title: 'Patient Education & Resources | Cancer Herbalist',
    description: 'Access clinical education and resources to understand how adaptogens and integrative nutrition support the body during cancer treatments.',
    keywords: 'patient education, cancer resources, how herbs support chemo, immune system modulation, cancer phytotherapy',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Patient Education & Resources'
    }
  },
  '/patient-education/tcells-vs-nk-cells': {
    title: 'T-Cells vs. NK Cells: Boosting Cellular Immunity | Cancer Herbalist',
    description: 'Understand the key differences between T-cells and Natural Killer cells, and how herbal support modulates cell-mediated and innate immunity.',
    keywords: 't cells vs nk cells, natural killer cells, cellular immunity, cell mediated immunity, innate immunity, herbs immune modulation',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      'name': 'T-Cells vs. NK Cells: Boosting Cellular Immunity'
    }
  },
  '/store': {
    title: 'Shop Integrative Herbal Formulations | Cancer Herbalist',
    description: 'Browse our collection of premium, organic, heavy-metal-tested herbal formulas designed to support vitality, immunity, and overall wellbeing.',
    keywords: 'herbal shop, buy organic herbs online, cancer support supplements, immune booster, energy adaptogens',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      'name': 'Cancer Herbalist Store',
      'description': 'Browse our collection of premium, organic, heavy-metal-tested herbal formulas designed to support vitality, immunity, and overall wellbeing.'
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
    description: 'Get in touch with our team of specialists or book a free discovery consultation. We are here to support your healing journey.',
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
