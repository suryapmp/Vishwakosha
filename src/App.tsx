import { useState, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  History, 
  Star, 
  Moon, 
  Sun, 
  Trash2, 
  Loader2, 
  Download,
  BookOpen,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWikipediaSummary, fetchSuggestions } from './lib/wikipedia';
import { translateTechnicalTerm } from './services/aiService';
import { DictionaryEntry } from './types';

const MAX_HISTORY = 10;

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [history, setHistory] = useState<DictionaryEntry[]>([]);
  const [favorites, setFavorites] = useState<DictionaryEntry[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vishwakosha_history');
    const savedFavorites = localStorage.getItem('vishwakosha_favorites');
    const savedTheme = localStorage.getItem('vishwakosha_theme');

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // PWA Install Prompt Listener
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('vishwakosha_theme', newMode ? 'dark' : 'light');
  };

  const handleSearch = async (wordToSearch: string) => {
    if (!wordToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    const word = wordToSearch.trim();

    try {
      const [enResult, knResult, aiResult] = await Promise.all([
        fetchWikipediaSummary(word, 'en'),
        fetchWikipediaSummary(word, 'kn'),
        translateTechnicalTerm(word),
      ]);

      if (!enResult && !knResult && !aiResult) {
        setError('Term definition not found.');
        setEntry(null);
      } else {
        const newEntry: DictionaryEntry = {
          word,
          english: enResult || undefined,
          kannada: knResult || undefined,
          aiTranslation: aiResult || undefined,
          timestamp: Date.now(),
        };
        setEntry(newEntry);
        
        const updatedHistory = [newEntry, ...history.filter(h => h.word.toLowerCase() !== word.toLowerCase())].slice(0, MAX_HISTORY);
        setHistory(updatedHistory);
        localStorage.setItem('vishwakosha_history', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const speak = (text: string, lang: 'en-US' | 'kn-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = speechSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleFavorite = (eToToggle: DictionaryEntry) => {
    const isFav = favorites.some(f => f.word.toLowerCase() === eToToggle.word.toLowerCase());
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(f => f.word.toLowerCase() !== eToToggle.word.toLowerCase());
    } else {
      newFavs = [eToToggle, ...favorites];
    }
    setFavorites(newFavs);
    localStorage.setItem('vishwakosha_favorites', JSON.stringify(newFavs));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('vishwakosha_history');
  };

  const handleShare = async (e: DictionaryEntry) => {
    const shareText = `VishwaKosha Definition: ${e.word}\n\nEnglish: ${e.english?.extract || 'N/A'}\n\nKannada: ${e.aiTranslation?.translation || e.kannada?.extract || 'N/A'}\n\nCheck it out here: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VishwaKosha: ${e.word}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          alert('Could not share. Copied to clipboard instead.');
          navigator.clipboard.writeText(shareText);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Content copied to clipboard! (Share API not supported in this browser)');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-[#1e293b] dark:bg-[#0f172a] dark:text-[#f1f5f9] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-slate-200 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-sm shrink-0 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              VishwaKosha <span className="text-slate-400 font-normal text-xs md:text-sm ml-1 select-none">EN-KN</span>
            </h1>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
             {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-full transition-colors"
                  title="Install App"
                >
                  <Download className="w-5 h-5" />
                </button>
             )}
             <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto relative">
          <div className="flex flex-1 items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search terms..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full md:w-64 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button 
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="ml-2 text-slate-500 hover:text-blue-500 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    handleSearch(s);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          
          <div className="hidden md:flex items-center gap-2">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all border border-blue-500 active:scale-95 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>INSTALL APP</span>
              </button>
            )}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-4 md:p-8 overflow-y-auto">
        {/* Left Column: Result & Extras */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Hero Result Card */}
          <AnimatePresence mode="wait">
            {entry ? (
              <motion.div
                key={entry.word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm shrink-0"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 capitalize leading-tight">
                      {entry.word}
                    </h2>
                    <p className="text-slate-500 italic text-sm">noun / technical term</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => speak(entry.word, 'en-US')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Volume2 className="w-4.5 h-4.5" />
                      Speak
                    </button>
                    <button 
                      onClick={() => toggleFavorite(entry)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        favorites.some(f => f.word.toLowerCase() === entry.word.toLowerCase())
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${favorites.some(f => f.word.toLowerCase() === entry.word.toLowerCase()) ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleShare(entry)}
                      className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-blue-500 transition-all active:scale-95"
                      title="Share Entry"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* English Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        English Meaning
                      </span>
                    </div>
                    {entry.english ? (
                      <div className="space-y-4">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {entry.english.extract}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm italic">Definition not available.</p>
                    )}
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                        ಕನ್ನಡ ಅರ್ಥ (Kannada)
                      </span>
                    </div>
                    
                    {entry.aiTranslation && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-bold uppercase text-slate-400">Technical Translation</span>
                           <Volume2 
                             className="w-3.5 h-3.5 text-blue-500 cursor-pointer hover:scale-110 transition-transform" 
                             onClick={() => speak(entry.aiTranslation?.translation || '', 'kn-IN')} 
                           />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {entry.aiTranslation.translation}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                          {entry.aiTranslation.explanation}
                        </p>
                      </div>
                    )}

                    {entry.kannada ? (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold uppercase text-slate-400">Encyclopedia Insight</span>
                           <Volume2 
                             className="w-3.5 h-3.5 text-blue-500 cursor-pointer hover:scale-110 transition-transform" 
                             onClick={() => speak(entry.kannada?.extract || '', 'kn-IN')} 
                           />
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {entry.kannada.extract}
                        </p>
                      </div>
                    ) : (
                      !entry.aiTranslation && <p className="text-slate-400 text-sm italic">ಕನ್ನಡ ಅರ್ಥ ಲಭ್ಯವಿಲ್ಲ (Meaning not available).</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-900 dark:text-slate-200 font-medium">Search for a term</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">Look up technical definitions and translations across English and Kannada.</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Secondary Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex gap-4 transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                {entry?.english?.thumbnail ? (
                  <img 
                    src={entry.english.thumbnail.source} 
                    className="w-full h-full object-cover" 
                    alt="Visualization"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[10px] uppercase font-bold text-center p-2 leading-tight">
                    Visual Context
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Visual Guide</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {entry?.english?.thumbnail 
                    ? "Rich visual representation provided for better understanding of this complex technical term."
                    : "Visual reference for this specific terminology is currently in development."}
                </p>
              </div>
            </div>

            <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-500/10">
              <p className="text-sm opacity-90 leading-relaxed line-clamp-3">
                {entry?.english?.extract 
                  ? `"${entry.english.extract.split('.')[0]}. Translation helps clarify the fundamental concepts across languages."`
                  : '"Translating technical terminology ensures concepts are accessible to learners in their native language."'}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Learning Insight</span>
                <Volume2 className="w-4 h-4 opacity-80" />
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sidebar */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent History</h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="space-y-1 select-none">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 italic text-center">No recent activity.</p>
              ) : (
                history.map((h) => (
                  <div 
                    key={h.timestamp}
                    onClick={() => handleSearch(h.word)}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">{h.word}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Favorites</h3>
              <div className="flex flex-wrap gap-2">
                {favorites.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No favorites yet.</p>
                ) : (
                  favorites.map((fav) => (
                    <button 
                      key={fav.word}
                      onClick={() => handleSearch(fav.word)}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-100 dark:border-amber-900/30 hover:shadow-sm hover:translate-y-[-1px] transition-all"
                    >
                      {fav.word}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-black rounded-2xl p-6 text-white shrink-0 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PWA Status</h4>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Offline support is active. Search results are cached. Install to home screen for an app-like experience.
            </p>
            <button 
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all ${
                deferredPrompt 
                ? "bg-white hover:bg-slate-50 text-slate-900 shadow-lg shadow-white/5" 
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {deferredPrompt ? "INSTALL APP NOW" : "APP READY FOR OFFLINE"}
            </button>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center md:text-left">
          <span>Multilingual Technical Dictionary</span>
          <span className="opacity-30">•</span>
          <span>Offline Ready</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Voice Speed</span>
            <input 
              type="range" 
              min="0.5" max="2" step="0.1"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
              className="w-24 md:w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-500 font-mono w-4">{speechSpeed}x</span>
          </div>
        </div>
      </footer>

      {/* Mobile Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 z-[100]">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between"
          >
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="text-xs opacity-60 uppercase font-bold">Dismiss</button>
          </motion.div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
        @media (max-width: 1024px) {
          .custom-scrollbar {
            overflow-y: visible;
          }
        }
      `}</style>
    </div>
  );
}
