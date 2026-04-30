
export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export type ElectionInfo = {
  id: string;
  title: string;
  description: string;
  type: 'Lok Sabha' | 'Vidhan Sabha' | 'Gram Panchayat' | 'Municipal';
  date?: string;
  importance: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type PollingBooth = {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export type NewsVerdict = 'True' | 'Fake' | 'Misleading';

export type NewsAnalysis = {
  verdict: NewsVerdict;
  explanation: string;
  confidence: number;
  sources: string[];
};

export type Chat = {
  id: string;
  userId: string;
  language: string;
  updatedAt: number;
  lastMessage: string;
};

export type GlobalStats = {
  usersHelped: number;
  queriesAnswered: number;
};
