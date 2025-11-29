import React, { useState } from 'react';
import { Itinerary, Activity, UserPreferences } from '../types';
import { MapPin, DollarSign, ChevronDown, Share2, Printer, ArrowLeft, Check, Plane, Wallet, Star } from 'lucide-react';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  preferences: UserPreferences;
  onReset: () => void;
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'food': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-400' };
      case 'sightseeing': return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100', dot: 'bg-sky-400' };
      case 'relax': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-400' };
      case 'shopping': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', dot: 'bg-pink-400' };
      case 'travel': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', dot: 'bg-slate-400' };
      default: return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-400' };
    }
  };

  const styles = getTypeStyles(activity.type);

  return (
    <div className="relative pl-6 pb-8 last:pb-0 group page-break-inside-avoid">
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-100 group-last:hidden"></div>
      <div className={`absolute left-0 top-3 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${styles.dot}`}>
      </div>

      <div className={`rounded-3xl p-5 border-2 ${styles.border} ${styles.bg} hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black px-2 py-1 rounded-lg bg-white ${styles.text}`}>
                {activity.time}
              </span>
              <span className="text-xs text-slate-400 font-bold tracking-wide">
                {activity.type === 'food' ? '吃好料' : 
                 activity.type === 'sightseeing' ? '看風景' : 
                 activity.type === 'travel' ? '移動中' : 
                 activity.type === 'shopping' ? '買買買' : 
                 activity.type === 'relax' ? '桑一下' : '活動'}
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-800">{activity.activity}</h4>
          </div>
          {activity.estimatedCost && (
             <div className="flex items-center text-xs font-bold text-slate-500 bg-white/60 px-3 py-1.5 rounded-full whitespace-nowrap self-start">
               <DollarSign className="w-3 h-3 mr-1" />
               {activity.estimatedCost}
             </div>
          )}
        </div>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-3 font-medium">
          {activity.description}
        </p>
        
        <div className="flex items-center text-xs text-slate-400 font-bold bg-white/50 inline-block px-2 py-1 rounded-md">
          <MapPin className="w-3 h-3 mr-1" />
          {activity.location}
        </div>
      </div>
    </div>
  );
};

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, preferences, onReset }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [justCopied, setJustCopied] = useState(false);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleShare = async () => {
    const params = new URLSearchParams();
    params.set('origin', preferences?.origin || '');
    params.set('dest', preferences?.destination || '');
    params.set('days', (preferences?.duration || 3).toString());
    params.set('budget', (preferences?.budgetAmount || 20000).toString());
    params.set('style', preferences?.travelStyle || '休閒');
    params.set('who', preferences?.companions || '');
    if (preferences?.interests?.length) {
      params.set('tags', preferences.interests.join(','));
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const shareData = {
      title: `VoyageAI: ${itinerary.tripName}`,
      text: `來看看我用 VoyageAI 規劃的 ${itinerary.destination} 行程！`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 print:pb-0">
      <div className="flex justify-between items-center mb-6 no-print px-2">
        <button 
          onClick={onReset}
          className="flex items-center text-slate-500 hover:text-sky-500 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          重新規劃
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className={`p-2 rounded-full transition-all flex items-center gap-2 px-4 py-2 font-bold shadow-sm ${
              justCopied 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-white text-slate-500 hover:text-sky-500 hover:shadow-md'
            }`}
          >
            {justCopied ? (
              <>
                <Check className="w-5 h-5" />
                <span className="text-sm">已複製</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">分享</span>
              </>
            )}
          </button>
          <button 
            onClick={() => window.print()}
            className="p-2 bg-white text-slate-500 hover:text-sky-500 rounded-full transition-all shadow-sm hover:shadow-md" 
            title="列印行程"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-sky-400 to-blue-500 rounded-[2.5rem] shadow-xl shadow-sky-200 overflow-hidden mb-8 border-4 border-white print:shadow-none print:border print:border-slate-200">
        {/* Decorative Circles */}
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-[-10px] left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>

        <div className="relative p-8 md:p-12 text-white print:text-slate-900">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wider border border-white/30">
              YOUR TRIP
            </div>
            {itinerary.totalEstimatedCost && (
               <div className="inline-block px-4 py-1.5 bg-emerald-400/30 backdrop-blur-md rounded-full text-xs font-black tracking-wider border border-white/30">
                 總預算: {itinerary.totalEstimatedCost}
               </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            {itinerary.tripName}
          </h1>
          <p className="text-sky-100 text-lg font-medium leading-relaxed max-w-2xl opacity-90 print:text-slate-600 mb-8">
            {itinerary.summary}
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 inline-flex flex-col sm:flex-row gap-8 print:bg-slate-50 print:border-slate-200">
             <div className="flex items-center gap-4">
               <div className="p-3 bg-white/20 rounded-xl text-white shadow-inner">
                 <Plane className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs text-sky-100 font-bold uppercase tracking-wider print:text-slate-500">預估交通費</p>
                 <p className="font-black text-xl">{itinerary.estimatedTransportCost}</p>
               </div>
             </div>
             {preferences && (
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-400/20 rounded-xl text-emerald-100 shadow-inner">
                   <Wallet className="w-6 h-6" />
                 </div>
                 <div>
                   <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider print:text-slate-500">您的預算</p>
                   <p className="font-black text-xl">NT$ {preferences.budgetAmount.toLocaleString()}</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <div key={day.day} className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sky-100 print:shadow-none print:break-inside-avoid print:overflow-visible group">
            <button 
              onClick={() => toggleDay(day.day)}
              className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors print:pointer-events-none"
            >
              <div className="flex items-center gap-5">
                <div className="bg-sky-400 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-sky-200 print:shadow-none print:bg-slate-800 transform group-hover:scale-105 transition-transform">
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">DAY</span>
                  <span className="text-2xl font-black leading-none">{day.day}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{day.title}</h3>
                  <div className="inline-block px-2 py-0.5 bg-pink-50 text-pink-500 text-xs font-bold rounded-md">
                     {day.theme}
                  </div>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 no-print ${expandedDay === day.day ? 'rotate-180 bg-sky-100 text-sky-500' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            <div className={`transition-all duration-500 ease-in-out ${
              expandedDay === day.day 
                ? 'max-h-[3000px] opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden print:max-h-none print:opacity-100 print:overflow-visible'
            }`}>
              <div className="p-6 pt-2 bg-white">
                {day.activities.map((activity, idx) => (
                  <ActivityCard key={idx} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};