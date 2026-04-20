import { WikipediaSummary } from '../types';

/**
 * Finds the Kannada equivalent title of an English Wikipedia page.
 */
async function getKannadaTitle(englishWord: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=${encodeURIComponent(englishWord)}&lllang=kn&format=json&origin=*&redirects=1`;
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    const langlinks = pages[pageId].langlinks;
    
    if (langlinks && langlinks.length > 0) {
      return langlinks[0]['*']; // The Kannada title
    }
    return null;
  } catch (error) {
    console.error("Error finding Kannada translation:", error);
    return null;
  }
}

export async function fetchWikipediaSummary(word: string, lang: 'en' | 'kn'): Promise<WikipediaSummary | null> {
  try {
    let searchWord = word;
    
    // If we're looking for Kannada, try to find the actual Kannada title first
    if (lang === 'kn') {
      const knTitle = await getKannadaTitle(word);
      if (knTitle) {
        searchWord = knTitle;
      }
    }

    const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchWord)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${lang} summary:`, error);
    return null;
  }
}

/**
 * Fetches search suggestions for autocomplete.
 */
export async function fetchSuggestions(query: string, lang: 'en' | 'kn' = 'en'): Promise<string[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    return data[1] || []; // Data[1] is the list of titles
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
