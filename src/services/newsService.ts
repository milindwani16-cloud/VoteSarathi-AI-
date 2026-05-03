
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

export const newsService = {
  async getLatestElectionNews(lang: string = 'en'): Promise<NewsArticle[]> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/api/news?query=India Elections&lang=${lang}`;
    console.log('Fetching news from:', url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('News API response not OK:', response.status, response.statusText);
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Fetch news error detail:', error);
      return [];
    }
  }
};
