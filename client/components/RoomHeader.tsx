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
    <div className="w-full bg-white border-4 border-slate-950 rounded-2xl p-1.5 sm:p-2.5 flex flex-row items-center justify-between gap-1.5 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex-shrink-0 select-none max-h-[52px] sm:max-h-[64px]">
      <div className={`absolute top-0 left-0 h-[2px] w-full transition-colors duration-500 ${isPlaying ? "bg-rose-600" : "bg-slate-950"}`} />
      <div className="flex-shrink-0">
        <button
          onClick={copyRoomCode}
          className="bg-slate-950 hover:bg-slate-900 px-2 py-1 rounded-lg border-2 border-slate-950 flex items-center space-x-1 sm:space-x-1.5 transition-all duration-200 active:scale-[0.98] group cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(244,63,94,0.4)]"
          title="Copy Room Code"
        >
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono font-black text-rose-500">
            ROOM:
          </span>
          <span className="font-mono font-black text-white tracking-widest text-xs uppercase">
            {roomId || "------"}
          </span>
          <span className="text-[10px] pl-0.5 group-hover:scale-110 transition-transform">
            📋
          </span>
        </button>
      </div>
      {isPlaying ? (
        <div className="flex-1 max-w-[100px] sm:max-w-xs px-1 min-h-0 flex items-center justify-center mx-auto">
          <GameLoopTimer />
        </div>
      ) : (
        <div className="flex-1 hidden min-[500px]:flex flex-col items-center justify-center text-center font-mono opacity-40 select-none">
          <span className="text-[8px] font-black tracking-widest text-slate-950 uppercase">
            STANDBY
          </span>
        </div>
      )}
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        <div className="flex items-center space-x-1 bg-rose-50 border-2 border-slate-950 px-1.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase text-slate-400">
            Host:
          </span>
          <div className="flex items-center space-x-1">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded border border-slate-950 overflow-hidden bg-white flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={hostName} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-rose-600 animate-pulse" />
              )}
            </div>
            <span className="font-mono font-black text-rose-600 text-[9px] sm:text-xs uppercase max-w-[45px] sm:max-w-[80px] truncate">
              {hostName || "..."}
            </span>
          </div>
        </div>
        <button
          onClick={() => handleLeaveRoom(roomId)}
          className="group px-1.5 py-0.5 bg-white hover:bg-rose-50 border-2 border-slate-950 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 active:scale-95 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer h-[24px] sm:h-[30px]"
          title="Leave Room"
        >
          <span className="text-[10px] sm:text-xs">🚪</span>
          <span className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-950 group-hover:text-rose-600 transition-colors">
            Leave
          </span>
        </button>
      </div>
    </div>
  );
}