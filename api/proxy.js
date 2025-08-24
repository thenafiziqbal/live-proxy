const axios = require('axios');

module.exports = async (req, res) => {
  // CORS বাধা দূর করার জন্য সকল ডোমেইনকে অনুমতি দেওয়া
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, referer } = req.query;

  if (!url) {
    return res.status(400).send('Error: "url" parameter is missing.');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      headers: {
        // Referer বাধা দূর করার জন্য হেডার সেট করা
        'Referer': referer || new URL(url).origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
    res.status(200).send(response.data);

  } catch (error) {
    res.status(500).send(`Error fetching manifest: ${error.message}`);
  }
};
