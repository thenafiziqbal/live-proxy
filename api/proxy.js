const axios = require('axios');
const { URL } = require('url');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, referer, type } = req.query;

  if (!url) {
    return res.status(400).send('Error: "url" parameter is missing.');
  }

  try {
    const response = await axios.get(url, {
      responseType: type === 'iframe' ? 'text' : 'stream',
      headers: {
        'Referer': referer || new URL(url).origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (type === 'iframe') {
      // যদি Iframe হয়, তবে HTML কন্টেন্টের বেস URL পরিবর্তন করে দেওয়া
      let htmlContent = response.data;
      const baseUrl = `<base href="${new URL(url).origin}/">`;
      htmlContent = htmlContent.replace('<head>', `<head>${baseUrl}`);
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(htmlContent);
    } else {
      // যদি M3U8 হয়, তবে সরাসরি স্ট্রিম পাইপ করা
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
      response.data.pipe(res);
    }

  } catch (error) {
    res.status(500).send(`Error fetching content: ${error.message}`);
  }
};
