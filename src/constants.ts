
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
    titleKey: 'election_loksabha_title',
    typeKey: 'election_loksabha_type',
    descriptionKey: 'election_loksabha_desc',
    importanceKey: 'election_loksabha_importance',
    dateKey: 'election_loksabha_date'
  },
  {
    id: 'vidhan-sabha',
    titleKey: 'election_vidhansabha_title',
    typeKey: 'election_vidhansabha_type',
    descriptionKey: 'election_vidhansabha_desc',
    importanceKey: 'election_vidhansabha_importance',
    dateKey: 'election_vidhansabha_date'
  },
  {
    id: 'gram-panchayat',
    titleKey: 'election_grampanchayat_title',
    typeKey: 'election_grampanchayat_type',
    descriptionKey: 'election_grampanchayat_desc',
    importanceKey: 'election_grampanchayat_importance',
    dateKey: 'election_grampanchayat_date'
  },
  {
    id: 'municipal',
    titleKey: 'election_municipal_title',
    typeKey: 'election_municipal_type',
    descriptionKey: 'election_municipal_desc',
    importanceKey: 'election_municipal_importance',
    dateKey: 'election_municipal_date'
  }
];
