
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
}

interface NewsCache {
  [lang: string]: {
    data: NewsArticle[];
    timestamp: number;
  };
}

const cache: NewsCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const newsService = {
  async getLatestElectionNews(lang: string = 'en'): Promise<NewsArticle[]> {
    const cached = cache[lang];
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log('Returning cached news for:', lang);
      return cached.data;
    }

    const url = `/api/news?query=India Elections&lang=${lang}`;
    console.log('Fetching news from:', url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('News API response not OK:', response.status, response.statusText);
        // If we have stale cache, return it rather than nothing
        if (cached) return cached.data;
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      const articles = data.articles || [];
      
      // Update cache
      cache[lang] = { data: articles, timestamp: now };
      
      return articles;
    } catch (error) {
      console.error('Fetch news error detail:', error);
      return cached?.data || [];
    }
  }
};
