
import React, { useState } from 'react';
import { TripInput } from './components/TripInput';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { NearbySearch } from './components/NearbySearch';
import { generateItinerary } from './services/geminiService';
import { UserPreferences, Itinerary } from './types';
import { Plane, Map, Compass } from 'lucide-react';

type Tab = 'planner' | 'nearby';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTripSubmit = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateItinerary(prefs);
      setItinerary(result);
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 flex flex-col">
      {/* Header / Navbar */}
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
          
          {/* Mobile/Desktop Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'planner' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Map className="w-4 h-4" />
              行程規劃
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'nearby' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4" />
              周邊探索
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-grow w-full">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 no-print">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {activeTab === 'planner' ? (
          <>
            {!itinerary ? (
              <div className="animate-in fade-in duration-500 slide-in-from-bottom-8">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    規劃您的<span className="text-blue-600">完美旅程</span>
                  </h1>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    輸入您的目的地與喜好，讓 AI 在幾秒鐘內為您打造專屬的深度旅遊計畫。
                  </p>
                </div>
                <TripInput onSubmit={handleTripSubmit} isLoading={isLoading} />
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20 text-center">
                  {[
                    { title: '智能生成', desc: '根據您的風格與預算，自動匹配最合適的景點與餐廳。', icon: '✨' },
                    { title: '詳細規劃', desc: '包含交通時間、活動建議與費用預估的完整時間軸。', icon: '📅' },
                    { title: '即時諮詢', desc: '內建 AI 助手，隨時回答您關於行程的所有疑問。', icon: '💬' }
                  ].map((feature, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <ItineraryDisplay itinerary={itinerary} onReset={handleReset} />
              </div>
            )}
          </>
        ) : (
          <NearbySearch />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} VoyageAI. All rights reserved.</p>
          <p className="mt-2">AI 生成內容僅供參考，實際行程請依當地狀況為準。</p>
        </div>
      </footer>

      {/* Chat Assistant Overlay - Only show in planner mode when itinerary exists, or generally available? Let's keep it available but contextual */}
      <ChatAssistant itinerary={itinerary} />
    </div>
  );
}
