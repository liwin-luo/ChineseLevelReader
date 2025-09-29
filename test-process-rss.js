const http = require('http');

// 测试RSS处理API
async function testProcessRSS() {
  const data = JSON.stringify({
    limit: 3
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/process-rss',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', chunk => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', error => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testProcessRSS().then(() => {
  console.log('Test completed');
}).catch(console.error);