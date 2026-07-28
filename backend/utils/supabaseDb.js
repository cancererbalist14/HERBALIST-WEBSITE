/**
 * supabaseDb.js
 * ─────────────
 * Supabase-backed key-value store for Cancer Herbalist backend.
 *
 * Table schema (run this once in Supabase SQL Editor):
 * ─────────────────────────────────────────────────────
 *   CREATE TABLE IF NOT EXISTS site_data (
 *     key        TEXT PRIMARY KEY,
 *     value      JSONB NOT NULL,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE site_data ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "service_role_all" ON site_data
 *     FOR ALL USING (true) WITH CHECK (true);
 * ─────────────────────────────────────────────────────
 *
 * Keys used: 'products' | 'blogs' | 'testimonials' | 'website_content'
 */

const { createClient } = require('@supabase/supabase-js');
const fs   = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // use service_role key (not anon)

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null;

if (supabase) {
  console.log('✅  Supabase connected — using cloud storage.');
} else {
  console.warn('⚠️   Supabase not configured — falling back to filesystem storage.');
}

// ── Filesystem fallback paths (local dev / when Supabase is missing) ──────────
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR  = IS_VERCEL
  ? '/tmp/cancer-herbalist-data'
  : path.join(__dirname, '..', 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function fsRead(key) {
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`[fsRead] ${key}:`, e.message);
    throw new Error(`Filesystem read failure for "${key}": ${e.message}`);
  }
  return null;
}

function fsWrite(key, value) {
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error(`[fsWrite] ${key}:`, e.message);
    return false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Read a value by key.
 * Returns the parsed value, or null if not found.
 */
async function dbRead(key) {
  if (supabase) {
    const { data, error } = await supabase
      .from('site_data')
      .select('value')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error(`[dbRead] Supabase error for "${key}":`, error.message);
      throw new Error(`Database read failure for "${key}": ${error.message}`);
    }
    return data ? data.value : null;
  }
  return fsRead(key);
}

/**
 * Write (upsert) a value by key.
 * Returns true on success, false on failure.
 */
async function dbWrite(key, value) {
  let success = true;
  if (supabase) {
    const { error } = await supabase
      .from('site_data')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      console.error(`[dbWrite] Supabase error for "${key}":`, error.message);
      success = false;
    }
  }
  // In local development, also write to local data files so they can be committed to Git.
  if (!IS_VERCEL) {
    const fsSuccess = fsWrite(key, value);
    if (!supabase) success = fsSuccess;
  } else if (!supabase) {
    success = fsWrite(key, value);
  }
  return success;
}

module.exports = { dbRead, dbWrite, isUsingCloudStorage: !!supabase };
