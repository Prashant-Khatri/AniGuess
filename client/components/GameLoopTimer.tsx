'use client'
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";
import React, { useEffect } from "react";

export default function GameLoopTimer() {
  const { timerTickListener } = useSocketListener(socket);
  const remainingTime = useGameStore((state) => state.remainingTime);
  const guessTime = useGameStore((state) => state.guessTime);
  const displayTime = remainingTime === 20 && guessTime !== 20 ? guessTime : remainingTime;
  const maxTime = guessTime || 20;

  useEffect(() => {
    const cleanTimerTick = timerTickListener();
    return () => {
      if (cleanTimerTick) cleanTimerTick();
    };
  }, []);
  const percentage = Math.max(0, Math.min(100, (displayTime / maxTime) * 100));
  const isCritical = displayTime <= 5;
  const isWarning = displayTime <= 10 && displayTime > 5;
  const progressBgColor = isCritical
    ? "bg-rose-600"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-600";

  const statusTextColor = isCritical
    ? "text-rose-600 animate-pulse"
    : "text-slate-900";
  return (
    <div className="w-full h-full bg-white border-4 border-slate-950 rounded-2xl px-2 sm:px-4 py-0.5 flex flex-col justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden select-none">
      {isCritical && (
        <div className="absolute inset-0 bg-rose-50/40 pointer-events-none animate-pulse" />
      )}
      <div className="flex items-center justify-center sm:justify-between w-full gap-2 relative z-10">
        <div className="hidden sm:flex flex-col min-w-0">
          <span className="text-[8px] font-mono font-black tracking-widest text-slate-400 uppercase truncate">
            STATUS:
          </span>
          <h4 className={`font-mono font-black text-xs uppercase tracking-wider truncate ${statusTextColor}`}>
            {isCritical ? "HURRY UP!" : isWarning ? "FAST MODE" : "ACTIVE"}
          </h4>
        </div>
        <div className="flex items-baseline space-x-0.5 flex-shrink-0 bg-slate-50 border-2 border-slate-950 px-2.5 py-0.5 sm:py-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className={`font-mono text-sm sm:text-base font-black tracking-tighter ${isCritical ? 'text-rose-600 animate-pulse' : isWarning ? 'text-amber-500' : 'text-slate-950'}`}>
            {displayTime}
          </span>
          <span className="text-[9px] font-mono font-black text-slate-500 tracking-tight uppercase">
            S
          </span>
        </div>

      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 border-t border-slate-950 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-linear ${progressBgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}