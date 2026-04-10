const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/delivery-manifest?from_date=2026-04-06&to_date=2026-04-30',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
