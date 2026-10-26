const http = require('http');

function checkEndpoint(pathname) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001' + pathname, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ pathname, statusCode: res.statusCode, length: data.length, contentType: res.headers['content-type'] });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing server endpoints on http://localhost:3001 ...');
  const endpoints = ['/', '/api/tasks', '/api/alerts', '/api/reports/class', '/css/styles.css', '/js/sound-alerts.js', '/js/app.js'];
  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    console.log(`[HTTP ${res.statusCode}] ${ep.padEnd(22)} (${res.length} bytes, ${res.contentType})`);
  }
}

run().catch(console.error);
