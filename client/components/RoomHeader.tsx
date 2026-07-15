'use client'
import React from "react";
import GameLoopTimer from "./GameLoopTimer";
import { RoomCodeCopiedToast } from "./Toast";
import { useGameStore } from "@/store/game.store";
import { useGameHandler } from "@/hooks/useGameHandler";
import { socket } from "@/lib/socket";

interface RoomHeaderProps {
  roomId: string;
}

export default function RoomHeader({ roomId }: RoomHeaderProps) {
  const hostName = useGameStore((state) => state.hostName);
  const avatarUrl = useGameStore((state) => state.avatarUrl);
  const status = useGameStore((state) => state.status);
  const { handleLeaveRoom } = useGameHandler(socket);
  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    RoomCodeCopiedToast();
  };
  const isPlaying = status === "playing";
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 grid grid-cols-1 md:flex md:flex-row xl:grid xl:grid-cols-4 items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden shadow-xl">
      <div className={`absolute top-0 left-0 h-[1.5px] w-full transition-colors duration-500 ${isPlaying
          ? "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
          : "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
        }`} />
      <div className="flex items-center space-x-2 w-full md:w-auto justify-center md:justify-start xl:col-span-1">
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
      {isPlaying ? (
        <div className="w-full md:max-w-md flex-1 order-3 md:order-none animate-fade-in xl:col-span-2">
          <GameLoopTimer />
        </div>
      ) : (
        <div className="hidden md:flex flex-col items-center justify-center text-center font-mono space-y-0.5 opacity-40 select-none xl:col-span-2">
          <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
            AWAITING DEPLOYMENT PROTOCOL
          </span>
          <span className="text-[10px] text-slate-400 animate-pulse">
            [ STANDBY FOR COMS LINK ]
          </span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-center md:justify-end xl:col-span-1">
        <div className="flex items-center space-x-3 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-950 w-full sm:w-auto justify-center">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500">
            Lobby Admiral:
          </span>
          <div className="flex items-center space-x-2">
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
            <span className="font-mono font-black text-orange-400 text-xs uppercase tracking-wide">
              {hostName || "Syncing..."}
            </span>
            <span className="text-[8px] font-mono font-black bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1 rounded tracking-tighter">
              HOST
            </span>
          </div>
        </div>
        <button
          onClick={() => handleLeaveRoom(roomId)}
          className="group relative w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/60 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 shadow-md overflow-hidden cursor-pointer"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

          <span className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5">
            🚪
          </span>
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-400 transition-colors">
            Abort Instance
          </span>
        </button>
      </div>
    </div>
  );
}