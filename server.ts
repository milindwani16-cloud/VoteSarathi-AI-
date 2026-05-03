
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // News API Proxy
  app.get('/api/news', async (req, res) => {
    console.log('GET /api/news hit', req.query);
    const { query = 'India Elections', lang = 'en' } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey || 
        apiKey === 'YOUR_GNEWS_API_KEY' || 
        apiKey.trim() === '' || 
        apiKey === 'undefined' || 
        apiKey === 'null' || 
        apiKey === 'none') {
      console.log('Using fallback news data (API key missing or invalid)');
      return res.json({
        articles: [
          {
            title: "Upcoming General Elections: What you need to know",
            description: "A comprehensive guide to the upcoming voting cycle across India.",
            url: "https://eci.gov.in",
            image: "https://images.unsplash.com/photo-1540910419892-f0c97353ad62",
            publishedAt: new Date().toISOString(),
            source: { name: "Election Commission" }
          },
          {
            title: "Digital Voter ID: How to download and use",
            description: "The ECI is rolling out new features for the e-EPIC system.",
            url: "https://voters.eci.gov.in",
            image: "https://images.unsplash.com/photo-1533421680516-fca7e39a4d0d",
            publishedAt: new Date().toISOString(),
            source: { name: "Digital India" }
          }
        ]
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query as string)}&lang=${lang}&apikey=${apiKey}&max=5`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        // If it's a 400 or 401 (Auth error), return fallback data instead of error
        // Use console.log instead of error to avoid alarming logs for missing keys
        if (response.status === 400 || response.status === 401) {
          console.log('Returning fallback news data (API key missing or invalid)');
          return res.json({
            articles: [
              {
                title: "Upcoming General Elections: What you need to know",
                description: "A comprehensive guide to the upcoming voting cycle across India.",
                url: "https://eci.gov.in",
                image: "https://images.unsplash.com/photo-1540910419892-f0c97353ad62",
                publishedAt: new Date().toISOString(),
                source: { name: "Election Commission" }
              },
              {
                title: "Digital Voter ID: How to download and use",
                description: "The ECI is rolling out new features for the e-EPIC system.",
                url: "https://voters.eci.gov.in",
                image: "https://images.unsplash.com/photo-1533421680516-fca7e39a4d0d",
                publishedAt: new Date().toISOString(),
                source: { name: "Digital India" }
              }
            ]
          });
        }
        
        console.error('GNews API unexpected error:', response.status, errorText);
        return res.status(response.status).json({ error: 'News API returned an error', detail: errorText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('News API execution error:', error);
      if (error.name === 'AbortError') {
        res.status(504).json({ error: 'News API timeout' });
      } else {
        res.status(500).json({ error: 'Failed to fetch news', detail: error.message });
      }
    }
  });

  app.get('/api/booths', async (req, res) => {
    const { location } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY?.trim();

    if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY' || apiKey.length < 5) {
      // Return realistic fallback data for demo purposes if API key is missing
      return res.json({
        results: [
          {
            name: `Government Primary School, ${location}`,
            formatted_address: `Ward No. 12, Main Market Area, ${location}`,
            vicinity: `${location}`,
            geometry: { location: { lat: 28.6139, lng: 77.2090 } }
          },
          {
            name: `Secondary Vidya Mandir, ${location}`,
            formatted_address: `Nr. Railway Station, ${location}`,
            vicinity: `${location}`,
            geometry: { location: { lat: 28.6140, lng: 77.2091 } }
          }
        ]
      });
    }

    try {
      const query = `polling station near ${location}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
        console.error('Places API denied request:', data.error_message);
        return res.json({
          results: [
            {
              name: `Government School (Fallback), ${location}`,
              formatted_address: `Main District Area, ${location}`,
              vicinity: `${location}`,
              geometry: { location: { lat: 28.6139, lng: 77.2090 } }
            }
          ]
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Places API error:', error);
      res.status(500).json({ error: 'Failed to fetch booth locations' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
