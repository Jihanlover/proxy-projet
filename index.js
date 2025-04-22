const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/check', async (req, res) => {
  const proxies = req.body.proxies || [];
  const results = [];

  for (let proxy of proxies.slice(0, 100)) {
    const [ip, port] = proxy.split(':');
    let status = 'Dead', country = 'Unknown', responseTime = 0;

    const start = Date.now();
    try {
      const response = await axios.get('http://httpbin.org/ip', {
        proxy: { host: ip, port: parseInt(port) },
        timeout: 3000,
      });

      responseTime = Date.now() - start;
      status = 'Live';

      // Geo info
      const geo = await axios.get(`http://ip-api.com/json/${ip}`);
      country = geo.data.country || 'Unknown';

    } catch (e) {
      responseTime = Date.now() - start;
    }

    results.push({ proxy, status, responseTime, country });
  }

  res.json(results);
});

app.listen(3000, () => console.log('Proxy API running on port 3000'));
