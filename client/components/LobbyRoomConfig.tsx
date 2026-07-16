'use client'
import React, { useEffect } from "react";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useRoomHandler } from "@/hooks/useRoomHandler";
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";

function LobbyRoomConfig({ roomId }: { roomId: string }) {
  const totalRounds = useGameStore((state) => state.totalRounds);
  const maxPlayers = useGameStore((state) => state.maxPlayers);
  const guessTime = useGameStore((state) => state.guessTime);
  const imagesInOneRound = useGameStore((state) => state.imagesInOneRound);
  const isAdmin = useGameStore((state) => state.isAdmin);
  const { startGame } = useGameHandler(socket);
  const { configUpdatedListener } = useSocketListener(socket);
  const { changeRoomConfig } = useRoomHandler(socket);
  const handleSettingChange = (key: string) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    const newValue = Number(e.target.value);
    changeRoomConfig({ key, value: newValue, roomId });
  };

  const handleStartGame = () => {
    if (!roomId) return;
    startGame(roomId);
  };

  useEffect(() => {
    const cleanConfigUpdated = configUpdatedListener();
    return () => {
      if (cleanConfigUpdated) cleanConfigUpdated();
    };
  }, []);

  return (
    <div className="w-full h-full bg-white border-4 border-slate-950 rounded-2xl p-2 sm:p-3 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between min-h-0 select-none">
      <div className="w-full flex items-center justify-between pb-1.5 border-b-2 border-slate-950 flex-shrink-0">
        <div className="flex items-center space-x-1.5">
          <span className="text-rose-600 text-xs animate-pulse">👁️</span>
          <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-wider font-mono text-slate-950">
            Lobby Config
          </h2>
        </div>
        <span className="text-[8px] font-mono bg-slate-950 border border-slate-950 px-1.5 py-0.5 rounded font-bold text-rose-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
          #{roomId || "NULL"}
        </span>
      </div>
      <div className="flex-1 my-2 grid grid-cols-2 gap-1.5 items-center content-center min-h-0 overflow-y-auto pr-0.5 custom-scrollbar">
        <div className="flex flex-row items-center justify-between bg-white border-2 border-slate-950 px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] h-8 sm:h-10 w-full gap-2">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px]">👥</span>
            <p className="text-[9px] font-black font-mono text-slate-950 hidden min-[360px]:inline">Players</p>
          </div>
          <select
            value={maxPlayers}
            onChange={handleSettingChange("maxPlayers")}
            disabled={!isAdmin}
            className="flex-1 max-w-[65px] bg-slate-50 border border-slate-950 font-mono font-black text-[9px] text-rose-600 px-1 py-0.5 rounded focus:outline-none focus:bg-rose-50 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            {[2, 4, 6, 8].map((num) => (
              <option key={num} value={num}>{num} Max</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row items-center justify-between bg-white border-2 border-slate-950 px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] h-8 sm:h-10 w-full gap-2">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px]">🎯</span>
            <p className="text-[9px] font-black font-mono text-slate-950 hidden min-[360px]:inline">Rounds</p>
          </div>
          <select
            value={totalRounds}
            onChange={handleSettingChange("totalRounds")}
            disabled={!isAdmin}
            className="flex-1 max-w-[65px] bg-slate-50 border border-slate-950 font-mono font-black text-[9px] text-rose-600 px-1 py-0.5 rounded focus:outline-none focus:bg-rose-50 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            {[1, 3, 5, 7].map((num) => (
              <option key={num} value={num}>{num} Sets</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row items-center justify-between bg-white border-2 border-slate-950 px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] h-8 sm:h-10 w-full gap-2">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px]">⏱️</span>
            <p className="text-[9px] font-black font-mono text-slate-950 hidden min-[360px]:inline">Time</p>
          </div>
          <select
            value={guessTime}
            onChange={handleSettingChange("guessTime")}
            disabled={!isAdmin}
            className="flex-1 max-w-[65px] bg-slate-50 border border-slate-950 font-mono font-black text-[9px] text-rose-600 px-1 py-0.5 rounded focus:outline-none focus:bg-rose-50 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            {[15, 20, 30, 45, 60, 80, 120].map((sec) => (
              <option key={sec} value={sec}>{sec}s</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row items-center justify-between bg-white border-2 border-slate-950 px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)] h-8 sm:h-10 w-full gap-2">
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px]">🖼️</span>
            <p className="text-[9px] font-black font-mono text-slate-950 hidden min-[360px]:inline">Cards</p>
          </div>
          <select
            value={imagesInOneRound}
            onChange={handleSettingChange("imagesInOneRound")}
            disabled={!isAdmin}
            className="flex-1 max-w-[65px] bg-slate-50 border border-slate-950 font-mono font-black text-[9px] text-rose-600 px-1 py-0.5 rounded focus:outline-none focus:bg-rose-50 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            {[1, 3, 5].map((num) => (
              <option key={num} value={num}>{num} Pcs</option>
            ))}
          </select>
        </div>
      </div>
      <div className="pt-1.5 border-t-2 border-slate-950 flex flex-col items-center justify-center flex-shrink-0 w-full">
        {isAdmin ? (
          <button
            onClick={handleStartGame}
            className="w-full max-w-[240px] py-1.5 bg-rose-600 hover:bg-rose-500 border-2 border-slate-950 text-white font-mono font-black text-[11px] uppercase tracking-wider rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
             Start Match
          </button>
        ) : (
          <div className="flex items-center justify-center space-x-2 px-3 py-1 bg-slate-950 border border-slate-950 rounded-lg w-full max-w-[240px] text-center animate-pulse shadow-[1px_1px_0px_0px_rgba(244,63,94,0.3)]">
            <span className="text-rose-500 text-[10px] font-mono font-bold">📡</span>
            <p className="text-[8px] font-mono font-black text-rose-400 uppercase tracking-tight">
              Waiting for host...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbyRoomConfig;