import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { MapPin, Calendar, Users, Wallet, Heart, Sparkles, Loader2 } from 'lucide-react';

interface TripInputProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const INTERESTS_OPTIONS = ["美食探索", "歷史文化", "自然風景", "購物血拼", "放鬆療癒", "冒險運動", "親子同樂", "攝影打卡"];

export const TripInput: React.FC<TripInputProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState('適中');
  const [travelStyle, setTravelStyle] = useState('休閒放鬆');
  const [companions, setCompanions] = useState('情侶/夫妻');
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    
    onSubmit({
      destination,
      duration,
      budget,
      travelStyle,
      companions,
      interests
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          開啟您的旅程
        </h2>
        <p className="text-blue-100 opacity-90">告訴我們您的理想假期，AI 將為您量身打造。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Destination */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" /> 目的地
          </label>
          <input
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="例如：日本京都、法國巴黎、台北..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-lg placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Duration */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> 天數
            </label>
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
              <input
                type="range"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-lg font-bold text-blue-600 min-w-[3rem] text-right">{duration} 天</span>
            </div>
          </div>

          {/* Companions */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> 旅伴
            </label>
            <select
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            >
              <option>獨自旅行</option>
              <option>情侶/夫妻</option>
              <option>家庭 (有小孩)</option>
              <option>家庭 (帶長輩)</option>
              <option>朋友出遊</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-500" /> 預算等級
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['經濟', '適中', '豪華'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`py-2 px-2 text-sm font-medium rounded-lg transition-colors ${
                    budget === b 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Heart className="w-4 h-4 text-blue-500" /> 旅遊風格
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            >
              <option>休閒放鬆</option>
              <option>行程緊湊</option>
              <option>深度文化</option>
              <option>美食之旅</option>
              <option>戶外冒險</option>
            </select>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
            感興趣的主題 (可多選)
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`py-2 px-4 rounded-full text-sm transition-all duration-200 ${
                  interests.includes(interest)
                    ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !destination}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-2 ${
            isLoading || !destination
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              正在生成完美行程...
            </>
          ) : (
            '開始規劃行程'
          )}
        </button>
      </form>
    </div>
  );
};