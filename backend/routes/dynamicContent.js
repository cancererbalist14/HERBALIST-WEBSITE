const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const priceListModule  = require('./priceList');
const { dbRead, dbWrite } = require('../utils/supabaseDb');

// On Vercel (production), the project filesystem is READ-ONLY.
// Only /tmp is writable. Use /tmp in production, local data/ in development.
const IS_VERCEL = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
const DATA_DIR  = IS_VERCEL
  ? '/tmp/cancer-herbalist-data'
  : path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE        = path.join(DATA_DIR, 'products.json');
const BLOGS_FILE           = path.join(DATA_DIR, 'blogs.json');
const TESTIMONIALS_FILE    = path.join(DATA_DIR, 'testimonials.json');
const WEBSITE_CONTENT_FILE = path.join(DATA_DIR, 'websiteContent.json');

// In-memory cache for website content (survives within one serverless instance).
// On Vercel, /tmp resets between cold starts but the cache keeps changes alive
// within a warm instance without requiring a disk read each time.
let _websiteContentCache = null;

// Helper to read JSON safely
const readData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return [];
};

// Helper to write JSON safely — always targets the writable DATA_DIR
const writeData = (filePath, data) => {
  try {
    // Ensure the directory still exists (can disappear between Vercel invocations)
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

const { checkAuthLockout, recordAuthFailure, recordAuthSuccess } = require('../middleware/authRateLimiter');

// Simple admin auth check with exponential backoff rate limiting
const checkAdmin = (req, res, next) => {
  checkAuthLockout(req, res, () => {
    const key = req.query.key || req.headers['x-admin-key'];
    const adminSecret = process.env.ADMIN_SECRET || 'ch-admin-2024';
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    if (key !== adminSecret) {
      recordAuthFailure(ip);
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    recordAuthSuccess(ip);
    next();
  });
};

/* ── INITIAL SEED DATA ────────────────────────────────────────── */

const initialProducts = [
  {
    id: 1,
    name: 'Cap CH95 (30Cap)',
    category: 'Immunity',
    price: 799,
    originalPrice: 1099,
    rating: 4.8,
    reviews: 124,
    images: [
      '/products/product0.1.jpeg',
      '/products/product0.2.jpeg',
      '/products/product0.3.jpeg',
      '/products/product0.4.jpeg',
      '/products/product1.jpg',
      '/products/product1.2.png',
      '/products/product1.3.png'
    ],
    color: '#38bed5',
    icon: '🌿',
    badge: 'Best Seller',
    tagline: 'Premium immunity support capsule for cellular defense and resilience.',
    description: 'Cap CH95 is a specialized herbal formulation designed to bolster the body\'s immune system, enhance cellular resilience, and combat chronic fatigue during intensive clinical treatments. Rich in natural immunomodulators and antioxidants, it supports general vitality and wellness.',
    benefits: [
      'Boosts natural killer (NK) cell activity',
      'Protects cells from oxidative damage',
      'Helps reduce post-treatment fatigue',
      'Supports white blood cell count restoration'
    ],
    ingredients: 'Tinospora Cordifolia (Giloy) 250mg, Ocimum Sanctum (Tulsi) 200mg, Withania Somnifera (Ashwagandha) 150mg.',
    dosage: '1 capsule twice daily after meals, or as advised by your healthcare specialist.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 2,
    name: 'C3M Powder',
    category: 'Nutrition',
    price: 2599,
    originalPrice: 3299,
    rating: 4.9,
    reviews: 98,
    images: ['/products/product9.1.jpg', '/products/product9.2.jpg', '/products/product9.3.jpg'],
    color: '#f59e0b',
    icon: '🟡',
    badge: 'Top Rated',
    tagline: 'High-absorption Curcumin & MCT blend for advanced nutritional therapy.',
    description: 'C3M Powder combines premium Medium Chain Triglycerides (MCT) with highly bioavailable Curcumin (standardized to 95% curcuminoids). This synergistic formulation provides readily absorbable calories while delivering powerful anti-inflammatory and cellular protection support.',
    benefits: [
      'High-bioavailability Curcumin (95% curcuminoids)',
      'Rapid energy source via MCTs without glucose spikes',
      'Supports healthy anti-inflammatory pathways',
      'Preserves lean muscle mass and combats weight loss'
    ],
    ingredients: 'Coconut-derived MCT Powder 70%, Curcuma Longa extract (95% curcuminoids) 25%, Piperine 5%.',
    dosage: '1 scoop (approx. 10g) mixed into warm water, milk, or smoothies daily.',
    size: '200g jar / 20-day supply',
    inStock: true
  },
  {
    id: 3,
    name: 'CUP Powder',
    category: 'Alkaline Therapy',
    price: 2299,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 76,
    images: ['/products/product11.0.jpg', '/products/product11.jpg', '/products/product11.1.jpg'],
    color: '#10b981',
    icon: '🍃',
    badge: null,
    tagline: 'Advanced alkalizing blend to support healthy metabolic pH balance.',
    description: 'CUP Powder is a pharmaceutical-grade alkalizing formula designed to buffer cellular acidity and support metabolic pH balance. Restoring an optimal alkaline environment helps normalize cellular metabolism and supports overall recovery.',
    benefits: [
      'Supports optimal metabolic pH buffering',
      'Alkalizes the cellular microenvironment naturally',
      'Aids kidney function and metabolic detoxification',
      'Pharmaceutical-grade purity for maximum safety and absorption'
    ],
    ingredients: 'Purified Sodium Bicarbonate, Potassium Citrate, and alkaline mineral buffers.',
    dosage: '½ teaspoon dissolved in a glass of water daily on an empty stomach, or as directed by your consultant.',
    size: '250g tub / 50-day supply',
    inStock: true
  },
  {
    id: 4,
    name: 'Cap Withangen (30Cap)',
    category: 'Stress & Recovery',
    price: 799,
    originalPrice: 1099,
    rating: 4.7,
    reviews: 89,
    images: ['/products/product4.1.jpg', '/products/product4.2.jpg', '/products/product4.3.jpg'],
    color: '#8b5cf6',
    icon: '🌱',
    badge: null,
    tagline: 'Standardized Ashwagandha adaptogen for stress defense and sleep support.',
    description: 'Cap Withangen features high-potency Withania Somnifera (Ashwagandha) extract standardized for maximum withanolide content. It targets the HPA axis to normalize cortisol levels, reduce anxiety, and improve sleep quality during recovery.',
    benefits: [
      'Modulates cortisol levels to combat stress',
      'Improves sleep latency and overall sleep quality',
      'Enhances stamina and reduces physical fatigue',
      'Supports cognitive function, memory, and focus'
    ],
    ingredients: 'Withania Somnifera (Ashwagandha KSM-66®) extract standardized to 5% withanolides 500mg.',
    dosage: '1 capsule twice daily, preferably with warm milk or water after meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 5,
    name: 'Cap AC95 (30Cap)',
    category: 'Anti-Tumor',
    price: 2999,
    originalPrice: 3999,
    rating: 4.9,
    reviews: 142,
    images: ['/products/product2.1.png', '/products/product2.2.jpg', '/products/product2.3.jpg'],
    color: '#0f3460',
    icon: '💊',
    badge: 'Premium',
    tagline: 'Ultra-pure Active Curcumin 95% for targeted anti-inflammatory defense.',
    description: 'Cap AC95 delivers pharmaceutical-grade Active Curcumin standardized to 95% curcuminoids, enhanced with black pepper extract to maximize cellular absorption. It acts as a powerful anti-inflammatory and supports healthy cell proliferation pathways.',
    benefits: [
      'Targets NF-kB and critical inflammatory pathways',
      'Provides powerful cellular antioxidant defense',
      'Supports healthy tissue regeneration and recovery',
      'BioPerine-enhanced for 2000% higher cellular absorption'
    ],
    ingredients: 'Curcuma Longa extract (95% curcuminoids) 500mg, BioPerine® (Piper Nigrum extract) 5mg.',
    dosage: '1 capsule twice daily with meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 6,
    name: 'Cap Livocin (30Cap)',
    category: 'Detox',
    price: 2199,
    originalPrice: 2799,
    rating: 4.7,
    reviews: 58,
    images: ['/products/product14.jpg', '/products/product14.1.jpg', '/products/product14.2.jpg'],
    color: '#d97706',
    icon: '🫒',
    badge: null,
    tagline: 'Potent hepatoprotective formula for liver detox and digestive care.',
    description: 'Cap Livocin is formulated with hepatoprotective botanicals like Andrographis Paniculata and Tribulus Terrestris. It aids in clearing toxic metabolites, supporting liver enzyme normalization, and promoting healthy digestion during therapy.',
    benefits: [
      'Supports liver enzyme (ALT/AST) normalization',
      'Aids clearance of clinical chemical residues and toxins',
      'Promotes healthy digestion, appetite, and gut lining',
      'Protects liver cells from oxidative stress and free radicals'
    ],
    ingredients: 'Andrographis Paniculata extract 350mg, Tribulus Terrestris extract 50mg, CAQO bio-enhancer.',
    dosage: '1 capsule twice daily after meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 7,
    name: 'Cap Fulvican (30Cap)',
    category: 'Stress & Recovery',
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    reviews: 65,
    images: ['/products/product13.jpg', '/products/product13.1.jpg', '/products/product13.2.jpg'],
    color: '#059669',
    icon: '🟢',
    badge: 'New',
    tagline: 'Premium purified Shilajit extract rich in Fulvic Acid for cellular energy.',
    description: 'Cap Fulvican features purified Asphaltum Punjabianum (Shilajit) extract rich in fulvic acid and essential trace minerals. It works at the mitochondrial level to rejuvenate energy production, enhance nutrient uptake, and speed up tissue recovery.',
    benefits: [
      'Boosts mitochondrial ATP energy production',
      'Rich source of fulvic acid and over 80 trace minerals',
      'Improves overall cellular nutrient and mineral absorption',
      'Alleviates deep exhaustion and promotes physical recovery'
    ],
    ingredients: 'Purified Asphaltum Punjabianum (Shilajit) extract 400mg (high fulvic acid content).',
    dosage: '1 capsule daily in the morning with warm water or milk, or as directed.',
    size: '30 capsules / 30-day supply',
    inStock: true
  },
  {
    id: 8,
    name: 'Frank Oil 100ml',
    category: 'Essential Oils',
    price: 1599,
    originalPrice: 1999,
    rating: 4.8,
    reviews: 74,
    images: ['/products/product8.jpg', '/products/product8.1.jpg', '/products/product8.4.jpg'],
    color: '#b45309',
    icon: '🫙',
    badge: null,
    tagline: '100% pure Boswellia Frerana oil for therapeutic aromatherapy and massage.',
    description: 'Frank Oil is a premium, therapeutic-grade Frankincense (Boswellia Frerana) essential oil. High in natural boswellic acids, it is ideal for soothing aromatherapy, stress relief, and topical application (diluted) to ease discomfort and inflammation.',
    benefits: [
      'Rich in active anti-inflammatory boswellic acids',
      'Promotes relaxation and reduces nervous tension or anxiety',
      'Soothes skin and supports tissue repair when diluted topically',
      '100% pure steam-distilled essential oil, free of synthetic additives'
    ],
    ingredients: '100% Pure Boswellia Frerana (Frankincense) essential oil. FSSAI certified.',
    dosage: 'Aromatherapy: Add 3–5 drops to a diffuser. Topical: Dilute with a carrier oil (e.g. coconut oil) and massage gently.',
    size: '100ml bottle',
    inStock: true
  },
  {
    id: 9,
    name: 'Tab Cyanolina (60Tab)',
    category: 'Nutrition',
    price: 599,
    originalPrice: 799,
    rating: 4.6,
    reviews: 47,
    images: ['/products/product16.1.jpg', '/products/product16.jpg', '/products/product16.2.jpg'],
    color: '#16a34a',
    icon: '🥥',
    badge: null,
    tagline: 'Blue Spirulina extract rich in Phycocyanin for antioxidant support.',
    description: 'Tab Cyanolina provides premium Spirulina tablets standardized for high Phycocyanin content. This blue superfood offers exceptional antioxidant defense, aids cell renewal, and supplies essential amino acids and trace minerals.',
    benefits: [
      'Rich in Phycocyanin, a powerful blue antioxidant compound',
      'Supports red blood cell production and oxygen transport',
      'Supplies essential plant-based proteins, amino acids, and B-vitamins',
      'Promotes natural cellular detoxification and immune defense'
    ],
    ingredients: 'Purified Spirulina Platensis extract 500mg. FSSAI certified.',
    dosage: '2 tablets daily with water, preferably in the morning.',
    size: '60 tablets / 30-day supply',
    inStock: true
  },
  {
    id: 10,
    name: 'Tab Phytox (60Tab)',
    category: 'Detox',
    price: 999,
    originalPrice: 1299,
    rating: 4.7,
    reviews: 87,
    images: ['/products/product7.1.jpg', '/products/product7.3.jpg', '/products/product7.4.jpg'],
    color: '#e11d48',
    icon: '💊',
    badge: null,
    tagline: 'Broken cell-wall Chlorella for heavy metal chelation & deep detox.',
    description: 'Tab Phytox features organic broken cell-wall Chlorella Pyrenoidosa. It is engineered to naturally bind and safely eliminate heavy metals, toxins, and drug metabolites from the body while restoring essential trace nutrition.',
    benefits: [
      'Binds heavy metals and environmental toxins for safe excretion',
      'Supports natural liver and kidney detoxification pathways',
      'Rich in natural chlorophyll, beta-glucans, and protein',
      'Provides comprehensive cellular nutrient replenishment and energy'
    ],
    ingredients: 'Chlorella Pyrenoidosa (broken cell wall) 400mg, chlorophyll buffers.',
    dosage: '2 tablets twice daily after meals with a full glass of water.',
    size: '60 tablets / 15-day supply',
    inStock: true
  },
  {
    id: 11,
    name: 'Quinoil',
    category: 'Nutrition',
    price: 1199,
    originalPrice: 1599,
    rating: 4.5,
    reviews: 63,
    images: ['/products/product6.1.jpg', '/products/product6.2.jpg', '/products/product6.3.jpg'],
    color: '#7c3aed',
    icon: '⚗️',
    badge: null,
    tagline: 'Premium bioactive lipid complex for cellular energy and weight support.',
    description: 'Quinoil is a premium organic lipid blend formulated to provide a concentrated, easily metabolized energy source. Formulated for recovery support, it helps preserve muscle mass and supports ketogenesis without causing blood sugar spikes.',
    benefits: [
      'Provides clean, rapid cellular energy bypassing glucose pathway',
      'Supports ketogenic metabolism during intensive clinical recovery',
      'Helps prevent muscle wasting and treatment-related cachexia',
      'Mild, neutral taste—easy to mix with food, salads, or smoothies'
    ],
    ingredients: 'Medium Chain Triglycerides (C8/C10 lipids) derived from organic coconut oil.',
    dosage: '1 tablespoon (15ml) daily mixed into food, salad dressings, or smoothies.',
    size: '250ml bottle',
    inStock: true
  },
  {
    id: 12,
    name: 'Anacose Powder',
    category: 'Nutrition',
    price: 1599,
    originalPrice: 1999,
    rating: 4.5,
    reviews: 41,
    images: ['/products/product12.0.jpg', '/products/product12.1.jpg', '/products/product12.2.jpg'],
    color: '#ca8a04',
    icon: '🌾',
    badge: null,
    tagline: 'Nutrient-dense herbal powder for digestive and appetite restoration.',
    description: 'Anacose Powder is a proprietary dietary supplement designed to stimulate appetite, improve digestion, and reduce treatment-related nausea. Its blend of traditional herbs helps the body absorb vital nutrients efficiently during recovery.',
    benefits: [
      'Restores appetite and reduces treatment-induced nausea',
      'Improves overall gastrointestinal health and gut lining stability',
      'Supports nutrient absorption and systemic energy balance',
      'Rich in natural fibers, minerals, and digestive enzymes'
    ],
    ingredients: 'Trigonella Foenum-Graecum (Fenugreek) extract, Zingiber Officinale (Ginger) extract, Elettaria Cardamomum.',
    dosage: '1 scoop (5g) mixed in warm water twice daily before meals.',
    size: '150g jar / 30-day supply',
    inStock: true
  },
  {
    id: 13,
    name: 'Methicon',
    category: 'Nutrition',
    price: 999,
    originalPrice: 1299,
    rating: 4.5,
    reviews: 38,
    images: [],
    color: '#854d0e',
    icon: '🌾',
    badge: null,
    tagline: 'Purified Methi extract for glycemic regulation and cellular defense.',
    description: 'Methicon is a purified, standardised extract made from Trigonella foenum-graecum (Methi) designed to effectively lower blood sugar levels, limiting the glucose-rich environment that fuels cancer growth, multiplication, and spread. Standardised to Glucomannan, this bioactive glycoside acts on key metabolic organs to stabilise glucose levels, giving the body a stronger, healthier platform to fight cancer without conventional metabolic side effects.',
    benefits: [
      'Lowers blood sugar levels to restrict abnormal cellular growth and replication',
      'Inhibits glucose pathways that fuel cancer cell multiplication and spread',
      'Standardised to Glucomannan for organ-level glycemic and metabolic stability',
      'Supports healthy insulin sensitivity and immune health without side effects'
    ],
    ingredients: 'Purified standardised extract of Trigonella foenum-graecum (Methi) (standardised to Glucomannan).',
    dosage: '1 capsule twice daily after meals with water.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 14,
    name: 'Cap K27 (30Cap)',
    category: 'Anti-Tumor',
    price: 2699,
    originalPrice: 3499,
    rating: 4.9,
    reviews: 82,
    images: ['/products/product15.jpg', '/products/product15.1.jpg', '/products/product15.2.jpg'],
    color: '#0d9488',
    icon: '🌿',
    badge: 'Premium',
    tagline: 'Flagship multi-pathway botanical defense capsule.',
    description: 'Cap K27 is a flagship formulation delivering a synergistic blend of anti-tumor botanicals designed to inhibit abnormal angiogenesis, stimulate cellular apoptosis, and support immune cell surveillance. Enhanced with the bio-active CAQO complex.',
    benefits: [
      'Comprehensive multi-pathway tumor defense and cellular protection',
      'Inhibits angiogenesis (blood supply formation to abnormal cells)',
      'Promotes normal healthy cell apoptosis and cycle regulation',
      'Enhanced with CAQO complex for maximum cellular bioavailability'
    ],
    ingredients: 'Proprietary K27 botanical complex (Curcumin, Boswellia, Ashwagandha), CAQO absorption enhancer.',
    dosage: '1-2 capsules daily as strictly directed by your oncology herbal specialist.',
    size: '30 capsules / 30-day supply',
    inStock: true
  },
  {
    id: 15,
    name: 'Cap Oxy95 (30Cap)',
    category: 'Immunity',
    price: 3299,
    originalPrice: 4199,
    rating: 4.6,
    reviews: 52,
    images: ['/products/product3.1.jpg', '/products/product3.2.jpg', '/products/product3.3.jpg'],
    color: '#6b21a8',
    icon: '🔮',
    badge: 'Premium',
    tagline: 'Oxygenation support formula for cellular energy and immune strength.',
    description: 'Cap Oxy95 is designed to support healthy cellular respiration and oxygenation. By promoting optimal oxygen delivery at the tissue level, it enhances cellular mitochondrial efficiency, boosts immune response, and fights extreme fatigue.',
    benefits: [
      'Supports optimal tissue oxygenation and respiration efficiency',
      'Enhances mitochondrial energy production and ATP synthesis',
      'Combats severe chronic treatment fatigue and weakness',
      'Boosts overall immune cellular activity and resistance'
    ],
    ingredients: 'Oxygen-coordinating organic herbal extracts, Cordyceps Sinensis extract.',
    dosage: '1 capsule twice daily after meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 16,
    name: 'Cap OxyForte (30Cap)',
    category: 'Immunity',
    price: 3999,
    originalPrice: 4999,
    rating: 4.6,
    reviews: 54,
    images: ['/products/product10.jpg', '/products/product10.1.jpg', '/products/product10.2.jpg'],
    color: '#0284c7',
    icon: '🌊',
    badge: 'Premium',
    tagline: 'Maximum strength cellular oxygenation and defense formula.',
    description: 'Cap OxyForte is our maximum-strength cellular oxygenation formulation. Engineered for patients requiring advanced support, it works synergistically to elevate cellular energy, optimize blood oxygen transport, and defend cells against oxidative stress.',
    benefits: [
      'Advanced cellular oxygenation and tissue perfusion support',
      'Protects cells from intensive therapeutic oxidative stress',
      'Supports red blood cell function and systemic oxygen delivery',
      'Strengthens immune cell modulation and defense mechanisms'
    ],
    ingredients: 'Concentrated organic oxygenators, proprietary botanical cell-defense blend.',
    dosage: '1 capsule twice daily after meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 17,
    name: 'Cap PSP (30Cap)',
    category: 'Immunity',
    price: 1399,
    originalPrice: 1799,
    rating: 4.7,
    reviews: 64,
    images: [],
    color: '#ec4899',
    icon: '🌸',
    badge: null,
    tagline: 'Polysaccharide-Peptide formulation for deep immune system modulation.',
    description: 'Cap PSP features purified Polysaccharide-Peptide (PSP) extracts derived from Coriolus Versicolor (Turkey Tail mushroom). Widely researched in oncology, PSP is a potent immunomodulator that supports T-cell and NK-cell counts during clinical therapies.',
    benefits: [
      'Modulates and strengthens the immune response',
      'Supports T-lymphocyte and Natural Killer (NK) cell populations',
      'Helps mitigate severe side effects of conventional treatments',
      'FSSAI certified, highly researched botanical immune support'
    ],
    ingredients: 'Coriolus Versicolor (Turkey Tail) extract standardized to 40% polysaccharides 500mg.',
    dosage: '1 capsule twice daily after meals with water.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 18,
    name: '3C (30Cap)',
    category: 'Anti-Tumor',
    price: 1799,
    originalPrice: 2299,
    rating: 4.8,
    reviews: 79,
    images: ['/products/product5.1.jpg', '/products/product5.2.jpg', '/products/product5.3.jpg'],
    color: '#f43f5e',
    icon: '⚡',
    badge: null,
    tagline: 'Triple-action botanical complex targeting abnormal cell pathways.',
    description: '3C is a triple-action formulation combining three of the most researched anti-tumor herbs in integrative herbal medicine. It works synergistically to inhibit abnormal cell signaling, support healthy cell cycle regulation, and reduce chronic inflammation.',
    benefits: [
      'Synergistic triple-herb anti-tumor pathway support',
      'Aids in healthy cell cycle regulation and cellular protection',
      'Helps suppress major systemic inflammatory markers (TNF-alpha, IL-6)',
      'Works safely alongside conventional treatment protocols to enhance outcomes'
    ],
    ingredients: 'Curcuma Longa extract (standardized curcuminoids 95%), Green Tea Extract (EGCG 50%), Boswellia Serrata extract.',
    dosage: '1 capsule twice daily after meals.',
    size: '30 capsules / 15-day supply',
    inStock: true
  },
  {
    id: 19,
    name: 'Tab BLOO',
    category: 'Anti-Tumor',
    price: 3740,
    originalPrice: 4690,
    rating: 4.9,
    reviews: 110,
    images: [],
    color: '#3b82f6',
    icon: '💎',
    badge: 'Premium',
    tagline: 'Specialized bio-active formulation for comprehensive oncology support.',
    description: 'Tab BLOO is a premium, high-potency tablet formulation developed by Cancer Herbalist for advanced complementary support. Combining rare botanical extracts and active phyto-nutrients, it promotes healthy cell signaling, cellular detoxification, and robust immune defenses.',
    benefits: [
      'Advanced bio-active cellular defense and signaling formula',
      'Promotes healthy cellular signaling and programmed cell death (apoptosis)',
      'Encourages deep tissue detoxification and metabolic clearance',
      'Supports systemic defense, patient recovery, and general vitality'
    ],
    ingredients: 'Proprietary oncology-support phyto-nutrient complex, rare organic botanical extracts, bio-enhancers.',
    dosage: '1 tablet daily after breakfast, or as recommended by your healthcare specialist.',
    size: '30 tablets / 30-day supply',
    inStock: true
  }
];

const initialBlogs = [
  {
    id: 1,
    title: 'A Remarkable Prostate Cancer Journey: When Symptoms Were Not Obvious',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    category: 'Nutrition',
    author: 'By Prof. Ramesh',
    readTime: '8 min read',
    date: 'February 21, 2026',
    excerpt: 'A 74-year-old man\'s prostate cancer diagnosis was delayed due to atypical symptoms. Learn how elevated PSA levels led to diagnosis and explore the role of supportive nutrition in his cancer care journey.',
    content: 'A 74-year-old man\'s prostate cancer diagnosis was delayed due to atypical symptoms. Supportive nutrition and herbal therapies played an essential role alongside his conventional treatment plan.'
  },
  {
    id: 2,
    title: 'The Rise of Precision Oncology: How Personalized Cancer Treatment Is Changing Lives',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    category: 'Cancer Research',
    author: 'By Prof. Ramesh',
    readTime: '8 min read',
    date: 'March 10, 2026',
    excerpt: 'Discover how genetic testing, artificial intelligence, targeted therapies, and immunotherapy are transforming cancer treatment through personalized care and improved patient outcomes.',
    content: 'Discover how genetic testing, artificial intelligence, targeted therapies, and immunotherapy are transforming cancer treatment through personalized care and improved patient outcomes.'
  },
  {
    id: 3,
    title: '10 Early Warning Signs of Cancer That Should Never Be Ignored',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Cancer Awareness',
    author: 'By Prof. Ramesh',
    readTime: '8 min read',
    date: 'February 28, 2026',
    excerpt: 'Recognizing early warning signs of cancer—such as unexplained weight loss, persistent fatigue, unusual lumps, or chronic pain—can lead to timely diagnosis and significantly better treatment outcomes.',
    content: 'Recognizing early warning signs of cancer—such as unexplained weight loss, persistent fatigue, unusual lumps, or chronic pain—can lead to timely diagnosis and significantly better treatment outcomes.'
  }
];

const initialTestimonials = [
  {
    id: 1,
    name: 'Subash Ricardo S',
    location: 'Chennai',
    rating: 5,
    text: 'My uncle was diagnosed with advanced colon cancer, and we started treatment at Cancer Herbalist after several cycles of chemotherapy. Although it was very late, the consultants and staff were supportive and always available for guidance.\n\nAfter taking the herbal kit, my uncle felt better for several months. Sadly, he later passed away. We are grateful to the entire Cancer Herbalist team for their care, support, and compassion during a difficult time.',
    date: 'Recent'
  },
  {
    id: 2,
    name: 'Anand Keerthana',
    location: 'Vandawasi, near Chennai',
    rating: 5,
    text: 'My son Sarvesh is 2 years old and diagnosed with Adrenal cancer. We gave treatment of radiotherapy and chemotherapy after surgery. Last scan showed spread to bones. With the fear of losing him, we went to Cancer Herbalist, Bangalore and started herbal therapy. It was the right place. Now after 6 months, the child is very active, normal and no pain or swelling. The leg bone spread appears to be not active. Sarvesh also gained 3 kg weight. Don\'t fear for herbal therapy. It is safe for children.',
    date: 'a year ago'
  },
  {
    id: 3,
    name: 'Nayana Gowda',
    location: 'Bangalore, India',
    rating: 5,
    text: 'It\'s really heartening to see my friend getting relieved from breast cancer after taking treatment from Cancer Herbalist Bangalore. Best part is no side effects and economical. Hope she completely gets cured. I recommend all cancer patients to try once.',
    date: '3 years ago'
  },
  {
    id: 4,
    name: 'Devendra Sharma',
    location: 'India',
    rating: 5,
    text: 'The support doesn\'t stop at sending herbal supplements. The lifestyle diet charts and weekly follow-up consultations were vital in keeping me positive throughout my treatment.',
    date: '3 months ago'
  }
];

const defaultWebsiteContent = {
  contact: {
    phone: '+91 88845 88835',
    email: 'cancerherbalist@gmail.com',
    whatsapp: '918884588835',
    timings: 'Mon–Sat, 9 AM–6 PM',
    address: 'Bangalore, India'
  },
  stats: [
    { value: 4000, suffix: '+', label: 'Patients Served', sublabel: 'Worldwide' },
    { value: 10, suffix: '+', label: 'Countries', sublabel: 'Global Reach' },
    { value: 7000, suffix: '+', label: 'Consultations', sublabel: 'Completed' },
    { value: 35, suffix: '+', label: 'Years of Research Experience', sublabel: 'Expert Practice' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', sublabel: 'Patient Feedback' }
  ],
  whyChooseUs: {
    title: 'Why Patients Trust Us',
    subtitle: 'Our integrative approach combines clinical precision with compassionate, whole-person care.',
    items: [
      { title: 'Personalized Protocols', desc: 'Every patient receives a unique herbal formula tailored to their specific cancer type, staging, and treatment history.' },
      { title: 'Safety-First Approach', desc: 'All herbs are screened against your medications to eliminate drug-herb interactions before we begin.' },
      { title: 'Continuous Support', desc: 'Weekly check-ins, diet adjustments, and formula refinements so you are never alone on your healing path.' },
      { title: 'Certified Organic Sourcing', desc: 'We source from GMP-certified organic farms with full lab-tested purity and potency reports.' }
    ]
  },
  healingPillars: {
    title: 'Three Pillars of Recovery',
    subtitle: 'A clinically structured framework that addresses the physical, nutritional, and immunological dimensions of cancer care.',
    items: [
      { title: 'Herbal Formulation', stat: '20+', statLabel: 'Custom Blends', desc: 'Precision-crafted tinctures combining ancient wisdom with modern pharmacognosy research.' },
      { title: 'Lifestyle Integration', stat: '95%', statLabel: 'Patient Compliance', desc: 'Anti-cancer nutrition plans, breathing protocols, and stress-reduction frameworks.' },
      { title: 'Immune Optimization', stat: '87%', statLabel: 'Improved Markers', desc: 'Targeted adaptogens and immunomodulators to strengthen your bodys natural defenses.' }
    ]
  },
  heroSlides: [
    {
      id: 1,
      badge: '🌿 Natural Cancer Treatment Specialists',
      headline: 'Fight Cancer Holistically',
      headlineAccent: 'Holistically',
      subline: 'Combining ancient herbal wisdom with modern medical knowledge for personalized cancer support.',
      highlights: [
        'Natural Herbal Treatments',
        'Certified Practitioners',
        'Personalized Care Plans',
        'Regular Support (9AM–6PM)'
      ],
      statValue: '4000+',
      statLabel: 'Patients Supported',
      ctaLabel: 'Book Free Consultation',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Watch Story',
      secondaryCtaHref: '/testimonials'
    },
    {
      id: 2,
      badge: '⏰ Unmatched Patient Dedication',
      headline: '1–2 Hours With Every Patient',
      headlineAccent: 'Every Patient',
      subline: 'While the industry average is just 15 minutes, Prof. Ramesh personally reviews your reports, scans, and history in a deep one-on-one session.',
      highlights: [
        'Full Report Review',
        'Scan & Biopsy Analysis',
        'Personalized Strategy',
        'Zero Rushed Consultations'
      ],
      statValue: '1–2 Hrs',
      statLabel: 'Personal Time Per Patient',
      ctaLabel: 'Book Your Session',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Read Success Stories',
      secondaryCtaHref: '/testimonials'
    },
    {
      id: 3,
      badge: '🎗️ Complete Cancer Coverage',
      headline: 'Every Cancer Type, One Team',
      headlineAccent: 'One Team',
      subline: 'From common to rare — breast, lung, blood, brain, pancreatic and beyond. No diagnosis is out of scope. We build a personalised herbal pathway for every patient.',
      highlights: [
        'Breast & Gynaecological',
        'Lung & Respiratory',
        'Blood & Lymphatic',
        'Brain, Bone & Rare Types'
      ],
      statValue: '∞',
      statLabel: 'No Cancer Is Out of Scope',
      ctaLabel: 'Find Your Program',
      ctaHref: '/care-programs',
      secondaryCtaLabel: 'See All Programs',
      secondaryCtaHref: '/care-programs'
    },
    {
      id: 4,
      badge: '🧪 Integrative, Not Alternative',
      headline: 'Works Alongside Chemotherapy',
      headlineAccent: 'Chemotherapy',
      subline: 'Our herbal protocols are screened for drug-herb interactions and complement your conventional treatment — reducing side effects and supporting recovery.',
      highlights: [
        'No Drug Conflicts',
        'Reduces Chemo Side Effects',
        'Supports Immunity',
        'Improves Quality of Life'
      ],
      statValue: '87%',
      statLabel: 'Patients Report Improved Energy',
      ctaLabel: 'Start Integrative Care',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Explore Our Products',
      secondaryCtaHref: '/store'
    },
    {
      id: 5,
      badge: '❤️ No Patient Left Alone',
      headline: 'Weekly Follow-Ups, Every Time',
      headlineAccent: 'Every Time',
      subline: 'Your protocol evolves with you. Our team refines your diet plans, herbal formulas, and lifestyle guidance every week based on how your body responds.',
      highlights: [
        'Custom Diet Charts',
        'WhatsApp Support Line',
        'Formula Adjustments',
        'Monthly Report Reviews'
      ],
      statValue: '95%',
      statLabel: 'Patient Retention Rate',
      ctaLabel: 'Join Our Program',
      ctaHref: '/contact',
      secondaryCtaLabel: 'Meet Our Team',
      secondaryCtaHref: '/doctors'
    },
    {
      id: 6,
      badge: '🛡️ Certified, Safe & Trusted',
      headline: 'FSSAI Certified Pharmaceuticals',
      headlineAccent: 'Pharmaceuticals',
      subline: "Every herbal product is lab-tested, made by standardized extracts, and FSSAI certified. We're not making claims — we're backed by science, certification, and 35+ years of research & practice.",
      highlights: [
        'Lab-Tested Purity',
        'Standardized Extracts',
        'FSSAI Licence Verified',
        '35+ Years of Research'
      ],
      statValue: '35+',
      statLabel: 'Years of Research & Practice',
      ctaLabel: 'Shop Certified Products',
      ctaHref: '/store',
      secondaryCtaLabel: 'Learn About Us',
      secondaryCtaHref: '/about'
    }
  ],
  aboutVideo: {
    title: 'Watch Our Story',
    subtitle: 'Discover how we combine scientific research and botanical medicine to support cancer patients.',
    videoUrl: 'https://res.cloudinary.com/zm8wxsqy/video/upload/v1783229564/Cancer_video_ahljqs.mp4',
    thumbnailUrl: '/logo.png'
  },
  aboutCaseStudies: {
    title: 'Clinical Success & Case Studies',
    subtitle: 'Verified cases demonstrating recovery and significant quality-of-life improvements using Herbal Chemotherapy (HCT) and Nutrition Therapy (NT).',
    items: [
      {
        badge: '4th Stage Colon Cancer',
        title: 'UK Patient Recovery',
        description: 'Recovery of a 62-year-old patient diagnosed with 4th stage Colon Cancer from London, UK. The response and recovery details surprised oncologists in the UK.'
      },
      {
        badge: '4th Stage Lung Cancer',
        title: 'Long-Term Survival Recovery',
        description: 'A female patient who was given only a few months to live recovered completely from 4th stage Lung Cancer. She has been leading a normal, healthy life past 2 years.'
      },
      {
        badge: '4th Stage Pancreatic Cancer',
        title: 'Inoperable Tumor Response',
        description: 'A 67-year-old patient from Chennai with IV stage Pancreatic Cancer was deemed inoperable. After 4 months of Nutrition Therapy (NT) at Cancer Herbalist, he recovered completely and has lived normally for over 2 years.'
      },
      {
        badge: 'Elderly Care (Ages 80+)',
        title: 'Enhanced Response in Elderly',
        description: 'Satisfactory clinical observations in patients aged 80 and above. Results show a higher rate of response to botanical medicine protocols, often because they do not carry the burden of concurrent aggressive therapies.'
      },
      {
        badge: 'Neck Cancer & Heart Failure',
        title: 'Complex Double Condition Recovery',
        description: 'A rare success case of a heart failure patient from Hyderabad suffering from Neck Cancer who achieved complete cure/remission in 3 months of supportive therapy.'
      }
    ]
  }
};

// Seed databases asynchronously if they are missing or do not contain the initial items
const seedDatabase = async () => {
  try {
    // Products Seed
    let products = await dbRead('products');
    if (!products || !Array.isArray(products)) {
      products = [];
    }
    let updatedProducts = false;

    initialProducts.forEach(ip => {
      const existing = products.find(p => p.id === ip.id);
      if (!existing) {
        products.push(ip);
        updatedProducts = true;
      }
    });
    if (updatedProducts || products.length === 0) {
      products.sort((a, b) => a.id - b.id);
      await dbWrite('products', products);
    }

    // Load prices into memory
    products.forEach(p => {
      if (p.id) {
        priceListModule.PRODUCT_PRICES[p.id] = Number(p.price);
      }
    });

    // Blogs Seed
    let blogs = await dbRead('blogs');
    if (!blogs || !Array.isArray(blogs)) {
      blogs = [];
    }
    let updatedBlogs = false;
    initialBlogs.forEach(ib => {
      if (!blogs.some(b => b.id === ib.id)) {
        blogs.push(ib);
        updatedBlogs = true;
      }
    });
    if (updatedBlogs || blogs.length === 0) {
      blogs.sort((a, b) => a.id - b.id);
      await dbWrite('blogs', blogs);
    }

    // Testimonials Seed
    let testimonials = await dbRead('testimonials');
    if (!testimonials || !Array.isArray(testimonials)) {
      testimonials = [];
    }
    let updatedTestimonials = false;
    initialTestimonials.forEach(it => {
      if (!testimonials.some(t => t.id === it.id || (t.name === it.name && t.text === it.text))) {
        testimonials.push(it);
        updatedTestimonials = true;
      }
    });
    // Ensure all testimonials have an id
    testimonials = testimonials.map((t, idx) => {
      if (!t.id) {
        t.id = 100 + idx;
        updatedTestimonials = true;
      }
      return t;
    });
    if (updatedTestimonials || testimonials.length === 0) {
      await dbWrite('testimonials', testimonials);
    }

    // Website Content Seed
    const webContent = await dbRead('website_content');
    if (!webContent) {
      await dbWrite('website_content', defaultWebsiteContent);
    } else {
      // Merge structure in case we add fields later
      const merged = { ...defaultWebsiteContent, ...webContent };
      await dbWrite('website_content', merged);
    }
  } catch (err) {
    console.error('[seedDatabase] failed:', err.message);
  }
};

// Execute seeding asynchronously
seedDatabase();

/* ── PRODUCTS API ──────────────────────────────────────────────── */
router.get('/dynamic-products', async (req, res) => {
  try {
    const dynamic = await dbRead('products') || [];
    res.json({ success: true, products: dynamic });
  } catch (err) {
    console.error('[products GET] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch products.' });
  }
});

router.post('/dynamic-products', checkAdmin, async (req, res) => {
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.price) {
    return res.status(400).json({ success: false, error: 'Product name and price are required.' });
  }

  try {
    const list = await dbRead('products') || [];
    // Auto increment ID (starting from 100 to avoid clash with hardcoded IDs 1-19)
    const nextId = list.length > 0 ? Math.max(...list.map(p => p.id || 0)) + 1 : 100;
    
    const product = {
      id: nextId,
      name: newProduct.name,
      category: newProduct.category || 'Other',
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || newProduct.price),
      rating: Number(newProduct.rating || 5),
      reviews: Number(newProduct.reviews || 0),
      images: Array.isArray(newProduct.images) ? newProduct.images : [],
      color: newProduct.color || '#1a6e52',
      icon: newProduct.icon || '🌿',
      badge: newProduct.badge || null,
      tagline: newProduct.tagline || '',
      description: newProduct.description || '',
      benefits: Array.isArray(newProduct.benefits) ? newProduct.benefits : [],
      ingredients: newProduct.ingredients || '',
      dosage: newProduct.dosage || '',
      size: newProduct.size || '',
      inStock: newProduct.inStock !== false,
    };

    list.push(product);
    if (await dbWrite('products', list)) {
      priceListModule.PRODUCT_PRICES[product.id] = product.price;
      res.json({ success: true, product });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[products POST] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save product.' });
  }
});

router.put('/dynamic-products/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const updatedProduct = req.body;
  if (!updatedProduct.name || !updatedProduct.price) {
    return res.status(400).json({ success: false, error: 'Product name and price are required.' });
  }

  try {
    const list = await dbRead('products') || [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    list[idx] = {
      ...list[idx],
      name: updatedProduct.name,
      category: updatedProduct.category || list[idx].category,
      price: Number(updatedProduct.price),
      originalPrice: Number(updatedProduct.originalPrice || updatedProduct.price),
      rating: Number(updatedProduct.rating || list[idx].rating || 5),
      reviews: Number(updatedProduct.reviews || list[idx].reviews || 0),
      images: Array.isArray(updatedProduct.images) ? updatedProduct.images : list[idx].images,
      color: updatedProduct.color || list[idx].color || '#1a6e52',
      icon: updatedProduct.icon || list[idx].icon || '🌿',
      badge: updatedProduct.badge !== undefined ? updatedProduct.badge : list[idx].badge,
      tagline: updatedProduct.tagline || list[idx].tagline || '',
      description: updatedProduct.description || list[idx].description || '',
      benefits: Array.isArray(updatedProduct.benefits) ? updatedProduct.benefits : list[idx].benefits,
      ingredients: updatedProduct.ingredients || list[idx].ingredients || '',
      dosage: updatedProduct.dosage || list[idx].dosage || '',
      size: updatedProduct.size || list[idx].size || '',
      inStock: updatedProduct.inStock !== undefined ? updatedProduct.inStock : list[idx].inStock,
    };

    if (await dbWrite('products', list)) {
      priceListModule.PRODUCT_PRICES[id] = Number(updatedProduct.price);
      res.json({ success: true, product: list[idx] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[products PUT] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update product.' });
  }
});

router.delete('/dynamic-products/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const list = await dbRead('products') || [];
    const filtered = list.filter(p => p.id !== id);
    if (list.length === filtered.length) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    if (await dbWrite('products', filtered)) {
      delete priceListModule.PRODUCT_PRICES[id];
      res.json({ success: true, message: 'Product deleted successfully.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[products DELETE] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
});

/* ── BLOGS API ────────────────────────────────────────────────── */
router.get('/dynamic-blogs', async (req, res) => {
  try {
    const dynamic = await dbRead('blogs') || [];
    res.json({ success: true, blogs: dynamic });
  } catch (err) {
    console.error('[blogs GET] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs.' });
  }
});

router.post('/dynamic-blogs', checkAdmin, async (req, res) => {
  const newBlog = req.body;
  if (!newBlog.title || !newBlog.excerpt) {
    return res.status(400).json({ success: false, error: 'Title and excerpt are required.' });
  }

  try {
    const list = await dbRead('blogs') || [];
    const nextId = list.length > 0 ? Math.max(...list.map(b => b.id || 0)) + 1 : 100;

    const blog = {
      id: nextId,
      title: newBlog.title,
      image: newBlog.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
      category: newBlog.category || 'Other',
      author: newBlog.author || 'By Dr. Herbalist',
      readTime: newBlog.readTime || '5 min read',
      date: newBlog.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      excerpt: newBlog.excerpt,
      content: newBlog.content || '',
    };

    list.push(blog);
    if (await dbWrite('blogs', list)) {
      res.json({ success: true, blog });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[blogs POST] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save blog.' });
  }
});

router.put('/dynamic-blogs/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const updatedBlog = req.body;
  if (!updatedBlog.title || !updatedBlog.excerpt) {
    return res.status(400).json({ success: false, error: 'Title and excerpt are required.' });
  }

  try {
    const list = await dbRead('blogs') || [];
    const idx = list.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Blog not found.' });
    }

    list[idx] = {
      ...list[idx],
      title: updatedBlog.title,
      image: updatedBlog.image || list[idx].image,
      category: updatedBlog.category || list[idx].category,
      author: updatedBlog.author || list[idx].author,
      readTime: updatedBlog.readTime || list[idx].readTime,
      date: updatedBlog.date || list[idx].date,
      excerpt: updatedBlog.excerpt,
      content: updatedBlog.content || list[idx].content || '',
    };

    if (await dbWrite('blogs', list)) {
      res.json({ success: true, blog: list[idx] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[blogs PUT] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update blog.' });
  }
});

router.delete('/dynamic-blogs/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const list = await dbRead('blogs') || [];
    const filtered = list.filter(b => b.id !== id);
    if (list.length === filtered.length) {
      return res.status(404).json({ success: false, error: 'Blog not found.' });
    }

    if (await dbWrite('blogs', filtered)) {
      res.json({ success: true, message: 'Blog deleted successfully.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[blogs DELETE] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete blog.' });
  }
});

/* ── TESTIMONIALS API ─────────────────────────────────────────── */
router.get('/dynamic-testimonials', async (req, res) => {
  try {
    const dynamic = await dbRead('testimonials') || [];
    res.json({ success: true, testimonials: dynamic });
  } catch (err) {
    console.error('[testimonials GET] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials.' });
  }
});

router.post('/dynamic-testimonials', checkAdmin, async (req, res) => {
  const newTestimonial = req.body;
  if (!newTestimonial.name || !newTestimonial.text) {
    return res.status(400).json({ success: false, error: 'Name and testimonial text are required.' });
  }

  try {
    const list = await dbRead('testimonials') || [];
    const nextId = list.length > 0 ? Math.max(...list.map(t => t.id || 0)) + 1 : 100;
    
    const testimonial = {
      id: nextId,
      name: newTestimonial.name,
      location: newTestimonial.location || 'India',
      rating: Number(newTestimonial.rating || 5),
      text: newTestimonial.text,
      date: newTestimonial.date || 'Recent',
      videoUrl: newTestimonial.videoUrl || '',
      thumbnailUrl: newTestimonial.thumbnailUrl || '',
    };

    list.push(testimonial);
    if (await dbWrite('testimonials', list)) {
      res.json({ success: true, testimonial });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[testimonials POST] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save testimonial.' });
  }
});

router.put('/dynamic-testimonials/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const updatedTestimonial = req.body;
  if (!updatedTestimonial.name || !updatedTestimonial.text) {
    return res.status(400).json({ success: false, error: 'Name and testimonial text are required.' });
  }

  try {
    const list = await dbRead('testimonials') || [];
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Testimonial not found.' });
    }

    list[idx] = {
      ...list[idx],
      name: updatedTestimonial.name,
      location: updatedTestimonial.location || list[idx].location,
      rating: Number(updatedTestimonial.rating || list[idx].rating || 5),
      text: updatedTestimonial.text,
      date: updatedTestimonial.date || list[idx].date,
      videoUrl: updatedTestimonial.videoUrl !== undefined ? updatedTestimonial.videoUrl : list[idx].videoUrl,
      thumbnailUrl: updatedTestimonial.thumbnailUrl !== undefined ? updatedTestimonial.thumbnailUrl : list[idx].thumbnailUrl,
    };

    if (await dbWrite('testimonials', list)) {
      res.json({ success: true, testimonial: list[idx] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[testimonials PUT] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update testimonial.' });
  }
});

router.delete('/dynamic-testimonials/:id', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const list = await dbRead('testimonials') || [];
    const filtered = list.filter(t => t.id !== id);
    if (list.length === filtered.length) {
      return res.status(404).json({ success: false, error: 'Testimonial not found.' });
    }

    if (await dbWrite('testimonials', filtered)) {
      res.json({ success: true, message: 'Testimonial deleted successfully.' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[testimonials DELETE] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete testimonial.' });
  }
});

/* ── WEBSITE CONTENT API (Supabase-backed) ─────────────────────── */
router.get('/website-content', async (req, res) => {
  try {
    // 1. In-memory cache (warm instance fast path)
    if (_websiteContentCache) {
      return res.json({ success: true, content: _websiteContentCache });
    }
    // 2. Supabase (or filesystem fallback via dbRead)
    const data = await dbRead('website_content');
    if (data) {
      _websiteContentCache = data;
      return res.json({ success: true, content: data });
    }
    // 3. Hardcoded defaults — first ever run, nothing saved yet
    return res.json({ success: true, content: defaultWebsiteContent });
  } catch (err) {
    console.error('[website-content GET] Error:', err.message);
    return res.json({ success: true, content: defaultWebsiteContent });
  }
});

router.post('/website-content', checkAdmin, async (req, res) => {
  const newContent = req.body;
  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid content data.' });
  }
  try {
    // Write to Supabase (persistent across cold starts)
    const ok = await dbWrite('website_content', newContent);
    if (!ok) {
      console.warn('[website-content POST] dbWrite failed.');
    }
    // Always update memory cache so next GET is instant
    _websiteContentCache = newContent;
    return res.json({ success: true, content: newContent });
  } catch (err) {
    console.error('[website-content POST] Error:', err.message);
    // Still update memory cache so UI is not broken
    _websiteContentCache = newContent;
    return res.json({ success: true, content: newContent });
  }
});

module.exports = router;
