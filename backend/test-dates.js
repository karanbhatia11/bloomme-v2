const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJ1c2hpbHBhcnRuZXJAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1NDc1NzQ1LCJleHAiOjE3NzU1NjIxNDV9.NMOqkL4MCpuGmtEh3NxZ3ExBCBqPWfpoj2W3hbSXcTU';

// Calculate dates like the frontend does
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];
const tomorrowEndStr = new Date(tomorrow).toISOString().split('T')[0];

console.log('Today:', today.toISOString().split('T')[0]);
console.log('Tomorrow start:', tomorrowStr);
console.log('Tomorrow end:', tomorrowEndStr);

const options = {
  hostname: 'localhost',
  port: 5001,
  path: `/api/admin/delivery-manifest?from_date=${tomorrowStr}&to_date=${tomorrowEndStr}`,
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
      console.log('Tomorrow deliveries:', response.length);
    } else {
      console.log('Status:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
