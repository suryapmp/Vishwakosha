import { WikipediaSummary } from '../types';

/**
 * Detects if a string contains Kannada characters
 */
export function isKannada(text: string): boolean {
  return /[\u0C80-\u0CFF]/.test(text);
}

/**
 * Finds English equivalent for a Kannada term
 */
export async function getEnglishFromKannada(knWord: string): Promise<WikipediaSummary | null> {
  try {
    // 1. Get canonical Kannada title
    const knRes = await fetch(`https://kn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(knWord)}`);
    if (!knRes.ok) return null;
    const knData = await knRes.json();
    const canonicalKnTitle = knData.title;

    // 2. Find English link
    const url = `https://kn.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(canonicalKnTitle)}&prop=langlinks&lllang=en&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const langlinks = pages[pageId].langlinks;
      if (langlinks && langlinks[0]) {
        const enTitle = langlinks[0]['*'];
        return fetchWikipediaSummary(enTitle, 'en');
      }
    }
  } catch (e) {
    console.error("Reverse mapping error:", e);
  }
  return null;
}

/**
 * Robust multi-source system to fetch Kannada meaning
 */
export async function getKannadaMeaning(word: string, enExtract?: string): Promise<WikipediaSummary | null> {
  const wordLower = word.toLowerCase();
  let kannadaTitle: string | null = null;
  let translatedDescription: string | null = null;
  let translatedWord: string | null = null;

  // STEP 1: Try Kannada Wikipedia via Language Links
  try {
    const enSumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (enSumRes.ok) {
      const enSumData = await enSumRes.json();
      const canonicalTitle = enSumData.title || word;

      const langLinksUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(canonicalTitle)}&prop=langlinks&format=json&lllang=kn&origin=*`;
      const llRes = await fetch(langLinksUrl);
      const llData = await llRes.json();
      const pages = llData.query?.pages;

      if (pages) {
        const pageId = Object.keys(pages)[0];
        const langlinks = pages[pageId].langlinks;
        if (langlinks && langlinks.length > 0) {
          kannadaTitle = langlinks[0]['*'];
          
          const knSumRes = await fetch(`https://kn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kannadaTitle)}`);
          if (knSumRes.ok) {
            const knData = await knSumRes.json();
            // If we have a native article with a decent extract, use it
            if (knData.extract && knData.extract.length > 15) return knData;
          }
        }
      }
    }
  } catch (e) {
    console.error("Wikipedia Fallback Error:", e);
  }

  // STEP 2: Fallback - Translate the English Description (if provided)
  // This satisfies the "kannada meaning description from wikipedia" request
  if (enExtract) {
    try {
      const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(enExtract)}`;
      const transRes = await fetch(transUrl);
      if (transRes.ok) {
        const transData = await transRes.json();
        translatedDescription = transData[0].map((s: any) => s[0]).join('');
        if (translatedDescription) {
          return {
            title: word,
            extract: translatedDescription
          };
        }
      }
    } catch (e) {
      console.error("Description Translation Error:", e);
    }
  }

  // STEP 3: Last Resort - Basic Word Translation
  try {
    const contextMap: Record<string, string> = {
      "processor": "CPU or data processor",
      "algorithm": "computational procedure",
      "compiler": "programming language translator",
      "database": "structured electronics storage",
      "encryption": "securing data with code"
    };
    
    const context = contextMap[wordLower] || "technical term";
    const queryTerm = `${word} (${context})`;
    const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(queryTerm)}`;
    const transRes = await fetch(transUrl);
    
    if (transRes.ok) {
      const transData = await transRes.json();
      translatedWord = transData[0][0][0];
      const cleanMeaning = translatedWord.split('(')[0].trim();
      
      if (cleanMeaning) {
        return {
          title: word,
          extract: cleanMeaning,
        };
      }
    }
  } catch (e) {
    console.error("Final Translation Fallback Error:", e);
  }

  return null;
}

export async function fetchWikipediaSummary(word: string, lang: 'en' | 'kn', enExtract?: string): Promise<WikipediaSummary | null> {
  // If we're looking for English but give a Kannada word, try reverse lookup
  if (lang === 'en' && isKannada(word)) {
    return getEnglishFromKannada(word);
  }

  if (lang === 'kn') {
    return getKannadaMeaning(word, enExtract);
  }
  
  const attemptFetch = async (query: string): Promise<WikipediaSummary | null> => {
    try {
      const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!response.ok) return null;
      const data: WikipediaSummary = await response.json();
      
      // If result is a disambiguation page or very vague, it's not useful for a student dictionary
      if (data.type === 'disambiguation' || (data.extract && data.extract.toLowerCase().includes('may refer to'))) {
        return null;
      }

      // Thumbnail fallback
      if (!data.thumbnail) {
        data.thumbnail = {
          source: `https://picsum.photos/seed/${encodeURIComponent(word)}/400/300?grayscale&blur=1`,
          width: 400,
          height: 300
        };
      }
      return data;
    } catch (e) {
      return null;
    }
  };

  // Primary attempt
  let result = await attemptFetch(word);

  // If primary attempt was a disambiguation or failed, try technical specifics
  if (!result) {
    const technicalQueries = [`${word} (computing)`, `${word} (technology)`, `${word} (electronics)`];
    for (const techQuery of technicalQueries) {
      result = await attemptFetch(techQuery);
      if (result) break;
    }
  }

  return result;
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
