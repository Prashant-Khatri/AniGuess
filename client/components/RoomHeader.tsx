'use client'
import React from "react";
import toast from "react-hot-toast";
import GameLoopTimer from "./GameLoopTimer"; // Adjust the import path based on your folder structure
import { RoomCodeCopiedToast } from "./Toast";
import { useGameStore } from "@/store/game.store";

interface RoomHeaderProps {
  roomId: string;
  // hostName: string;
  // hostAvatarUrl: string;
  // status: "waiting" | "playing" | string; // Track the current room matrix state
}

export default function RoomHeader({ roomId }: RoomHeaderProps) {
  const {hostName,avatarUrl,status}=useGameStore()
  
  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    RoomCodeCopiedToast()
  };

  const isPlaying = status === "playing";

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden shadow-xl">
      {/* Decorative Top Glowing Horizon Line */}
      <div className={`absolute top-0 left-0 h-[1.5px] w-full transition-colors duration-500 ${
        isPlaying 
          ? "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" 
          : "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
      }`} />
      
      {/* Left Area: Interactive Transmission Room Token */}
      <div className="flex items-center space-x-2 w-full md:w-auto justify-center md:justify-start">
        <button 
          onClick={copyRoomCode}
          className="bg-slate-950/80 hover:bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-indigo-500/40 flex items-center space-x-2 transition-all duration-200 active:scale-[0.98] group cursor-pointer"
          title="Copy Core Broadcast Key"
        >
          <span className="text-[10px] uppercase tracking-widest font-mono font-black text-slate-500 group-hover:text-indigo-400/70 transition-colors">
            VECTOR CODE:
          </span>
          <span className="font-mono font-black text-indigo-400 tracking-widest text-sm uppercase">
            {roomId || "------"}
          </span>
          <span className="text-[11px] text-slate-600 group-hover:text-indigo-400 transition-colors pl-1">
            📋
          </span>
        </button>
      </div>

      {/* Center Area: Conditional Tactical Temporal Loop HUD */}
      {isPlaying ? (
        <div className="w-full md:max-w-md flex-1 order-3 md:order-none animate-fade-in">
          <GameLoopTimer />
        </div>
      ) : (
        /* Placeholder system message to anchor layout geometry before match initializes */
        <div className="hidden md:flex flex-col items-center justify-center text-center font-mono space-y-0.5 opacity-40 select-none">
          <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
            AWAITING DEPLOYMENT PROTOCOL
          </span>
          <span className="text-[10px] text-slate-400 animate-pulse">
            [ STANDBY FOR COMS LINK ]
          </span>
        </div>
      )}

      {/* Right Area: Authenticated Lobby Host / Commander Grid */}
      <div className="flex items-center space-x-3 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-950 w-full md:w-auto justify-center md:justify-end">
        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500">
          Lobby Admiral:
        </span>
        <div className="flex items-center space-x-2">
          {/* Avatar Container Matrix */}
          <div className="relative w-7 h-7 rounded-full border border-orange-500/30 overflow-hidden bg-slate-900 shadow-md">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={hostName} 
                className="object-cover w-full h-full" 
              />
            ) : (
              <div className="w-full h-full bg-slate-800 animate-pulse" />
            )}
          </div>
          {/* Identity Handle String */}
          <span className="font-mono font-black text-orange-400 text-xs uppercase tracking-wide">
            {hostName || "Syncing..."}
          </span>
          <span className="text-[8px] font-mono font-black bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1 rounded tracking-tighter">
            HOST
          </span>
        </div>
      </div>
    </div>
  );
}