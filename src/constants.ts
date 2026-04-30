
import { Language, ElectionInfo } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export const ELECTION_TYPES: ElectionInfo[] = [
  {
    id: 'lok-sabha',
    title: 'Lok Sabha Elections',
    type: 'Lok Sabha',
    description: 'General elections to elect Members of Parliament (MPs) to the lower house of India\'s bicameral Parliament.',
    importance: 'Decides the Prime Minister and the Union Government of India.',
    date: 'Upcoming: 2029'
  },
  {
    id: 'vidhan-sabha',
    title: 'Vidhan Sabha Elections',
    type: 'Vidhan Sabha',
    description: 'State Legislative Assembly elections to elect Members of Legislative Assembly (MLAs).',
    importance: 'Decides the Chief Minister and the State Government.',
    date: 'Varies by State'
  },
  {
    id: 'gram-panchayat',
    title: 'Gram Panchayat Elections',
    type: 'Gram Panchayat',
    description: 'Local self-government elections at the village level.',
    importance: 'Crucial for rural development and local governance.',
    date: 'Varies by District'
  },
  {
    id: 'municipal',
    title: 'Municipal Elections',
    type: 'Municipal',
    description: 'Elections for urban local bodies like Municipal Corporations and Councils.',
    importance: 'Focuses on city infrastructure, water, and sanitation.',
    date: 'Varies by City'
  }
];
