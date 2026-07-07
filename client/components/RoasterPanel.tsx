'use client'
import React, { useEffect, useState } from "react";
import { IPlayers } from "./DisplayScreen";
import { socket } from "@/lib/socket";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useGameStore } from "@/store/game.store";
import { useSocketListener } from "@/hooks/useSocketListener";

interface RosterPanelProps {
  roomId: string;
  // currentSocketId: string;
  // isAdmin: boolean;
  // status: string; // "lobby" | "playing" | "intermission" | "ended"
}

export default function RosterPanel({ roomId}: RosterPanelProps) {
    console.log("GGGG")
  const {isAdmin,status,players}=useGameStore()
  const {roomStateUpdateListener}=useSocketListener(socket)
  // const [players, setPlayers] = useState<IPlayers[]>([]);
  const {handleKickAction,requestRoomData}=useGameHandler(socket)

  useEffect(() => {
    console.log("Andar use effect ke")
    roomStateUpdateListener()
    console.log("Kardiya emit")
    requestRoomData(roomId)
  }, []);

  // Compute total dynamic stats to show on the header strip
  const connectedCount = players.filter(p => p.isOnline).length;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-xl min-h-[380px] max-h-[420px] relative overflow-hidden group">
      
      {/* Decorative Left Neon Border Strip */}
      <div className={`absolute top-0 left-0 h-full w-[3px] transition-colors duration-500
        ${status === 'lobby' ? 'bg-indigo-500' : status === 'playing' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
      />

      {/* Roster Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h3 className="text-xs uppercase font-mono font-black tracking-widest text-slate-400 flex items-center gap-1.5">
          👥 Node Roster <span className="text-[10px] text-slate-500 font-normal">({connectedCount}/{players.length})</span>
        </h3>
        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider
          ${status === 'lobby' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
            status === 'playing' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' : 
            'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
        >
          {status} phase
        </span>
      </div>

      {/* Scrollable Player List Element Wrapper */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {players.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center py-12">
            <span className="text-xs font-mono text-slate-600 uppercase tracking-widest animate-pulse">Syncing Network Nodes...</span>
          </div>
        ) : (
          players.map((player) => {
            const isMe = player.socketId === socket.id;
            
            return (
              <div 
                key={player.socketId}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 relative bg-slate-950/40 group/player
                  ${player.hasGuessed && status === 'playing' ? 'border-emerald-500/30 shadow-md shadow-emerald-500/5 bg-emerald-950/5' : 'border-slate-900'}
                  ${!player.isOnline ? 'opacity-30 filter grayscale' : 'opacity-100'}`}
              >
                {/* Player Profile Info Segment */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative w-9 h-9 rounded-full border border-slate-800 overflow-hidden bg-slate-900 flex-shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarId}`} 
                      alt={player.userName} 
                      className="object-cover w-full h-full" 
                    />
                    {/* Active Gameplay Guess Success Confirmation Overlay */}
                    {player.hasGuessed && status === 'playing' && (
                      <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[0.5px] flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold text-xs truncate max-w-[120px] uppercase tracking-wide ${isMe ? 'text-indigo-400 font-black' : 'text-slate-200'}`}>
                        {player.userName}
                      </span>
                      {player.isAdmin && (
                        <span className="text-[8px] font-mono font-black bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1 rounded">HOST</span>
                      )}
                      {isMe && !player.isAdmin && (
                        <span className="text-[8px] font-mono font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1 rounded">YOU</span>
                      )}
                    </div>

                    {/* DYNAMIC SCENARIO PROPERTY RENDERING LINES */}
                    {status !== 'lobby' && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-black text-indigo-400 tracking-wider">
                          🪙 {player.score} XP
                        </span>
                        {status === 'intermission' && player.turnScore > 0 && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400">
                            +{player.turnScore}
                          </span>
                        )}
                      </div>
                    )}
                    {status === 'lobby' && (
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mt-0.5">
                        {player.isOnline ? "🟢 Operational" : "🔴 Disconnected"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Controls & Status Tags */}
                <div className="flex items-center space-x-2">
                  {/* Status Badges conditional display */}
                  {status === 'playing' && (
                    <span className={`text-[8px] uppercase font-mono font-black tracking-wider px-1.5 py-0.5 border rounded-md transition-colors
                      ${player.hasGuessed 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-slate-900 text-slate-600 border-slate-800 animate-pulse'
                      }`}
                    >
                      {player.hasGuessed ? 'LOCKED' : 'THINKING'}
                    </span>
                  )}

                  {/* Administrative Exclusion Kick Button (Shown exclusively to host, cant kick self) */}
                  {isAdmin && !isMe && (
                    <button
                      onClick={() => handleKickAction(roomId,player.socketId)}
                      className="p-1.5 text-red-400/50 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-200 md:opacity-0 group-hover/player:opacity-100 cursor-pointer"
                      title="Expatriate Member Node"
                    >
                      🚫
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}