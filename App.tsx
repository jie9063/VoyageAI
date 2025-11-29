
import React, { useState, useEffect } from 'react';
import { TripInput } from './components/TripInput';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { NearbySearch } from './components/NearbySearch';
import { generateItinerary } from './services/geminiService';
import { UserPreferences, Itinerary } from './types';
import { Plane, Map, Compass, History as HistoryIcon, Trash2, ArrowRight, Calendar } from 'lucide-react';

type Tab = 'planner' | 'nearby' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  
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
    // We try to reconstruct prefs roughly for the display, though some inputs might be lost
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
        // Also update local storage immediately to handle empty case
        if (newTrips.length === 0) localStorage.removeItem('voyage_trips');
        return newTrips;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { handleReset(); setActiveTab('planner'); }}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              VoyageAI
            </span>
          </div>
          
          {/* Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'planner' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">規劃</span>
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'nearby' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">周邊</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">紀錄</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow w-full">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 no-print">
            {error}
          </div>
        )}

        {activeTab === 'planner' && (
          <>
            {!itinerary ? (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-8">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    規劃您的<span className="text-blue-600">精算旅程</span>
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    AI 自動估算預算、交通與食宿，打造專屬您的完美行程。
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
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-emerald-600" />
              我的行程紀錄
            </h2>
            
            {savedTrips.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Map className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">尚未有行程紀錄</h3>
                <p className="text-slate-500 mb-6">您規劃過的行程會自動儲存在這裡。</p>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  去規劃行程
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id || Math.random().toString()} 
                    onClick={() => loadTripFromHistory(trip)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative"
                  >
                    <div className="absolute top-4 right-4">
                       <button 
                         onClick={(e) => deleteTrip(e, trip.id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                        {trip.days.length}
                        <span className="text-xs font-normal ml-0.5 mt-1">天</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {trip.tripName}
                        </h3>
                        <p className="text-sm text-slate-500">{trip.destination}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-500">總預算</span>
                         <span className="font-medium text-emerald-600">{trip.totalEstimatedCost}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-500">建立日期</span>
                         <span className="text-slate-700">
                           {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : '未知'}
                         </span>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                      查看完整行程 <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} VoyageAI. All rights reserved.</p>
          <p className="mt-2">AI 生成價格僅供參考，實際費用請以當下訂購為準。</p>
        </div>
      </footer>

      <ChatAssistant itinerary={itinerary} />
    </div>
  );
}
