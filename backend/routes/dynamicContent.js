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

const initialProducts = readData(path.join(__dirname, '..', 'data', 'products.json'));
const initialBlogs = readData(path.join(__dirname, '..', 'data', 'blogs.json'));
const initialTestimonials = readData(path.join(__dirname, '..', 'data', 'testimonials.json'));
const defaultWebsiteContent = (() => {
  try {
    const file = path.join(__dirname, '..', 'data', 'websiteContent.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
    }
  } catch (err) {
    console.error(`Error reading default website content:`, err);
  }
  return {};
})();

// Seed databases asynchronously if they are missing or do not contain the initial items
const seedDatabase = async () => {
  try {
    // Products Seed
    let products = await dbRead('products');
    if (!products || !Array.isArray(products)) {
      products = [];
    }
    let updatedProducts = false;

    // IMPORTANT: Sync initialProducts in-memory with DB prices FIRST.
    // This ensures that if /tmp is wiped (Vercel cold start without Supabase),
    // the seed data written back carries the latest admin-updated prices.
    products.forEach(dbProduct => {
      const ipIdx = initialProducts.findIndex(ip => ip.id === dbProduct.id);
      if (ipIdx !== -1) {
        // Update the in-memory seed to match DB (preserves price changes)
        initialProducts[ipIdx] = { ...initialProducts[ipIdx], ...dbProduct };
      }
    });

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

    // Load prices into memory — done AFTER reading DB so prices are always current
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
      // Update in-memory price list immediately for all active requests
      priceListModule.PRODUCT_PRICES[id] = Number(updatedProduct.price);

      // IMPORTANT: Also update the in-memory initialProducts seed array so that
      // the next server cold-start (e.g. Vercel /tmp wipe) seeds with the NEW price
      // instead of the original hardcoded price.
      const ipIdx = initialProducts.findIndex(ip => ip.id === id);
      if (ipIdx !== -1) {
        initialProducts[ipIdx] = { ...initialProducts[ipIdx], ...list[idx] };
      }

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
