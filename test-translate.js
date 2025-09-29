const http = require('http');

// 测试翻译API
async function testTranslation() {
  const data = JSON.stringify({
    text: '人工智能是计算机科学的一个分支',
    fromLanguage: 'zh',
    toLanguage: 'en'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/translate',
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

testTranslation().catch(console.error);