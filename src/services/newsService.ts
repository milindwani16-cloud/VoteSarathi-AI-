
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
    try {
      const response = await fetch(`/api/news?query=India Elections&lang=${lang}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Fetch news error:', error);
      return [];
    }
  }
};
