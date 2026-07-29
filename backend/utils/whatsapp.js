const https = require('https');

/**
 * Sends a WhatsApp message using the UltraMsg API.
 * @param {string} phone - The recipient's phone number.
 * @param {string} body - The text content of the message.
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
function sendWhatsAppMessage(phone, body) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    console.log('[WhatsApp] UltraMsg credentials not configured (ULTRAMSG_INSTANCE_ID or ULTRAMSG_TOKEN missing). Skipping.');
    return Promise.resolve({ success: false, error: 'Credentials not configured' });
  }

  // Format phone number: strip non-digits and add India code 91 if it's a 10-digit number
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const postData = new URLSearchParams({
    token: token,
    to: cleanPhone,
    body: body,
  }).toString();

  const options = {
    hostname: 'api.ultramsg.com',
    port: 443,
    path: `/${instanceId}/messages/chat`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const data = JSON.parse(responseBody);
          if (data.sent === 'true' || data.success) {
            console.log(`[WhatsApp] Message successfully sent to ${cleanPhone}. Message ID: ${data.id}`);
            resolve({ success: true, messageId: data.id });
          } else {
            console.warn(`[WhatsApp] Failed to send message to ${cleanPhone}:`, responseBody);
            resolve({ success: false, error: data.error || 'Unknown error' });
          }
        } catch (e) {
          console.warn(`[WhatsApp] Failed to parse UltraMsg response for ${cleanPhone}:`, responseBody);
          resolve({ success: false, error: 'JSON parse error' });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[WhatsApp] Request error for ${cleanPhone}:`, err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

module.exports = { sendWhatsAppMessage };
