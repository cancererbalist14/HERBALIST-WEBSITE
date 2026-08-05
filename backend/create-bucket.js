const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

async function createBucket() {
  const { data, error } = await sb.storage.createBucket('product-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 10485760 // 10 MB
  });
  if (error && error.message && error.message.toLowerCase().includes('already exists')) {
    console.log('✅ Bucket already exists - ready to use!');
    return;
  }
  if (error) {
    console.error('❌ Error creating bucket:', error.message);
    return;
  }
  console.log('✅ product-images bucket created successfully!');
  console.log(JSON.stringify(data, null, 2));
}

createBucket();
