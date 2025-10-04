const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Serve static files from the public directory
app.use(express.static('public'));

// API proxy endpoint to avoid CORS issues
app.get('/api/:category', async (req, res) => {
  const { category } = req.params;
  const page = req.query.page || 1;

  try {
    const response = await fetch(`https://swapi.dev/api/${category}/?page=${page}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from SWAPI' });
  }
});

// API endpoint to get specific item
app.get('/api/:category/:id', async (req, res) => {
  const { category, id } = req.params;

  try {
    const response = await fetch(`https://swapi.dev/api/${category}/${id}/`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from SWAPI' });
  }
});

// Only listen if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`Star Wars API server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
