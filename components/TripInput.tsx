import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { MapPin, Calendar, Users, Wallet, Heart, Sparkles, Loader2, PlaneTakeoff, Car, Utensils, Flag } from 'lucide-react';

interface TripInputProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
  initialValues?: UserPreferences;
}

const INTERESTS_OPTIONS = ["美食探索", "歷史文化", "自然風景", "購物血拼", "放鬆療癒", "冒險運動", "親子同樂", "攝影打卡"];

export const TripInput: React.FC<TripInputProps> = ({ onSubmit, isLoading, initialValues }) => {
  const [origin, setOrigin] = useState('台北');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budgetAmount, setBudgetAmount] = useState(20000); 
  const [travelStyle, setTravelStyle] = useState('休閒放鬆');
  const [companions, setCompanions] = useState('情侶/夫妻');
  const [interests, setInterests] = useState<string[]>([]);
  
  const [transportPreference, setTransportPreference] = useState('大眾運輸');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('無');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (initialValues) {
      setOrigin(initialValues.origin || '台北');
      setDestination(initialValues.destination);
      setDuration(initialValues.duration);
      setBudgetAmount(initialValues.budgetAmount || 20000);
      setTravelStyle(initialValues.travelStyle);
      setCompanions(initialValues.companions);
      setInterests(initialValues.interests);
      setTransportPreference(initialValues.transportPreference || '大眾運輸');
      setDietaryRestrictions(initialValues.dietaryRestrictions || '無');
      setSpecialRequests(initialValues.specialRequests || '');
    }
  }, [initialValues]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !origin.trim()) return;
    
    onSubmit({
      origin,
      destination,
      duration,
      budgetAmount,
      travelStyle,
      companions,
      interests,
      transportPreference,
      dietaryRestrictions,
      specialRequests
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-sky-100 border-4 border-white overflow-hidden relative">
      {/* Decorative "Ears" or top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-sky-400 rounded-b-full opacity-20"></div>

      <div className="bg-sky-400 p-10 text-white text-center rounded-t-[2rem] relative overflow-hidden">
        {/* Cute clouds pattern */}
        <div className="absolute top-2 left-4 w-12 h-12 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-[-10px] right-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        
        <h2 className="text-3xl font-black mb-3 flex items-center justify-center gap-3 relative z-10">
          <Sparkles className="w-7 h-7 text-yellow-300 fill-current animate-pulse" />
          開啟旅程
        </h2>
        <p className="text-sky-100 font-medium relative z-10 text-lg">
          告訴我你想去哪裡，我來幫你開車！
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
              <PlaneTakeoff className="w-5 h-5 text-sky-400" /> 出發地
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="例如：台北"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all outline-none font-bold text-slate-700 placeholder:font-normal"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
              <MapPin className="w-5 h-5 text-pink-400" /> 目的地
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例如：日本京都"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all outline-none font-bold text-slate-700 placeholder:font-normal"
            />
          </div>
        </div>

        <div className="bg-rose-50/50 p-6 rounded-3xl border-2 border-rose-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
                <Calendar className="w-5 h-5 text-sky-400" /> 玩幾天
              </label>
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border-2 border-white shadow-sm">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-400"
                />
                <span className="text-xl font-black text-sky-500 min-w-[3.5rem] text-right bg-sky-50 px-2 rounded-lg">{duration} 天</span>
              </div>
            </div>

            {/* Companions */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
                <Users className="w-5 h-5 text-pink-400" /> 跟誰去
              </label>
              <div className="relative">
                <select
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-white rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none appearance-none font-bold text-slate-700 shadow-sm"
                >
                  <option>獨自旅行</option>
                  <option>情侶/夫妻</option>
                  <option>家庭 (有小孩)</option>
                  <option>家庭 (帶長輩)</option>
                  <option>朋友出遊</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> 預算 (每人 / 新台幣)
          </label>
          <div className="bg-emerald-50/50 p-8 rounded-[2rem] border-2 border-emerald-100">
            <div className="flex flex-wrap items-baseline gap-2 mb-6">
              <span className="text-3xl font-black text-emerald-500">NT$</span>
              <div className="flex-1 min-w-[140px]">
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  step="1000"
                  className="w-full text-4xl font-black text-emerald-600 bg-transparent border-b-4 border-emerald-200 focus:border-emerald-400 outline-none pb-2 text-center"
                />
              </div>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="1000"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="w-full h-3 bg-emerald-200/50 rounded-full appearance-none cursor-pointer accent-emerald-500 mb-6"
            />
            <div className="flex gap-3 flex-wrap justify-center">
              {[10000, 30000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBudgetAmount(amt)}
                  className="px-4 py-2 text-sm font-bold bg-white border-2 border-emerald-100 rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                >
                  ${(amt/1000)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Transport */}
           <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
              <Car className="w-5 h-5 text-sky-400" /> 交通方式
            </label>
            <div className="relative">
              <select
                value={transportPreference}
                onChange={(e) => setTransportPreference(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none appearance-none font-bold text-slate-700"
              >
                <option>大眾運輸 (地鐵/公車)</option>
                <option>租車自駕</option>
                <option>計程車/包車</option>
                <option>步行漫遊</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Diet */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
              <Utensils className="w-5 h-5 text-orange-400" /> 飲食禁忌
            </label>
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="如：不吃牛"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none font-bold text-slate-700 placeholder:font-normal transition-all"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
            <Flag className="w-5 h-5 text-purple-400" /> 許願池 (選填)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="例如：想去貓咪咖啡廳..."
            rows={2}
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none resize-none font-bold text-slate-700 placeholder:font-normal transition-all"
          />
        </div>

        {/* Travel Style & Interests */}
        <div className="bg-sky-50/50 p-6 rounded-3xl border-2 border-sky-100 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2 pl-2">
              <Heart className="w-5 h-5 text-pink-400" /> 風格與興趣
            </label>
            <div className="relative mb-4">
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-6 py-4 bg-white border-2 border-white rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none appearance-none font-bold text-slate-700 shadow-sm"
              >
                <option>休閒放鬆 (睡到自然醒)</option>
                <option>行程緊湊 (特種兵式)</option>
                <option>深度文化 (博物館/古蹟)</option>
                <option>美食之旅 (吃貨行程)</option>
                <option>戶外冒險 (爬山/潛水)</option>
                <option>網美打卡 (拍照優先)</option>
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`py-2 px-4 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                    interests.includes(interest)
                      ? 'bg-sky-400 text-white border-sky-400 shadow-md transform scale-105'
                      : 'bg-white text-slate-500 border-white hover:border-sky-200 hover:text-sky-500'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !destination || !origin}
          className={`w-full py-5 px-6 rounded-full font-black text-xl text-white shadow-xl transition-all transform flex items-center justify-center gap-3 ${
            isLoading || !destination || !origin
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:shadow-sky-300 hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              AI 正在全力運轉中...
            </>
          ) : (
            <>
              出發去旅行！
              <Car className="w-6 h-6" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};