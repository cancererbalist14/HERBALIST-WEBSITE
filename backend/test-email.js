require('dotenv').config();
const { sendStatusNotificationEmail } = require('./routes/emailService');

async function run() {
  console.log('Starting Email Service Test...');
  console.log('Target recipient:', process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com');
  console.log('Fallback APPS_SCRIPT_URL configured:', !!process.env.APPS_SCRIPT_URL);
  
  // Mock order object
  const mockOrder = {
    orderId: 'CH-TEST-999',
    customerName: 'Test Kumar',
    productName: 'Cap CH95 30Cap (Test)',
    quantity: 1,
    orderAmount: 799,
    paymentMethod: 'COD / Bank Transfer',
    paymentStatus: 'COD_PENDING',
    address: '75 JP Nagar, Phase 2',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560078',
    email: process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com',
    phone: '9876543210',
    awb: '1234567890',
    courierName: 'Shiprocket',
    trackingUrl: 'https://shiprocket.co/tracking/1234567890'
  };

  try {
    // Send a CANCELLED status update email to test both Customer and Admin/Doctor copy
    await sendStatusNotificationEmail(
      mockOrder,
      'CANCELLED',
      'This is a test notification. Your order CH-TEST-999 has been successfully cancelled in our systems.'
    );
    
    console.log('\n=======================================');
    console.log('✅ TEST INITIATED');
    console.log('Check your email inbox (and spam/promotions folder) for:');
    console.log('1. Customer copy sent to:', mockOrder.email);
    console.log('2. Admin copy sent to:', process.env.ADMIN_EMAIL || 'cancerherbalist@gmail.com');
    console.log('=======================================');
  } catch (err) {
    console.error('Test execution crashed:', err.message);
  }
}

run();
