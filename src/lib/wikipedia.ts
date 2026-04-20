import { WikipediaSummary } from '../types';

/**
 * Robust multi-source system to fetch Kannada meaning
 */
export async function getKannadaMeaning(word: string): Promise<WikipediaSummary | null> {
  const wordLower = word.toLowerCase();
  let kannadaTitle: string | null = null;
  let wiktionaryData: any = null;
  let translatedWord: string | null = null;

  // STEP 2: Try Kannada Wikipedia using Language Links
  try {
    // We first get the canonical English title to avoid redirect issues
    const enSumRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
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
        console.log("Kannada Wikipedia Title:", kannadaTitle);

        const knSumRes = await fetch(`https://kn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(kannadaTitle)}`);
        if (knSumRes.ok) {
          const knData = await knSumRes.json();
          if (knData.extract) return knData;
        }
      }
    }
  } catch (e) {
    console.error("Wikipedia Fallback Error:", e);
  }

  // STEP 3: Wiktionary Kannada Meaning
  try {
    const wiktUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(wordLower)}`;
    const wiktRes = await fetch(wiktUrl);
    if (wiktRes.ok) {
      wiktionaryData = await wiktRes.json();
      console.log("Wiktionary Result:", wiktionaryData);
      
      // Look for Kannada translations in the response
      // Wiktionary API structure is often complex, we try to find symbols or translated text
      const knMeaning = wiktionaryData?.kn?.[0]?.definitions?.[0]?.definition || null;
      if (knMeaning) {
        return {
          title: word,
          extract: knMeaning,
        };
      }
    }
  } catch (e) {
    console.error("Wiktionary Fallback Error:", e);
  }

  // STEP 4: Google Translate Fallback
  try {
    const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(word)}`;
    const transRes = await fetch(transUrl);
    if (transRes.ok) {
      const transData = await transRes.json();
      translatedWord = transData[0][0][0];
      console.log("Translate Result:", translatedWord);
      
      if (translatedWord) {
        return {
          title: word,
          extract: translatedWord,
        };
      }
    }
  } catch (e) {
    console.error("Google Translate Fallback Error:", e);
  }

  // STEP 6: Final Fallback
  return null;
}

export async function fetchWikipediaSummary(word: string, lang: 'en' | 'kn'): Promise<WikipediaSummary | null> {
  if (lang === 'kn') {
    return getKannadaMeaning(word);
  }
  
  try {
    const response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
    if (!response.ok) return null;
    const data: WikipediaSummary = await response.json();
    
    // Fallback thumbnail if missing - generates a unique, stable academic-style image
    if (!data.thumbnail) {
      data.thumbnail = {
        source: `https://picsum.photos/seed/${encodeURIComponent(word)}/400/300?grayscale&blur=2`,
        width: 400,
        height: 300
      };
    }
    
    return data;
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
