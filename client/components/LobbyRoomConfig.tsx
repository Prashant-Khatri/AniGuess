'use client'
import React, { useEffect } from "react";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useRoomHandler } from "@/hooks/useRoomHandler";
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";

function LobbyRoomConfig({ roomId }: { roomId: string }) {
  // 1. Read everything directly from the Zustand store
  const { 
    totalRounds, 
    maxPlayers, 
    guessTime, 
    imagesInOneRound, 
    isAdmin 
  } = useGameStore();

  const { startGame } = useGameHandler(socket);
  const { configUpdatedListener } = useSocketListener(socket);
  const { changeRoomConfig } = useRoomHandler(socket);

  // 2. Fire the change straight to the backend configuration handler
  const handleSettingChange = (key: string) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.preventDefault();
    const newValue = Number(e.target.value);
    
    // Send to backend -> backend broadcasts -> your socket listener updates your Zustand store
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
    <div className="w-full bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
      {/* Top Subtle Accent Strip */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      {/* Lobby Configuration Matrix Title header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-indigo-400 text-lg animate-pulse">🛠️</span>
          <h2 className="text-sm font-black uppercase tracking-wider font-mono text-slate-200">
            Room Control Sub-Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-500">
          NODE://{roomId || "NULL"}
        </span>
      </div>

      {/* Configuration Inputs Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Max Players Selector */}
        <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl hover:border-indigo-500/30 transition">
          <div className="flex items-center space-x-3">
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">👥</span>
            <div>
              <p className="text-xs font-bold text-slate-300 font-sans">Max Players</p>
              <p className="text-[10px] text-slate-500 font-mono">LOBBY_CAPACITY</p>
            </div>
          </div>
          <select
            value={maxPlayers} // Read directly from store
            onChange={handleSettingChange("maxPlayers")}
            disabled={!isAdmin}
            className="bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-indigo-400 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {[2, 4, 6, 8, 12, 16].map((num) => (
              <option key={num} value={num}>{num} Members</option>
            ))}
          </select>
        </div>

        {/* Max Rounds Selector */}
        <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl hover:border-purple-500/30 transition">
          <div className="flex items-center space-x-3">
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">🎯</span>
            <div>
              <p className="text-xs font-bold text-slate-300 font-sans">Total Rounds</p>
              <p className="text-[10px] text-slate-500 font-mono">MATCH_CYCLE_COUNT</p>
            </div>
          </div>
          <select
            value={totalRounds} // Read directly from store
            onChange={handleSettingChange("totalRounds")}
            disabled={!isAdmin}
            className="bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-purple-400 px-3 py-1.5 rounded-lg focus:outline-none focus:border-purple-500 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {[1,3, 5, 7, 10].map((num) => (
              <option key={num} value={num}>{num} Rounds</option>
            ))}
          </select>
        </div>

        {/* Guess Time Limit Selector */}
        <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl hover:border-amber-500/30 transition">
          <div className="flex items-center space-x-3">
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">⏱️</span>
            <div>
              <p className="text-xs font-bold text-slate-300 font-sans">Guess Time</p>
              <p className="text-[10px] text-slate-500 font-mono">ROUND_TICK_DURATION</p>
            </div>
          </div>
          <select
            value={guessTime} // Read directly from store
            onChange={handleSettingChange("guessTime")}
            disabled={!isAdmin}
            className="bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-amber-400 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {[15, 20, 30, 45, 60, 80].map((sec) => (
              <option key={sec} value={sec}>{sec} Seconds</option>
            ))}
          </select>
        </div>

        {/* Images per Round Selector */}
        <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl hover:border-rose-500/30 transition">
          <div className="flex items-center space-x-3">
            <span className="text-xl filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">🖼️</span>
            <div>
              <p className="text-xs font-bold text-slate-300 font-sans">Images Per Round</p>
              <p className="text-[10px] text-slate-500 font-mono">TARGET_VECTOR_POOL</p>
            </div>
          </div>
          <select
            value={imagesInOneRound} // Read directly from store
            onChange={handleSettingChange("imagesInOneRound")}
            disabled={!isAdmin}
            className="bg-slate-900 border border-slate-800 font-mono font-bold text-xs text-rose-400 px-3 py-1.5 rounded-lg focus:outline-none focus:border-rose-500 transition disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {[1,3, 5, 8, 10, 12].map((num) => (
              <option key={num} value={num}>{num} Characters</option>
            ))}
          </select>
        </div>

      </div>

      {/* Host Control Actions Gateway */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col items-center justify-center">
        {isAdmin ? (
          <button
            onClick={handleStartGame}
            className="w-full max-w-sm py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/10 active:scale-[0.98] cursor-pointer relative group overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:animate-shine" />
            ⚔️ Initiate Match Sequence ⚔️
          </button>
        ) : (
          <div className="flex items-center space-x-2.5 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl max-w-xs text-center animate-pulse">
            <span className="text-slate-500 text-xs font-mono font-bold">📡</span>
            <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-tight">
              Awaiting transmission from lobby host...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbyRoomConfig;