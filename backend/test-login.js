const http = require('http');

const options = {
  hostname: 'localhost',
  port: 9000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  username: 'rushilpartner@gmail.com',
  password: 'gauravpartner'
});

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    const response = JSON.parse(body);
    console.log(JSON.stringify(response, null, 2));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
