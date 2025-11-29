
import React, { useState, useEffect } from 'react';
import { NearbyPlace, SearchRecord } from '../types';
import { searchNearbyPlaces } from '../services/geminiService';
import { MapPin, Search, Navigation, Clock, Star, Utensils, Camera, ShoppingBag, Loader2, History, Trash2, ArrowRight, Ruler, LocateFixed } from 'lucide-react';

interface NearbySearchProps {
  onSearchComplete?: () => void;
}

const RADIUS_OPTIONS = [
  { label: '100公尺 (步行)', value: '100m' },
  { label: '300公尺 (步行)', value: '300m' },
  { label: '500公尺 (步行)', value: '500m' },
  { label: '1公里', value: '1km' },
  { label: '3公里', value: '3km' },
  { label: '5公里', value: '5km' },
  { label: '10公里 (開車)', value: '10km' },
];

export const NearbySearch: React.FC<NearbySearchProps> = () => {
  const [locationInput, setLocationInput] = useState('');
  const [radius, setRadius] = useState('1km');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<NearbyPlace[] | null>(null);
  const [history, setHistory] = useState<SearchRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('voyage_nearby_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('voyage_nearby_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (loc: string) => {
    if (!loc.trim()) return;
    
    setIsLoading(true);
    setCurrentResult(null);
    setShowHistory(false);
    
    try {
      const places = await searchNearbyPlaces(loc, radius);
      setCurrentResult(places);
      
      // Add to history
      const newRecord: SearchRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        locationName: loc,
        radius: radius,
        results: places
      };
      
      setHistory(prev => [newRecord, ...prev]);
    } catch (error) {
      console.error(error);
      alert("搜尋失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("您的瀏覽器不支援地理定位功能。");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordsString = `緯度 ${latitude}, 經度 ${longitude}`;
        setLocationInput("我的目前位置"); // Visual feedback
        handleSearch(coordsString);
      },
      (error) => {
        setIsLoading(false);
        console.error(error);
        alert("無法取得您的位置，請確認是否已授權定位功能。");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const loadHistoryItem = (record: SearchRecord) => {
    setLocationInput(record.locationName);
    setRadius(record.radius || '1km'); // Default to 1km if old record has no radius
    setCurrentResult(record.results);
    setShowHistory(false);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("確定要清除所有搜尋紀錄嗎？")) {
      setHistory([]);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'attraction': return <Camera className="w-5 h-5 text-blue-500" />;
      case 'shop': return <ShoppingBag className="w-5 h-5 text-pink-500" />;
      default: return <MapPin className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">探索周邊精彩</h2>
        <p className="text-slate-600">輸入地址或使用定位，立即發現附近的美食與景點。</p>
      </div>

      {/* Search Input Area */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 relative z-20">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Location Input */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="輸入地址、地標或城市..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(locationInput)}
            />
          </div>

          {/* Radius Selector */}
          <div className="relative md:w-48 shrink-0">
             <Ruler className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
             <select
               value={radius}
               onChange={(e) => setRadius(e.target.value)}
               className="w-full pl-12 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
             >
               {RADIUS_OPTIONS.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
               <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
          
          <button
            onClick={handleGeolocation}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 min-w-[60px]"
            title="使用目前位置"
          >
            <LocateFixed className="w-5 h-5" />
            <span className="md:hidden">定位</span>
          </button>

          <button
            onClick={() => handleSearch(locationInput)}
            disabled={isLoading || !locationInput}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            搜尋
          </button>
        </div>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1"><History className="w-3 h-3" /> 歷史搜尋紀錄</span>
              <button onClick={clearHistory} className="text-red-500 hover:text-red-700">清除全部</button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {history.map((record) => (
                <div 
                  key={record.id}
                  onClick={() => loadHistoryItem(record)}
                  className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center group transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-800 truncate">{record.locationName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                        {record.radius && (
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                            範圍: {record.radius}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => deleteHistoryItem(e, record.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for clicking outside history to close it */}
      {showHistory && (
        <div className="fixed inset-0 z-10" onClick={() => setShowHistory(false)}></div>
      )}

      {/* Results Grid */}
      {currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Search className="w-4 h-4" />
            <span>搜尋結果：{locationInput} (範圍 {radius})</span>
          </div>
          {currentResult.map((place, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      place.type === 'restaurant' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {getIcon(place.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                          <Star className="w-3 h-3 fill-current" /> {place.rating}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{place.priceLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {place.description}
                </p>

                <div className="space-y-2">
                   <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="break-words">{place.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                    {place.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!currentResult && !isLoading && history.length > 0 && (
         <div className="mt-12 text-center text-slate-400">
            <p>查看上方的歷史紀錄，或輸入新地點開始探索。</p>
         </div>
      )}
    </div>
  );
};
