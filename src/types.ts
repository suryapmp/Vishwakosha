export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  content_urls?: {
    desktop: {
      page: string;
    };
  };
}

export interface DictionaryEntry {
  word: string;
  english?: WikipediaSummary;
  kannada?: WikipediaSummary;
  aiTranslation?: {
    translation: string;
    explanation: string;
  };
  timestamp: number;
}
