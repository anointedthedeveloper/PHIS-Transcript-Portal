const https = require('https');

const URL = process.env.RENDER_URL || 'https://phis-transcript-portal-api.onrender.com/';
const INTERVAL = 14 * 60 * 1000; // 14 minutes

function ping() {
  https.get(URL, (res) => {
    console.log(`[keep-alive] ${new Date().toISOString()} — status ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[keep-alive] ping failed: ${err.message}`);
  });
}

ping(); // ping immediately on start
setInterval(ping, INTERVAL);
