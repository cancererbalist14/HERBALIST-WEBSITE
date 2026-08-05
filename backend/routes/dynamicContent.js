const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const priceListModule  = require('./priceList');
const { dbRead, dbWrite, isUsingCloudStorage } = require('../utils/supabaseDb');

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
    if (!products || !Array.isArray(products) || products.length === 0) {
      // First-time seed: database key 'products' does not exist yet
      products = [...initialProducts];
      products.sort((a, b) => a.id - b.id);
      await dbWrite('products', products);
    } else {
      // Sync image updates and product data from initialProducts into stored products
      let updated = false;
      initialProducts.forEach(initP => {
        const existing = products.find(p => p.id === initP.id);
        if (existing) {
          if (JSON.stringify(existing.images || []) !== JSON.stringify(initP.images || [])) {
            existing.images = initP.images;
            updated = true;
          }
        }
      });
      if (updated) {
        await dbWrite('products', products);
        console.log('[dynamicContent] Synced latest product images from products.json to DB');
      }
    }

    // Load prices into memory — always populated from active DB products
    products.forEach(p => {
      if (p && p.id) {
        priceListModule.PRODUCT_PRICES[p.id] = Number(p.price);
      }
    });

    // Blogs Seed
    let blogs = await dbRead('blogs');
    if (!blogs || !Array.isArray(blogs)) {
      // First-time seed
      blogs = [...initialBlogs];
      blogs.sort((a, b) => a.id - b.id);
      await dbWrite('blogs', blogs);
    }

    // Testimonials Seed
    let testimonials = await dbRead('testimonials');
    if (!testimonials || !Array.isArray(testimonials)) {
      // First-time seed
      testimonials = initialTestimonials.map((t, idx) => ({
        ...t,
        id: t.id || (100 + idx),
      }));
      await dbWrite('testimonials', testimonials);
    }

    // Website Content Seed
    const webContent = await dbRead('website_content');
    if (!webContent) {
      await dbWrite('website_content', defaultWebsiteContent);
    } else {
      // Ensure the contact numbers are correctly updated in the database
      if (!webContent.contact) webContent.contact = {};
      webContent.contact.whatsapp = '918884588835';
      webContent.contact.phone = '+91 88845 88835';

      // Merge structure in case we add fields later
      const merged = { ...defaultWebsiteContent, ...webContent };
      merged.contact.whatsapp = '918884588835';
      merged.contact.phone = '+91 88845 88835';

      await dbWrite('website_content', merged);
    }
  } catch (err) {
    console.error('[seedDatabase] failed:', err.message);
  }
};

// Execute seeding asynchronously
seedDatabase();

/* ── IMAGE UPLOAD API ────────────────────────────────────────── */
// Accepts raw binary data. Client should set Content-Type to the image mime type.
// Query params: filename (string), contentType (string, e.g. image/jpeg)
router.post('/admin/upload-image', checkAdmin, (req, res, next) => {
  // Use express.raw() inline to parse the body as a Buffer
  express.raw({ type: '*/*', limit: '10mb' })(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: 'File too large or invalid body.' });
    next();
  });
}, async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({ success: false, error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const fileBuffer = req.body;
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'No file data received.' });
    }

    const originalName = (req.query.filename || 'product-image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = originalName.split('.').pop().toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const filePath = `products/${timestamp}_${originalName}`;
    const contentType = req.query.contentType || req.headers['content-type'] || 'image/jpeg';

    // Upload to Supabase Storage bucket 'product-images'
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('[upload-image] Supabase storage error:', error.message);
      return res.status(500).json({ success: false, error: `Upload failed: ${error.message}` });
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return res.status(500).json({ success: false, error: 'Uploaded but could not retrieve public URL.' });
    }

    res.json({ success: true, url: publicUrl, path: filePath });
  } catch (err) {
    console.error('[upload-image] Error:', err.message);
    res.status(500).json({ success: false, error: `Server error: ${err.message}` });
  }
});

/* ── PRODUCTS API ──────────────────────────────────────────────── */
router.get('/dynamic-products', async (req, res) => {

  try {
    const dynamic = await dbRead('products') || [];
    res.json({ success: true, products: dynamic, isUsingCloudStorage });
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

router.patch('/dynamic-products/:id/stock', checkAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { inStock } = req.body;

  if (typeof inStock !== 'boolean') {
    return res.status(400).json({ success: false, error: 'inStock must be a boolean.' });
  }

  try {
    const list = await dbRead('products') || [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    list[idx] = { ...list[idx], inStock };

    if (await dbWrite('products', list)) {
      // Keep initialProducts in sync so next seed reflects the stock state
      const ipIdx = initialProducts.findIndex(ip => ip.id === id);
      if (ipIdx !== -1) {
        initialProducts[ipIdx] = { ...initialProducts[ipIdx], inStock };
      }
      res.json({ success: true, product: list[idx] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to write to database.' });
    }
  } catch (err) {
    console.error('[products PATCH stock] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update stock status.' });
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
      const ipIdx = initialProducts.findIndex(ip => ip.id === id);
      if (ipIdx !== -1) {
        initialProducts.splice(ipIdx, 1);
      }
      try {
        const staticFile = path.join(__dirname, '..', 'data', 'products.json');
        if (fs.existsSync(staticFile)) {
          fs.writeFileSync(staticFile, JSON.stringify(filtered, null, 2), 'utf8');
        }
      } catch (e) {
        console.error('[products DELETE] Could not sync static products.json:', e.message);
      }
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
