
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
  const [budgetAmount, setBudgetAmount] = useState(20000); // Numeric budget
  const [travelStyle, setTravelStyle] = useState('休閒放鬆');
  const [companions, setCompanions] = useState('情侶/夫妻');
  const [interests, setInterests] = useState<string[]>([]);
  
  // Detailed preferences
  const [transportPreference, setTransportPreference] = useState('大眾運輸');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('無');
  const [specialRequests, setSpecialRequests] = useState('');

  // Update state if initialValues changes (e.g. from URL params)
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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          開啟您的旅程
        </h2>
        <p className="text-blue-100 opacity-90">告訴我們您的理想假期與預算，AI 將為您精打細算。</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-blue-500" /> 出發地
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="例如：台北、高雄、桃機..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" /> 目的地
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例如：日本京都、曼谷、墾丁..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
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

        {/* Budget (Numeric) */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-500" /> 預算 (每人 / 新台幣)
          </label>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-slate-800">NT$</span>
              <div className="flex-1 min-w-[140px]">
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  step="1000"
                  className="w-full text-3xl font-bold text-blue-600 bg-transparent border-b-2 border-slate-300 focus:border-blue-500 outline-none pb-1"
                />
              </div>
              <span className="text-slate-500 font-medium whitespace-nowrap">/ 人 (含交通)</span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="1000"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
            />
            <div className="flex gap-2 flex-wrap">
              {[10000, 30000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBudgetAmount(amt)}
                  className="px-3 py-1 text-xs font-medium bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  NT$ {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
           {/* Transport */}
           <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" /> 當地交通偏好
            </label>
            <select
              value={transportPreference}
              onChange={(e) => setTransportPreference(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>大眾運輸 (地鐵/公車)</option>
              <option>租車自駕</option>
              <option>計程車/包車</option>
              <option>步行漫遊</option>
            </select>
          </div>

          {/* Diet */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
              <Utensils className="w-4 h-4 text-blue-500" /> 飲食偏好/禁忌
            </label>
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="如：不吃牛、素食、海鮮過敏..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Flag className="w-4 h-4 text-blue-500" /> 具體願望 (選填)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="例如：我想去哈利波特影城、想吃一蘭拉麵、一定要看夜景..."
            rows={2}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
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
            <option>休閒放鬆 (睡到自然醒)</option>
            <option>行程緊湊 (特種兵式)</option>
            <option>深度文化 (博物館/古蹟)</option>
            <option>美食之旅 (吃貨行程)</option>
            <option>戶外冒險 (爬山/潛水)</option>
            <option>網美打卡 (拍照優先)</option>
          </select>
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
          disabled={isLoading || !destination || !origin}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform flex items-center justify-center gap-2 ${
            isLoading || !destination || !origin
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              正在計算交通並生成行程...
            </>
          ) : (
            '開始規劃行程'
          )}
        </button>
      </form>
    </div>
  );
};
