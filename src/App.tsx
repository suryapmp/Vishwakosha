import { useState, useEffect, ChangeEvent } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
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
  Camera,
  BrainCircuit,
  CheckCircle2,
  Copy,
  Languages,
  ArrowRight,
  X,
  Bell,
  Play,
  Pause,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Tesseract from 'tesseract.js';
import { fetchWikipediaSummary, fetchSuggestions, isKannada } from './lib/wikipedia';
import { searchOfflineDB, OFFLINE_DB } from './lib/offline-db';
import { DictionaryEntry } from './types';

const MAX_HISTORY = 50;
const APP_ICON = "https://cdn-icons-png.flaticon.com/512/3593/3593963.png";

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
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [showSafariGuide, setShowSafariGuide] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);

  // Word of the Day Logic
  useEffect(() => {
    const keys = Object.keys(OFFLINE_DB);
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % keys.length;
    const wordKey = keys[index];
    const offlineEntry = OFFLINE_DB[wordKey];
    setWordOfTheDay({ ...offlineEntry, timestamp: Date.now() });

    // Global Notification for WOTD
    const notifyWOTD = async () => {
      const isActuallyEnabled = localStorage.getItem('vishwakosha_notifications') === 'true';
      if (isActuallyEnabled && Notification.permission === 'granted') {
        const lastNotifiedDate = localStorage.getItem('vishwakosha_last_wotd_date');
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (lastNotifiedDate !== todayStr) {
          new Notification("VishwaKosha Word of the Day", {
            body: `Today's technical term is "${offlineEntry.word}". Tap to learn its Kannada meaning!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/3593/3593963.png'
          });
          localStorage.setItem('vishwakosha_last_wotd_date', todayStr);
        }
      }
    };
    notifyWOTD();
  }, []);

  // Sync Dark Mode to DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker Registered');
      if (r) {
        // Automatic update check
        setInterval(() => {
          r.update();
        }, 15 * 60 * 1000); // Check every 15 mins for student convenience
      }
    },
    onRegisterError(error) {
      console.log('Service Worker registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) console.log("New version detected");
    if (offlineReady) console.log("Cache updated");
  }, [needRefresh, offlineReady]);

  // Initialize from LocalStorage
  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsAppInstalled(true);
    }

    const savedFontSize = localStorage.getItem('vishwakosha_fontsize');
    const savedContrast = localStorage.getItem('vishwakosha_contrast');
    const savedSenior = localStorage.getItem('vishwakosha_seniormode');
    const savedNotes = localStorage.getItem('vishwakosha_notes');
    const savedSpeed = localStorage.getItem('vishwakosha_speechspeed');
    const savedNotifications = localStorage.getItem('vishwakosha_notifications');
    
    if (savedFontSize) setFontSize(parseFloat(savedFontSize));
    if (savedContrast === 'true') setHighContrast(true);
    if (savedSenior === 'true') setSeniorMode(true);
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSpeed) setSpeechSpeed(parseFloat(savedSpeed));
    if (savedNotifications === 'true') setNotificationsEnabled(true);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedHistory = localStorage.getItem('vishwakosha_history');
    const savedFavorites = localStorage.getItem('vishwakosha_favorites');
    const savedTheme = localStorage.getItem('vishwakosha_theme');

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTheme) {
      if (savedTheme === 'dark') setDarkMode(true);
    } else {
      // Default to system preference if no saved setting
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) setDarkMode(true);
    }

    // PWA Install Prompt Listener
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = sessionStorage.getItem('vishwakosha_install_dismissed');
      if (!isAppInstalled && !hasDismissed) {
        setShowInstallPopup(true);
      }
    };
    
    // Auto-show Safari guide for iOS users if not on standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isAppInstalled && !sessionStorage.getItem('vishwakosha_install_dismissed')) {
      setShowSafariGuide(true);
    }
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
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('vishwakosha_theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const saveNote = (word: string, note: string) => {
    const newNotes = { ...notes, [word.toLowerCase()]: note };
    setNotes(newNotes);
    localStorage.setItem('vishwakosha_notes', JSON.stringify(newNotes));
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('vishwakosha_notifications', 'true');
      new Notification("VishwaKosha", { body: "Notifications are already enabled! We'll keep you updated." });
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('vishwakosha_notifications', 'true');
        new Notification("VishwaKosha", { body: "Daily technical term alerts are now active!" });
      }
    }
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
    
    // STEP 1: Check Offline DB first
    const offlineMatch = searchOfflineDB(word);
    if (offlineMatch) {
      const newEntry: DictionaryEntry = { ...offlineMatch, timestamp: Date.now(), isOffline: true };
      setEntry(newEntry);
      
      const updatedHistory = [newEntry, ...history.filter(h => h.word.toLowerCase() !== word.toLowerCase())].slice(0, MAX_HISTORY);
      setHistory(updatedHistory);
      localStorage.setItem('vishwakosha_history', JSON.stringify(updatedHistory));
      
      if (handsFree) {
        const textToRead = newEntry.kannada?.extract || newEntry.english?.extract || "Found in offline dictionary.";
        speak(textToRead, isKannada(word) ? 'kn-IN' : 'en-US');
      }
      
      setLoading(false);
      return;
    }

    try {
      let enResult: any = null;
      let knResult: any = null;

      if (isKannada(word)) {
        // Reverse Lookup: Search in KN first, find EN link
        knResult = await fetchWikipediaSummary(word, 'kn');
        enResult = await fetchWikipediaSummary(word, 'en');
      } else {
        // Standard Lookup: Search in EN first, find/translate to KN
        enResult = await fetchWikipediaSummary(word, 'en');
        knResult = await fetchWikipediaSummary(word, 'kn', enResult?.extract);
      }

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

  const [detectedTerms, setDetectedTerms] = useState<string[]>([]);

  const handleOCR = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setDetectedTerms([]);
    
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      // Stopwords to filter out
      const stopwords = new Set(['the', 'and', 'for', 'that', 'with', 'this', 'from', 'your', 'have', 'been', 'which', 'their', 'when', 'what', 'some', 'than']);

      // Clean and find potential technical terms (words > 2 chars, letters only)
      const words = text
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/[^a-z]/g, "").trim())
        .filter(w => w.length > 2 && !stopwords.has(w));
      
      // Remove duplicates and common words
      const uniqueWords = Array.from(new Set(words)).slice(0, 15);
      
      if (uniqueWords.length > 0) {
        setDetectedTerms(uniqueWords);
      } else {
        setError("Could not identify any clear technical terms in this image.");
      }
    } catch (err) {
      setError("OCR Scan failed. Please try a clearer image.");
    } finally {
      setIsScanning(false);
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
      if (window.speechSynthesis.speaking && currentSpeakingText === text) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
          setIsSpeaking(true);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
          setIsSpeaking(true);
        }
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = speechSpeed;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setCurrentSpeakingText(text);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSpeakingText(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSpeakingText(null);
      };

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

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('vishwakosha_favorites');
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
                    {currentSpeakingText === entry.word && isSpeaking ? (isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />) : <Volume2 className="w-8 h-8" />}
                    {currentSpeakingText === entry.word && isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Pronounce'}
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
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setEntry(null);
              setQuery('');
              setSuggestions([]);
            }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm transition-all group-hover:scale-105 active:scale-95 overflow-hidden ${highContrast ? 'bg-yellow-400 text-black border-2 border-yellow-500' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
              <img src={APP_ICON} alt="Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tighter leading-none">
                VishwaKosha
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    Live
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase tracking-widest animate-pulse">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                     Offline
                  </div>
                )}
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest border-l border-slate-200 dark:border-slate-800 pl-1.5">EN-KN</span>
              </div>
            </div>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <label 
                className={`p-2 rounded-full cursor-pointer transition-colors ${highContrast ? 'text-yellow-400 border border-yellow-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                title="Scan textbook word"
              >
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleOCR} />
              </label>
             {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 p-2 px-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-all border border-blue-100 dark:border-blue-900/30 animate-pulse"
                  title="Install VishwaKosha"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Ready to Install</span>
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
            <label 
              className="mr-2 text-slate-400 hover:text-blue-500 cursor-pointer hidden md:block"
              title="Scan textbook image"
            >
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleOCR} />
            </label>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Auto-Read</span>
                      <button 
                        onClick={() => setHandsFree(!handsFree)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${handsFree ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${handsFree ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Speech Speed */}
                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2"><Volume2 className="w-4 h-4" /> Speech Speed</span>
                      <span className="text-xs font-bold text-blue-500">{speechSpeed}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1" 
                      value={speechSpeed} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSpeechSpeed(val);
                        localStorage.setItem('vishwakosha_speechspeed', val.toString());
                      }}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
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

                  {/* Quiz Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Daily Study Quiz</span>
                    <button 
                      onClick={() => setQuizMode(!quizMode)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${quizMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${quizMode ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2"><Bell className="w-4 h-4" /> Study Alerts</span>
                    <button 
                      onClick={requestNotificationPermission}
                      className={`w-10 h-5 rounded-full transition-colors relative ${notificationsEnabled || (typeof Notification !== 'undefined' && Notification.permission === 'granted') ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${notificationsEnabled || (typeof Notification !== 'undefined' && Notification.permission === 'granted') ? 'translate-x-5' : ''}`} />
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
          {!entry && !quizMode && (
            <div className={`w-full space-y-8 ${seniorMode ? 'text-center' : ''}`}>
              {wordOfTheDay && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden group cursor-pointer border border-white/10"
                  onClick={() => handleSearch(wordOfTheDay.word)}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <Star className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
                        <img src={APP_ICON} alt="Icon" className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Insight of the Day</span>
                        <span className="block text-xs font-black uppercase tracking-widest">Featured Technical Concept</span>
                      </div>
                    </div>
                    
                    <h2 className="text-6xl font-black mb-6 tracking-tighter">
                      {wordOfTheDay.word}
                    </h2>
                    
                    <div className="flex items-center gap-3 text-blue-100 font-bold mb-8">
                      <div className="px-3 py-1 bg-white/10 rounded-lg text-lg border border-white/10">
                        {wordOfTheDay.kannada?.title}
                      </div>
                    </div>
                    
                    <p className="text-blue-50/90 max-w-2xl text-xl leading-relaxed font-medium">
                      {wordOfTheDay.kannada?.extract}
                    </p>

                    <div className="mt-10 flex items-center gap-6">
                      <button 
                        className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all active:scale-95 uppercase tracking-widest"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearch(wordOfTheDay.word);
                        }}
                      >
                        Learn More
                      </button>
                      <button 
                        className="p-4 bg-blue-500/20 hover:bg-blue-500/40 rounded-2xl text-white backdrop-blur-md border border-white/20 transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          const textToRead = `${wordOfTheDay.word}. ${wordOfTheDay.kannada?.extract || ''}`;
                          speak(textToRead, 'en-US');
                        }}
                      >
                        {currentSpeakingText === (`${wordOfTheDay.word}. ${wordOfTheDay.kannada?.extract || ''}`) && isSpeaking ? (
                          isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Welcome Card */}
                 <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-4">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                      <Search className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-bold text-lg">Search for a term</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">VishwaKosha supports English & Kannada technical concepts. Instant reverse-lookup for technical translations.</p>
                    </div>
                 </div>

                 <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex flex-col justify-center space-y-4 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Languages className="w-20 h-20" />
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                      <Languages className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Quick Start</h3>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {['Algorithm', 'Processor', 'Encapsulation'].map(word => (
                          <button 
                            key={word}
                            onClick={() => handleSearch(word)}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors backdrop-blur-md"
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {quizMode && history.length > 0 && !entry && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-2xl w-full p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl text-center space-y-8"
             >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <BrainCircuit className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Daily Study Quiz</h2>
                  <p className="text-slate-500">Recall the term for this Kannada definition:</p>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl italic font-serif text-xl text-slate-700 dark:text-slate-300">
                    "{history[Math.min(2, history.length-1)].kannada?.extract.substring(0, 150)}..."
                  </div>
                </div>

                <div className="space-y-4">
                   <input 
                     type="text"
                     value={quizAnswer}
                     onChange={(e) => setQuizAnswer(e.target.value)}
                     placeholder="Enter the English term..."
                     className="w-full p-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-center text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                   />
                   <button 
                    onClick={() => {
                      const correct = quizAnswer.toLowerCase().trim() === history[Math.min(2, history.length-1)].word.toLowerCase();
                      setQuizCorrect(correct);
                      if(correct) setTimeout(() => { setQuizMode(false); setQuizCorrect(null); setQuizAnswer(''); }, 2000);
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                   >
                     CHECK ANSWER
                   </button>
                </div>

                {quizCorrect === true && <p className="text-emerald-600 font-bold flex items-center justify-center gap-2 animate-bounce"><CheckCircle2 className="w-5 h-5" /> Correct! Retaining knowledge...</p>}
                {quizCorrect === false && <p className="text-red-500 font-bold">Not quite. Try again or check history.</p>}
             </motion.div>
          )}

          {isScanning && (
            <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center">
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="mb-6"
               >
                 <BrainCircuit className="w-16 h-16 text-blue-400" />
               </motion.div>
               <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                 Digitizing Textbook...
               </h2>
               <p className="text-slate-400 mt-2 max-w-xs">Extracting technical terms using on-device neural networks.</p>
            </div>
          )}

          <AnimatePresence>
            {detectedTerms.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[310] flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
              >
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
                  <button 
                    onClick={() => setDetectedTerms([])}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">What term should we look up?</h3>
                    <p className="text-sm text-slate-500">We found these potential technical words in your scan.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {detectedTerms.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                          setDetectedTerms([]);
                        }}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-full text-sm font-medium transition-all active:scale-95 capitalize"
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Textbook Scan Complete</p>
                      <p className="text-xs text-slate-500 italic">Select a word to see its Kannada meaning.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {entry ? (
              <motion.div
                key={entry.word}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/20 dark:shadow-none shrink-0"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <button onClick={() => setEntry(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                          <ChevronLeft className="w-5 h-5" />
                       </button>
                       <h2 className="text-4xl font-black text-slate-900 dark:text-white capitalize leading-tight">
                         {entry.word}
                       </h2>
                    </div>
                    {entry.isOffline && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-bold uppercase tracking-wider mb-2">
                        Offline Data
                      </span>
                    )}
                    {(entry.english?.title.toLowerCase() !== entry.word.toLowerCase() || entry.kannada?.title !== entry.word) && (
                      <div className="flex items-center gap-2 mt-1">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                           {isKannada(entry.word) ? entry.english?.title : entry.kannada?.title}
                        </span>
                      </div>
                    )}
                    <p className="text-slate-500 italic text-sm mt-1">noun / technical term</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => speak(entry.word, 'en-US')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      {currentSpeakingText === entry.word && isSpeaking ? (isPaused ? <Play className="w-4.5 h-4.5" /> : <Pause className="w-4.5 h-4.5" />) : <Volume2 className="w-4.5 h-4.5" />}
                      {currentSpeakingText === entry.word && isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Speak'}
                    </button>
                    <button 
                      onClick={() => {
                        const text = `${entry.word}: ${entry.english?.extract || ''} | ${entry.kannada?.extract || ''}`;
                        navigator.clipboard.writeText(text);
                        alert("Definition copied for your assignment!");
                      }}
                      className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-100 transition-colors"
                    >
                      <Copy className="w-4.5 h-4.5" />
                      Copy
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
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        English Meaning
                      </span>
                      {entry.english && (
                        <button 
                          onClick={() => speak(entry.english?.extract || '', 'en-US')}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {currentSpeakingText === (entry.english?.extract || '') && isSpeaking ? (
                            isPaused ? <Play className="w-3.5 h-3.5 text-slate-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
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
                           {currentSpeakingText === (entry.kannada?.extract || '') && isSpeaking ? (
                              <button onClick={() => speak(entry.kannada?.extract || '', 'kn-IN')} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                {isPaused ? <Play className="w-3.5 h-3.5 text-blue-500" /> : <Pause className="w-3.5 h-3.5 text-blue-500" />}
                              </button>
                           ) : (
                             <Volume2 
                               className="w-3.5 h-3.5 text-blue-500 cursor-pointer hover:scale-110 transition-transform" 
                               onClick={() => speak(entry.kannada?.extract || '', 'kn-IN')} 
                             />
                           )}
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
            ) : null}
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
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Study Tip</h3>
            </div>
            {wordOfTheDay && (
              <div 
                onClick={() => handleSearch(wordOfTheDay.word)}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-900/30"
              >
                <div className="text-[10px] text-amber-600 font-bold uppercase mb-1">Concept to remember</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white capitalize">{wordOfTheDay.word}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic">{wordOfTheDay.kannada?.extract}</div>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
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
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorites</h3>
                {favorites.length > 0 && (
                  <button 
                    onClick={clearFavorites}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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

          <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-8 text-white shrink-0 relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 p-2">
                  <img src={APP_ICON} alt="App Icon" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">PWA System</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
                    <span className="text-[10px] text-slate-400 font-medium">Version: 2.1.0</span>
                  </div>
                </div>
              </div>
              {isAppInstalled && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/30">
                  Installed
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {isAppInstalled 
                ? "Offline support is active. Search results are automatically cached for your convenience." 
                : "Install VishwaKosha to your home screen for a seamless, lightning-fast app experience."}
            </p>

            {!isAppInstalled && (
              <button 
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className={`w-full py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${
                  deferredPrompt 
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95" 
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                {deferredPrompt ? "Install App Now" : "System Ready to Install"}
              </button>
            )}
            
            {isAppInstalled && (
              <div className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">App is Standalone</span>
              </div>
            )}
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

      {/* Install App Launch Popup */}
      <AnimatePresence>
        {showInstallPopup && !isAppInstalled && deferredPrompt && (
          <div 
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowInstallPopup(false);
              sessionStorage.setItem('vishwakosha_install_dismissed', 'true');
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-blue-100 dark:border-blue-800 p-4">
                <img src={APP_ICON} alt="VishwaKosha Icon" className="w-full h-full object-contain" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Install VishwaKosha</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Add to your home screen for instant offline access and a faster, native app experience.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    handleInstallClick();
                    setShowInstallPopup(false);
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  Download App Now
                </button>
                <button 
                  onClick={() => {
                    setShowInstallPopup(false);
                    sessionStorage.setItem('vishwakosha_install_dismissed', 'true');
                  }}
                  className="w-full py-4 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS Safari Install Guide */}
      <AnimatePresence>
        {showSafariGuide && (
          <div 
            className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowSafariGuide(false);
              sessionStorage.setItem('vishwakosha_install_dismissed', 'true');
            }}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setShowSafariGuide(false);
                  sessionStorage.setItem('vishwakosha_install_dismissed', 'true');
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                   <img src={APP_ICON} className="w-10 h-10" alt="Icon" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Add to Home Screen</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  For the best experience on Safari, tap the share icon below and select <strong>"Add to Home Screen"</strong>.
                </p>
                
                <div className="flex items-center gap-4 pt-4 text-blue-600">
                   <div className="flex flex-col items-center gap-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold">1. Tap Share</span>
                   </div>
                   <div className="h-px w-8 bg-slate-200"></div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Download className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold">2. Add to Home</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* PWA Update Notification Banner */}
      <AnimatePresence>
        {needRefresh && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md print:hidden">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-blue-400/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">New update available</span>
                  <span className="text-[10px] opacity-80">Click update for the latest version</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  updateServiceWorker(true);
                  window.location.reload();
                }}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors whitespace-nowrap shadow-lg active:scale-95"
              >
                UPDATE NOW
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
