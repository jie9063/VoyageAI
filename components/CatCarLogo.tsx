
import React from 'react';

export const CatCarLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand-drawn style stroke */}
      <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        
        {/* Car Body (Blue) */}
        <path d="M15 65 C 15 55, 25 55, 30 55 L 75 55 C 85 55, 90 60, 90 70 L 90 80 C 90 85, 85 85, 80 85 L 20 85 C 15 85, 10 80, 10 75 L 15 65" fill="#38bdf8" />
        
        {/* Wheels */}
        <circle cx="30" cy="85" r="8" fill="#1e293b" />
        <circle cx="75" cy="85" r="8" fill="#1e293b" />
        <circle cx="30" cy="85" r="3" fill="#64748b" stroke="none"/>
        <circle cx="75" cy="85" r="3" fill="#64748b" stroke="none"/>

        {/* Cat Body (White) */}
        <path d="M35 55 L 35 45 C 35 30, 40 20, 50 20 C 60 20, 65 30, 65 45 L 65 55" fill="white" />
        
        {/* Cat Head/Hat (Blue Hat) */}
        <path d="M35 35 C 30 30, 30 25, 35 20 L 40 25 L 60 25 L 65 20 C 70 25, 70 30, 65 35" fill="#38bdf8" />
        
        {/* Cat Ears (poking out) */}
        <path d="M38 22 L 35 15 L 45 23" fill="white" strokeWidth="2" />
        <path d="M62 22 L 65 15 L 55 23" fill="white" strokeWidth="2" />

        {/* Face */}
        <circle cx="45" cy="40" r="2" fill="#1e293b" stroke="none" />
        <circle cx="55" cy="40" r="2" fill="#1e293b" stroke="none" />
        <path d="M48 45 Q 50 47, 52 45" strokeWidth="2" />
        
        {/* Blush */}
        <circle cx="40" cy="42" r="3" fill="#fca5a5" stroke="none" opacity="0.6" />
        <circle cx="60" cy="42" r="3" fill="#fca5a5" stroke="none" opacity="0.6" />

        {/* Steering Wheel / Paws */}
        <path d="M35 50 L 45 52" strokeWidth="3" />
        <circle cx="34" cy="50" r="4" fill="white" />
        <circle cx="66" cy="50" r="4" fill="white" />

        {/* Windshield reflection */}
        <path d="M75 60 L 80 65" stroke="#7dd3fc" strokeWidth="3" />
      </g>
    </svg>
  );
};
