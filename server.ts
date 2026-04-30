
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

  // News Proxy Route
  app.get('/api/news', async (req, res) => {
    const { query = 'India Elections', lang = 'en' } = req.query;
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GNEWS_API_KEY') {
      // Return interesting fallback data if no key is provided
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
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query as string)}&lang=${lang}&apikey=${apiKey}&max=5`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('News API error:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // Google Cloud TTS Proxy
  app.post('/api/tts', async (req, res) => {
    const { text, languageCode = 'en-IN' } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'GOOGLE_API_KEY is missing' });
    }

    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { 
              languageCode, 
              // Removing ssmlGender: 'NEUTRAL' can sometimes help as it lets Google pick the best default
              // Or we can try to be more specific if we know the language
            },
            audioConfig: { 
              audioEncoding: 'MP3',
              speakingRate: 1.0,
              pitch: 0.0
            },
          }),
        }
      );

      const data = await response.json();
      if (data.audioContent) {
        res.json({ audioContent: data.audioContent });
      } else {
        // Deep log the error for debugging
        console.error('TTS API error detail:', JSON.stringify(data, null, 2));
        res.status(500).json({ error: 'Failed to synthesize speech', details: data });
      }
    } catch (error) {
      console.error('TTS execution error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Google Places Booth Search
  app.get('/api/booths', async (req, res) => {
    const { location } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'GOOGLE_API_KEY is missing' });
    }

    try {
      const query = `polling station near ${location}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Places API error:', error);
      res.status(500).json({ error: 'Failed to fetch booth locations' });
    }
  });

  // Vite middleware for development
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
