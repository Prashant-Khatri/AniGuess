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
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;
  const isCritical = displayTime <= 5;
  const isWarning = displayTime <= 10 && displayTime > 5;
  const glowColor = isCritical
    ? "stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
    : isWarning
      ? "stroke-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
      : "stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]";
  const textColor = isCritical
    ? "text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
    : isWarning
      ? "text-amber-500"
      : "text-emerald-400";
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-md shadow-xl relative overflow-hidden group">
      {isCritical && (
        <div className="absolute inset-0 bg-red-950/10 pointer-events-none animate-pulse border border-red-500/20 rounded-2xl" />
      )}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between px-2">
        <div className="flex flex-col text-center sm:text-left space-y-1">
          <span className="text-[10px] font-mono font-black tracking-widest text-slate-500 uppercase">
            TEMPORAL ARENA VECTOR:
          </span>
          <h4 className={`font-mono font-black text-xs uppercase tracking-wider ${isCritical ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
            {isCritical ? "⚠️ CRITICAL LINK TIMEOUT" : isWarning ? "⚡ SPEEDING UP..." : "📡 STREAM STABLE"}
          </h4>
        </div>
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-slate-950 fill-none stroke-[6]"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              className={`fill-none stroke-[5] transition-all duration-300 ease-linear ${glowColor}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className={`font-mono text-2xl font-black tracking-tighter ${textColor} ${isCritical ? 'animate-ping opacity-70 absolute scale-75' : ''}`}>
              {displayTime}
            </span>
            <span className="text-[7px] font-mono font-black text-slate-500 tracking-widest uppercase mt-[-2px]">
              SEC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}