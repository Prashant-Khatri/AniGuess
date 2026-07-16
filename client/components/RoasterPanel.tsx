'use client'
import React, { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useGameStore } from "@/store/game.store";
import { useSocketListener } from "@/hooks/useSocketListener";
import { AVATARS } from "@/lib/avatar";

interface RosterPanelProps {
  roomId: string;
}

export default function RoasterPanel({ roomId }: RosterPanelProps) {
  const isAdmin = useGameStore((state) => state.isAdmin);
  const status = useGameStore((state) => state.status);
  const players = useGameStore((state) => state.players);
  const { roomStateUpdateListener } = useSocketListener(socket);
  const { handleKickAction, requestRoomData } = useGameHandler(socket);
  useEffect(() => {
    if (!roomId) return;
    const cleanRoomStateUpdate = roomStateUpdateListener();
    requestRoomData(roomId);
    return () => {
      if (cleanRoomStateUpdate) cleanRoomStateUpdate();
    };
  }, [roomId]);
  const connectedCount = players.filter(p => p.isOnline).length;
  return (
    <div className="w-full h-full bg-white border-4 border-slate-950 rounded-2xl p-2 sm:p-3 flex flex-col relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] min-h-[340px] max-h-[400px] select-none group">
      <div className={`absolute top-0 left-0 w-[4px] h-full transition-colors duration-500
    ${status === 'lobby' ? 'bg-slate-950' : status === 'playing' ? 'bg-rose-600' : 'bg-amber-500'}`}
      />
      <div className="mb-2 pl-1.5 flex items-center justify-between border-b-2 border-slate-950 pb-1.5 flex-shrink-0">
        <h3 className="text-[10px] sm:text-xs uppercase font-mono font-black tracking-wider text-slate-950 flex items-center gap-1">
          Roster<span className="text-[9px] text-slate-500 font-bold">({connectedCount}/{players.length})</span>
        </h3>
        <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1.5 py-0.5 rounded border-2 border-slate-950 uppercase tracking-tight
      ${status === 'lobby' ? 'bg-slate-100 text-slate-800' :
            status === 'playing' ? 'bg-rose-50 text-rose-600 animate-pulse' :
              'bg-amber-50 text-amber-600'}`}
        >
          {status}
        </span>
      </div>
      <div className="space-y-1.5 overflow-y-auto flex-1 pl-1.5 pr-0.5 custom-scrollbar min-h-0">
        {players.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center py-10">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">Syncing Network...</span>
          </div>
        ) : (
          players.map((player) => {
            const isMe = player.socketId === socket.id;

            return (
              <div
                key={player.socketId}
                className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border-2 border-slate-950 transition-all duration-300 bg-white group/player shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${player.hasGuessed && status === 'playing' ? 'bg-rose-50/50 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)]' : ''}
              ${!player.isOnline ? 'opacity-40 filter grayscale' : 'opacity-100'}`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 border-slate-950 overflow-hidden bg-white flex-shrink-0">
                    <img
                      src={AVATARS[player.avatarId - 1].imageUrl}
                      alt={player.userName}
                      className="object-cover w-full h-full"
                    />
                    {player.hasGuessed && status === 'playing' && (
                      <div className="absolute inset-0 bg-rose-600/20 backdrop-blur-[0.5px] flex items-center justify-center text-rose-600 font-black text-xs font-mono">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`font-mono font-black text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[110px] uppercase tracking-wide ${isMe ? 'text-rose-600' : 'text-slate-950'}`}>
                        {player.userName}
                      </span>
                      {player.isAdmin && (
                        <span className="text-[7px] font-mono font-black bg-slate-950 text-white px-1 rounded-sm">HOST</span>
                      )}
                      {isMe && !player.isAdmin && (
                        <span className="text-[7px] font-mono font-black bg-rose-100 border border-rose-400 text-rose-600 px-1 rounded-sm">YOU</span>
                      )}
                    </div>

                    {status !== 'lobby' ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono font-black text-slate-600 tracking-tight">
                          🪙 {player.score} XP
                        </span>
                        {status === 'intermission' && player.turnScore > 0 && (
                          <span className="text-[8px] font-mono font-black text-rose-600">
                            +{player.turnScore}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        {player.isOnline ? "🟢 Online" : "🔴 Offline"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {status === 'playing' && (
                    <span className={`text-[7px] sm:text-[8px] uppercase font-mono font-black tracking-wider px-1.5 py-0.5 border-2 border-slate-950 rounded transition-colors
                  ${player.hasGuessed
                        ? 'bg-rose-600 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-slate-400 animate-pulse'
                      }`}
                    >
                      {player.hasGuessed ? 'READY' : 'WAIT'}
                    </span>
                  )}
                  {isAdmin && !isMe && (
                    <button
                      onClick={() => handleKickAction(roomId, player.socketId)}
                      className="p-1 text-red-600 hover:text-white bg-transparent hover:bg-red-600 rounded border-2 border-transparent hover:border-slate-950 transition-all duration-150 opacity-100 min-[500px]:opacity-0 group-hover/player:opacity-100 cursor-pointer text-[10px] leading-none"
                      title="Kick Player"
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