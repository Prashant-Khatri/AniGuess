'use client'
import React from "react";

export const RefreshLoader = ({ 
  message = "Please wait..." 
}:{message? : string}) => {
  return (
    <div className="fixed inset-0 bg-neutral-950 z-[100] flex flex-col items-center justify-center overflow-hidden antialiased font-sans select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center p-6 sm:p-8 max-w-xs w-full bg-white border-4 border-neutral-950 rounded-2xl shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] text-center">
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-2 border-dashed border-red-600/30 rounded-full animate-[spin_20s_linear_infinite]" />
          <svg 
            className="w-20 h-20 animate-[spin_2.5s_linear_infinite] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="46" stroke="#0a0a0a" strokeWidth="4" />
            <circle cx="50" cy="50" r="41" fill="#dc2626" />
            <path 
              d="M 50,50 
                 C 50,30 38,18 26,26 
                 C 14,34 32,48 50,50 
                 C 68,52 76,34 74,26 
                 C 72,18 56,36 50,50 
                 C 44,64 56,82 68,78 
                 C 80,74 62,62 50,50 
                 C 38,38 24,56 26,68 
                 C 28,80 44,64 50,50 Z" 
              fill="#0a0a0a" 
            />
            <circle cx="50" cy="50" r="7" fill="#0a0a0a" />
            <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
          </svg>
        </div>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950 text-white border-2 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] uppercase font-mono font-black tracking-widest">
              PREPARING
            </span>
          </div>
          <h2 className="text-sm font-mono font-black uppercase tracking-wider text-neutral-950">
            {message}
          </h2>
          <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wide">
            Just a brief moment
          </p>
        </div>
      </div>
    </div>
  );
};