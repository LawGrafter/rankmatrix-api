// index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const analyze = require('./Routes/analyze');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Main Analyze Route
app.post('/api/analyze', async (req, res) => {
  console.log('📩 Received analyze request for URL');
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  try {
    const { data: html } = await axios.get(url);
    const result = analyze(html);
    return res.json(result);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch or analyze answer key.' });
  }
});

// Local file analysis route
app.post('/api/analyze-local', (req, res) => {
  console.log('📩 Received analyze-local request');
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename is required.' });
  
  try {
    const html = fs.readFileSync(filename, 'utf8');
    const result = analyze(html);
    return res.json(result);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Failed to analyze local file.' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  console.log('📩 Received health check request');
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📋 Available routes:');
  console.log('  - POST /api/analyze');
  console.log('  - POST /api/analyze-local');
  console.log('  - GET /health');
});
