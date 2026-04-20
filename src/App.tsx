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
  Mic,
  MicOff,
  Settings,
  Type,
  Eye,
  Wifi,
  WifiOff,
  Printer,
  Presentation,
  StickyNote,
  Maximize2,
  Minimize2,
  ChevronLeft,
  MonitorPlay,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchWikipediaSummary, fetchSuggestions } from './lib/wikipedia';
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
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fontSize, setFontSize] = useState(1); // 1 = 100%, 1.25 = 125%, etc.
  const [highContrast, setHighContrast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  const [lectureMode, setLectureMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem('vishwakosha_fontsize');
    const savedContrast = localStorage.getItem('vishwakosha_contrast');
    const savedSenior = localStorage.getItem('vishwakosha_seniormode');
    const savedNotes = localStorage.getItem('vishwakosha_notes');
    
    if (savedFontSize) setFontSize(parseFloat(savedFontSize));
    if (savedContrast === 'true') setHighContrast(true);
    if (savedSenior === 'true') setSeniorMode(true);
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

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

  const saveNote = (word: string, note: string) => {
    const newNotes = { ...notes, [word.toLowerCase()]: note };
    setNotes(newNotes);
    localStorage.setItem('vishwakosha_notes', JSON.stringify(newNotes));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearch = async (wordToSearch: string) => {
    if (!wordToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    const word = wordToSearch.trim();

    try {
      const [enResult, knResult] = await Promise.all([
        fetchWikipediaSummary(word, 'en'),
        fetchWikipediaSummary(word, 'kn'),
      ]);

      if (enResult || knResult) {
        const newEntry: DictionaryEntry = {
          word,
          english: enResult || undefined,
          kannada: knResult || undefined,
          timestamp: Date.now(),
        };
        setEntry(newEntry);

        if (handsFree) {
          const textToRead = knResult?.extract || enResult?.extract || "Definition not found.";
          const lang = knResult ? 'kn-IN' : 'en-US';
          speak(textToRead, lang);
        }
        
        const updatedHistory = [newEntry, ...history.filter(h => h.word.toLowerCase() !== word.toLowerCase())].slice(0, MAX_HISTORY);
        setHistory(updatedHistory);
        localStorage.setItem('vishwakosha_history', JSON.stringify(updatedHistory));
      } else {
        setError('Term definition not found.');
        setEntry(null);
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
    const shareText = `VishwaKosha Definition: ${e.word}\n\nEnglish: ${e.english?.extract || 'N/A'}\n\nKannada: ${e.kannada?.extract || 'N/A'}\n\nCheck it out here: ${window.location.href}`;
    
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
    <div 
      className={`flex flex-col min-h-screen font-sans transition-all duration-300
        ${highContrast ? 'bg-black text-yellow-400' : 'bg-[#f8fafc] text-[#1e293b] dark:bg-[#0f172a] dark:text-[#f1f5f9]'}`}
      style={{ fontSize: `${fontSize}rem` }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; font-size: 12pt; }
          .print-content { display: block !important; width: 100% !important; margin: 0 !important; padding: 20px !important; }
          .card { border: 1px solid #ccc !important; box-shadow: none !important; }
        }
      `}} />

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {lectureMode && entry && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col p-10 md:p-20 overflow-y-auto"
          >
            <button 
              onClick={() => setLectureMode(false)}
              className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all"
            >
              <Minimize2 className="w-8 h-8" />
            </button>

            <div className="max-w-4xl mx-auto w-full space-y-12">
              <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
                <h1 className="text-7xl font-bold text-slate-900 dark:text-white mb-4 capitalize">
                  {entry.word}
                </h1>
                <div className="flex gap-4">
                  <button onClick={() => speak(entry.word, 'en-US')} className="p-4 bg-blue-600 text-white rounded-2xl flex items-center gap-3 text-2xl font-bold">
                    <Volume2 className="w-8 h-8" /> Pronounce
                  </button>
                </div>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-blue-600 uppercase tracking-widest">English Definition</h2>
                  <p className="text-4xl leading-snug text-slate-700 dark:text-slate-300">
                    {entry.english?.extract}
                  </p>
                </div>
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-emerald-600 uppercase tracking-widest">ಕನ್ನಡ ಅರ್ಥ (Kannada)</h2>
                  <p className="text-4xl leading-snug text-slate-700 dark:text-slate-300">
                    {entry.kannada?.extract}
                  </p>
                </div>
              </section>

              {notes[entry.word.toLowerCase()] && (
                <section className="bg-amber-50 dark:bg-amber-900/10 p-10 rounded-3xl border border-amber-200 dark:border-amber-800/50">
                  <h2 className="text-2xl font-bold text-amber-600 mb-4 flex items-center gap-3">
                    <StickyNote className="w-6 h-6" /> Faculty Note
                  </h2>
                  <p className="text-3xl text-slate-700 dark:text-slate-300 italic">
                    {notes[entry.word.toLowerCase()]}
                  </p>
                </section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b backdrop-blur-sm shrink-0 gap-4 no-print
        ${highContrast ? 'bg-black border-yellow-400 border-2' : 'border-slate-200 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800'}`}>
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm ${highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              VishwaKosha <span className="text-slate-400 font-normal text-xs md:text-sm ml-1 select-none">EN-KN</span>
            </h1>
            <div className="ml-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                  <Wifi className="w-3 h-3" /> Online
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold uppercase animate-pulse">
                  <WifiOff className="w-3 h-3" /> Offline Ready
                </div>
              )}
            </div>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
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
          <div className={`flex flex-1 items-center rounded-full px-4 py-2 border transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500
            ${highContrast ? 'bg-black border-yellow-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Speak or search terms..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full md:w-64 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button 
              onClick={startVoiceSearch}
              className={`mr-2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-blue-500'}`}
              title="Voice Search"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="text-slate-500 hover:text-blue-500 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
              title="Accessibility Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
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

          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full right-0 mt-4 p-6 rounded-2xl shadow-2xl z-[100] w-72 border
                  ${highContrast ? 'bg-black border-yellow-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Student Support
                </h3>
                
                <div className="space-y-6">
                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2"><Type className="w-4 h-4" /> Font Size</span>
                      <span className="text-xs font-bold text-blue-500">{Math.round(fontSize * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.8" max="1.5" step="0.1" 
                      value={fontSize} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFontSize(val);
                        localStorage.setItem('vishwakosha_fontsize', val.toString());
                      }}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> High Contrast</span>
                    <button 
                      onClick={() => {
                        const val = !highContrast;
                        setHighContrast(val);
                        localStorage.setItem('vishwakosha_contrast', val.toString());
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${highContrast ? 'bg-yellow-400' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {/* Hands Free */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Auto-Read (Hands-Free)</span>
                    <button 
                      onClick={() => setHandsFree(!handsFree)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${handsFree ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${handsFree ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {/* Senior Mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><MonitorPlay className="w-4 h-4" /> Senior Faculty Mode</span>
                    <button 
                      onClick={() => {
                        const val = !seniorMode;
                        setSeniorMode(val);
                        localStorage.setItem('vishwakosha_seniormode', val.toString());
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${seniorMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${seniorMode ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <p className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 italic text-center">
                  Designed for inclusive technical education.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[60] overflow-hidden py-2 max-w-lg mx-auto md:max-w-none">
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 grid grid-cols-12 gap-6 p-4 md:p-8 overflow-y-auto ${lectureMode ? 'hidden' : ''}`}>
        {/* Left Column: Result & Extras */}
        <section className={`col-span-12 flex flex-col gap-6 ${seniorMode && !entry ? 'lg:col-span-12 items-center justify-center min-h-[60vh]' : 'lg:col-span-8'}`}>
          {!entry && (
            <div className={`max-w-2xl w-full space-y-8 ${seniorMode ? 'text-center' : ''}`}>
              <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-xl shadow-blue-500/10">
                <h2 className="text-3xl font-bold mb-4">Welcome to VishwaKosha</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Search for any technical term to see its meaning in English and Kannada. Everything is saved for offline use.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Algorithm', 'Encryption', 'Processor', 'Compiler'].map(word => (
                    <button 
                      key={word}
                      onClick={() => handleSearch(word)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors backdrop-blur-md"
                    >
                      Search "{word}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

                <div className="flex gap-4 mb-6 no-print">
                   <button 
                     onClick={() => setLectureMode(true)}
                     className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold hover:bg-indigo-100 transition-colors"
                   >
                     <Presentation className="w-4 h-4" /> LECTURE MODE
                   </button>
                   <button 
                     onClick={handlePrint}
                     className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                   >
                     <Printer className="w-4 h-4" /> PRINT DEFINITION
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print-content">
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
                      <p className="text-slate-400 text-sm italic">ಕನ್ನಡ ಅರ್ಥ ಲಭ್ಯವಿಲ್ಲ (Meaning not available).</p>
                    )}
                  </div>
                </div>

                {/* Personal Notes Section */}
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 no-print">
                   <div className="flex items-center gap-2 mb-4">
                      <StickyNote className="w-5 h-5 text-amber-500" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Personal Study Notes</h3>
                   </div>
                   <textarea 
                     value={notes[entry.word.toLowerCase()] || ''}
                     onChange={(e) => saveNote(entry.word, e.target.value)}
                     placeholder="Add your own notes or lecture reminders here..."
                     className="w-full h-32 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-amber-400/50"
                   />
                   <p className="text-[10px] text-amber-600/60 mt-2 italic px-2">Notes are saved locally on this device.</p>
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
        <aside className={`col-span-12 lg:col-span-4 flex flex-col gap-6 no-print ${seniorMode && !entry ? 'hidden' : ''}`}>
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
