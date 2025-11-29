import React, { useState, useEffect } from 'react';
import { NearbyPlace, SearchRecord } from '../types';
import { searchNearbyPlaces } from '../services/geminiService';
import { MapPin, Search, Navigation, Clock, Star, Utensils, Camera, ShoppingBag, Loader2, History, Trash2, ArrowRight, Ruler, LocateFixed } from 'lucide-react';

interface NearbySearchProps {
  onSearchComplete?: () => void;
}

const RADIUS_OPTIONS = [
  { label: '100m 散步', value: '100m' },
  { label: '300m 散步', value: '300m' },
  { label: '500m 散步', value: '500m' },
  { label: '1km 漫遊', value: '1km' },
  { label: '3km 騎車', value: '3km' },
  { label: '5km 開車', value: '5km' },
  { label: '10km 兜風', value: '10km' },
];

export const NearbySearch: React.FC<NearbySearchProps> = () => {
  const [locationInput, setLocationInput] = useState('');
  const [radius, setRadius] = useState('1km');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<NearbyPlace[] | null>(null);
  const [history, setHistory] = useState<SearchRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
        setLocationInput("我的目前位置"); 
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
    setRadius(record.radius || '1km'); 
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
        <h2 className="text-3xl font-black text-slate-800 mb-2">探索周邊精彩</h2>
        <p className="text-slate-500 font-medium">輸入地址或使用定位，立即發現附近的美食與景點。</p>
      </div>

      {/* Search Input Area */}
      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-sky-100 border-2 border-white mb-8 relative z-20">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Location Input */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-5 top-4 w-5 h-5 text-sky-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="輸入地址、地標或城市..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none transition-all font-bold text-slate-700 placeholder:font-normal"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(locationInput)}
            />
          </div>

          {/* Radius Selector */}
          <div className="relative md:w-48 shrink-0">
             <Ruler className="absolute left-5 top-4 w-5 h-5 text-pink-400 pointer-events-none" />
             <select
               value={radius}
               onChange={(e) => setRadius(e.target.value)}
               className="w-full pl-12 pr-8 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none appearance-none cursor-pointer font-bold text-slate-700"
             >
               {RADIUS_OPTIONS.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
               <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
          
          <button
            onClick={handleGeolocation}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-100 text-pink-500 font-bold rounded-2xl hover:bg-pink-200 transition-colors disabled:opacity-50 min-w-[60px]"
            title="使用目前位置"
          >
            <LocateFixed className="w-6 h-6" />
            <span className="md:hidden">定位</span>
          </button>

          <button
            onClick={() => handleSearch(locationInput)}
            disabled={isLoading || !locationInput}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-sky-400 text-white font-black rounded-2xl hover:bg-sky-500 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            搜尋
          </button>
        </div>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1"><History className="w-3 h-3" /> 歷史搜尋</span>
              <button onClick={clearHistory} className="text-red-400 hover:text-red-600">清除</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.map((record) => (
                <div 
                  key={record.id}
                  onClick={() => loadHistoryItem(record)}
                  className="p-4 hover:bg-sky-50 cursor-pointer flex justify-between items-center group transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-sky-200 group-hover:text-sky-600 transition-colors">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-slate-700 truncate">{record.locationName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                        {record.radius && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                            {record.radius}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => deleteHistoryItem(e, record.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-10" onClick={() => setShowHistory(false)}></div>
      )}

      {/* Results Grid */}
      {currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 px-2">
            <Search className="w-4 h-4" />
            <span>搜尋結果：{locationInput} (範圍 {radius})</span>
          </div>
          {currentResult.map((place, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] shadow-sm border-2 border-white overflow-hidden hover:shadow-lg hover:border-sky-100 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl shadow-inner ${
                      place.type === 'restaurant' ? 'bg-orange-100 text-orange-500' : 'bg-sky-100 text-sky-500'
                    }`}>
                      {getIcon(place.type)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800 leading-tight group-hover:text-sky-500 transition-colors">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-current" /> {place.rating}
                        </span>
                        <span className="text-slate-400">{place.priceLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed font-medium">
                  {place.description}
                </p>

                <div className="space-y-3">
                   <div className="flex items-start gap-2 text-xs text-slate-400 font-bold bg-slate-50 p-2 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="break-words">{place.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(place.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white border border-slate-100 text-slate-500 text-xs font-bold rounded-full">
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
         <div className="mt-12 text-center text-slate-400 font-medium">
            <p>查看上方的歷史紀錄，或輸入新地點開始探索。</p>
         </div>
      )}
    </div>
  );
};