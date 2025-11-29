import React, { useState } from 'react';
import { Itinerary, Activity } from '../types';
import { Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Share2, Printer, ArrowLeft } from 'lucide-react';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onReset: () => void;
}

const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'sightseeing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'relax': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shopping': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'travel': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="relative pl-8 pb-8 last:pb-0 group page-break-inside-avoid">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200 group-last:hidden"></div>
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${getTypeColor(activity.type).replace('bg-', 'bg-').split(' ')[0]}`}>
        <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTypeColor(activity.type)}`}>
                {activity.time}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded">
                {activity.type === 'food' ? '餐飲' : 
                 activity.type === 'sightseeing' ? '景點' : 
                 activity.type === 'travel' ? '交通' : 
                 activity.type === 'shopping' ? '購物' : 
                 activity.type === 'relax' ? '休閒' : '活動'}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800">{activity.activity}</h4>
          </div>
          {activity.estimatedCost && (
             <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
               <DollarSign className="w-3 h-3 mr-1" />
               {activity.estimatedCost}
             </div>
          )}
        </div>
        
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          {activity.description}
        </p>
        
        <div className="flex items-center text-xs text-slate-500 font-medium">
          <MapPin className="w-3 h-3 mr-1" />
          {activity.location}
        </div>
      </div>
    </div>
  );
};

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onReset }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // In print mode, we want all days expanded usually, but for React state simple toggle is fine.
  // CSS can force expansion if needed, but keeping JS simple.
  
  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 print:pb-0">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button 
          onClick={onReset}
          className="flex items-center text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          重新規劃
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" 
            title="列印行程"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden mb-8 print:shadow-none print:border print:border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 opacity-90 print:hidden"></div>
        
        {/* Decorative Circles - hidden in print via CSS opacity or logic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 print:hidden"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 print:hidden"></div>

        <div className="relative p-8 md:p-12 text-white print:text-slate-900">
          <div className="inline-block px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider mb-4 border border-white/20 print:border-slate-300 print:text-slate-600 print:bg-slate-100">
            您的專屬行程
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {itinerary.tripName}
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl opacity-90 print:text-slate-600">
            {itinerary.summary}
          </p>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <div key={day.day} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 print:shadow-none print:break-inside-avoid">
            {/* Day Header */}
            <button 
              onClick={() => toggleDay(day.day)}
              className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors print:pointer-events-none"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-blue-200 print:shadow-none print:bg-slate-800">
                  <span className="text-xs font-medium opacity-80">DAY</span>
                  <span className="text-xl font-bold leading-none">{day.day}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{day.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{day.theme}</p>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 no-print ${expandedDay === day.day ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {/* Activities Timeline */}
            <div className={`transition-all duration-500 ease-in-out ${expandedDay === day.day ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden print:max-h-none print:opacity-100'}`}>
              <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 print:bg-white">
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