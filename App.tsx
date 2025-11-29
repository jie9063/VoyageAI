import React, { useState, useEffect } from 'react';
import { TripInput } from './components/TripInput';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { NearbySearch } from './components/NearbySearch';
import { generateItinerary } from './services/geminiService';
import { UserPreferences, Itinerary } from './types';
import { Map, Compass, History as HistoryIcon, Trash2, ArrowRight } from 'lucide-react';

type Tab = 'planner' | 'nearby' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [logoError, setLogoError] = useState(false);
  
  // Track preferences
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences | null>(null);
  const [initialPrefs, setInitialPrefs] = useState<UserPreferences | undefined>(undefined);

  // Load saved trips from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voyage_trips');
      if (saved) {
        setSavedTrips(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load trips history", e);
    }
  }, []);

  // Save trips to LocalStorage whenever they change
  useEffect(() => {
    if (savedTrips.length > 0) {
      localStorage.setItem('voyage_trips', JSON.stringify(savedTrips));
    }
  }, [savedTrips]);

  // Check URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('dest')) {
      const sharedPrefs: UserPreferences = {
        origin: params.get('origin') || '台北',
        destination: params.get('dest') || '',
        duration: parseInt(params.get('days') || '3'),
        budgetAmount: parseInt(params.get('budget') || '20000'),
        travelStyle: params.get('style') || '休閒放鬆',
        companions: params.get('who') || '情侶/夫妻',
        interests: params.get('tags') ? params.get('tags')!.split(',') : [],
        transportPreference: params.get('trans') || '大眾運輸',
        dietaryRestrictions: params.get('diet') || '無',
        specialRequests: params.get('req') || ''
      };
      setInitialPrefs(sharedPrefs);
    }
  }, []);

  const handleTripSubmit = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setCurrentPrefs(prefs);
    try {
      const result = await generateItinerary(prefs);
      setItinerary(result);
      // Automatically save to history
      setSavedTrips(prev => [result, ...prev]);
    } catch (err) {
      console.error(err);
      setError("生成行程時發生錯誤，請檢查您的網路或 API Key 設定。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const loadTripFromHistory = (trip: Itinerary) => {
    setItinerary(trip);
    setActiveTab('planner');
    setCurrentPrefs({
      origin: '未知',
      destination: trip.destination,
      duration: trip.days.length,
      budgetAmount: 0,
      travelStyle: '已儲存行程',
      companions: '未知',
      interests: []
    });
  };

  const deleteTrip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("確定要刪除這個行程紀錄嗎？")) {
      setSavedTrips(prev => {
        const newTrips = prev.filter(t => t.id !== id);
        if (newTrips.length === 0) localStorage.removeItem('voyage_trips');
        return newTrips;
      });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-700 font-sans selection:bg-sky-200 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-4 z-30 mx-4 mt-4 rounded-full shadow-lg shadow-amber-100/50 border border-white no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { handleReset(); setActiveTab('planner'); }}>
            {logoError ? (
               <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">🐱</div>
            ) : (
               <img 
                 src="/master.png" 
                 alt="Logo" 
                 className="w-10 h-10 object-contain drop-shadow-sm" 
                 onError={() => setLogoError(true)}
               />
            )}
            <span className="text-xl font-black text-sky-500 tracking-tight">
              Voyage<span className="text-pink-400">AI</span>
            </span>
          </div>
          
          {/* Navigation - Pill shaped */}
          <div className="flex bg-amber-50 p-1.5 rounded-full border border-amber-100">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'planner' 
                  ? 'bg-sky-400 text-white shadow-md shadow-sky-200' 
                  : 'text-slate-500 hover:text-sky-400'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">規劃</span>
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'nearby' 
                  ? 'bg-pink-400 text-white shadow-md shadow-pink-200' 
                  : 'text-slate-500 hover:text-pink-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">周邊</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'history' 
                  ? 'bg-emerald-400 text-white shadow-md shadow-emerald-200' 
                  : 'text-slate-500 hover:text-emerald-400'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">紀錄</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 no-print shadow-sm">
            <div className="bg-red-200 p-1 rounded-full"><Trash2 className="w-4 h-4" /></div>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {activeTab === 'planner' && (
          <>
            {!itinerary ? (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-8">
                <div className="text-center mb-10">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                    規劃您的<span className="text-sky-500 underline decoration-wavy decoration-pink-300 underline-offset-4">快樂旅程</span>
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                    讓 AI 幫您精打細算，開著小車車去旅行吧！
                  </p>
                </div>
                <TripInput onSubmit={handleTripSubmit} isLoading={isLoading} initialValues={initialPrefs} />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <ItineraryDisplay itinerary={itinerary} preferences={currentPrefs!} onReset={handleReset} />
              </div>
            )}
          </>
        )}

        {activeTab === 'nearby' && <NearbySearch />}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-500"><HistoryIcon className="w-6 h-6" /></div>
              我的足跡
            </h2>
            
            {savedTrips.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-amber-200 shadow-sm">
                <div className="w-20 h-20 bg-amber-50 text-amber-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Map className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">還沒有任何紀錄喔</h3>
                <p className="text-slate-400 mb-8 font-medium">快去規劃您的第一個旅程吧！</p>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className="px-8 py-3 bg-sky-400 text-white rounded-full font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-1"
                >
                  開始出發
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id || Math.random().toString()} 
                    onClick={() => loadTripFromHistory(trip)}
                    className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-white hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100 transition-all cursor-pointer group relative"
                  >
                    <div className="absolute top-4 right-4">
                       <button 
                         onClick={(e) => deleteTrip(e, trip.id)}
                         className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-500 flex flex-col items-center justify-center shrink-0 border-2 border-sky-50">
                        <span className="text-xl font-black leading-none">{trip.days.length}</span>
                        <span className="text-xs font-bold mt-1">天</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-sky-500 transition-colors">
                          {trip.tripName}
                        </h3>
                        <p className="text-sm font-medium text-slate-400 flex items-center gap-1">
                          <Map className="w-3 h-3" /> {trip.destination}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4 bg-slate-50 p-4 rounded-xl">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-500 font-medium">總預算</span>
                         <span className="font-bold text-emerald-500 bg-white px-2 py-0.5 rounded-md shadow-sm">{trip.totalEstimatedCost}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-500 font-medium">建立日期</span>
                         <span className="text-slate-600 font-medium">
                           {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : '未知'}
                         </span>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sky-500 text-sm font-bold bg-sky-50 py-3 rounded-xl group-hover:bg-sky-400 group-hover:text-white transition-colors">
                      查看行程 <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-8 mt-4 no-print text-center">
        <div className="inline-block bg-white/50 backdrop-blur px-6 py-3 rounded-full border border-white/50">
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} VoyageAI • 帶著好心情出發</p>
        </div>
      </footer>

      <ChatAssistant itinerary={itinerary} />
    </div>
  );
}