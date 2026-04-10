const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1c2hpbHBhcnRuZXJAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1NDc1NzQ1LCJleHAiOjE3NzU1NjIxNDV9.NMOqkL4MCpuGmtEh3NxZ3ExBCBqPWfpoj2W3hbSXcTU';

const options = {
  hostname: 'localhost',
  port: 9000,
  path: '/api/admin/delivery-manifest?from_date=2026-04-07&to_date=2026-04-13',
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
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('Total records:', response.length);
      if (response.length > 0) {
        console.log('First record:', JSON.stringify(response[0], null, 2));
      }
    } else {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
