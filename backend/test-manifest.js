const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1c2hpbHBhcnRuZXJAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE0MDEyODUxLCJleHAiOjE3MTQwOTkyNTF9.s4nCt9-V7zC6Fq7c3K9qK-l9M0nZ1qZ-l9M0nZ1qZ-l8';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/delivery-manifest?from_date=2026-04-06&to_date=2026-04-30',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
