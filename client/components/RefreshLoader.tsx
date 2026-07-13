import React from 'react';

export const RefreshLoader = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center overflow-hidden selection:bg-indigo-500 selection:text-white antialiased font-sans">
      {/* Anime Sci-Fi Cyber Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #4f46e5 1px, transparent 1px),
            linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Background Energy Vignette Art */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-orange-600/5 blur-[140px] pointer-events-none animate-pulse duration-3000" />

      {/* Main Core Center Alignment */}
      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
        
        {/* Animated Visual Core Engine */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer Ring Matrix Layer */}
          <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin duration-10000" />
          
          {/* Middle Diagnostic Crosshairs Layer */}
          <div className="absolute w-[85%] h-[85%] border border-indigo-500/10 rounded-full flex items-center justify-center animate-ping duration-3000 opacity-40" />
          
          {/* Inner Fast Spinning Tech Gear Layer */}
          <div className="absolute w-[70%] h-[70%] border-4 border-t-indigo-500 border-r-transparent border-b-orange-500/40 border-l-transparent rounded-full animate-spin duration-1000" />
          
          {/* Glowing Target Core Matrix */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-[0_0_24px_rgba(79,70,229,0.6)] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Text Interface Array Logs */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-[10px] uppercase font-black font-mono tracking-widest text-indigo-400">
              Syncing Vector Cache
            </span>
          </div>
          
          <h2 className="text-sm font-mono font-bold tracking-wide uppercase text-slate-300 animate-pulse duration-1500">
            Re-establishing Neural Link...
          </h2>
          
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-tight">
            Terminal Protocol // Handshake Checkpoint
          </p>
        </div>
      </div>
    </div>
  );
};