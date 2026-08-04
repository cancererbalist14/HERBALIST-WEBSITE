const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read backend/.env
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envText = fs.readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envText.split('\n').forEach(line => {
  if (line.startsWith('SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanProducts() {
  const { data, error } = await supabase
    .from('site_data')
    .select('value')
    .eq('key', 'products')
    .single();

  if (error) {
    console.error('Error fetching products from Supabase:', error.message);
    return;
  }

  const products = data ? data.value : [];
  console.log('Current product count in Supabase:', products.length);
  console.log('Product IDs in Supabase:', products.map(p => p.id));

  // Filter out deleted product IDs 17 (Cap PSP), 18 (3C), 20 (TEST PRODUCT)
  const removeIds = [17, 18, 20];
  const cleaned = products.filter(p => !removeIds.includes(p.id));

  console.log('Cleaned product count:', cleaned.length);
  console.log('Cleaned Product IDs:', cleaned.map(p => p.id));

  const { error: updateError } = await supabase
    .from('site_data')
    .upsert({ key: 'products', value: cleaned, updated_at: new Date().toISOString() });

  if (updateError) {
    console.error('Error updating Supabase:', updateError.message);
  } else {
    console.log('✅ Successfully removed items 17, 18, and 20 from Supabase database!');
  }
}

cleanProducts();
