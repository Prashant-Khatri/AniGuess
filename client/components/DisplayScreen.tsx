'use client'
import { socket } from "@/lib/socket";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export interface IPlayers {
    userName : string;
    socketId : string;
    avatarId : number;
    score : number;
    turnScore : number;
    hasGuessed : boolean;
    isOnline : boolean;
    isAdmin : boolean
}

interface DisplayScreenProps {
  status: string;   // "lobby", "playing", "intermission", "ended"
  isAdmin: boolean; // Determines if the current user is the host
}

export default function DisplayScreen({ status, isAdmin }: DisplayScreenProps) {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId.toUpperCase() : "";

  const [round, setRound] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hint1, setHint1] = useState<string>("");
  const [hint2, setHint2] = useState<string>("");

  useEffect(() => {
    socket.on('round_init', (data: {
      currentRound: number,
      currentTurn: number,
      imageUrl: string,
      timerEndsAt: number,
      players: IPlayers[]
    }) => {
      const { currentRound, imageUrl } = data;
      setRound(currentRound);
      setImageUrl(imageUrl);
      // Clear old hints for the new round
      setHint1("");
      setHint2("");
    });

    socket.on('hint_reveal', (data: {
      id: number,
      hint: string
    }) => {
      const { id, hint } = data;
      if (id === 1) setHint1(hint);
      if (id === 2) setHint2(hint);
    });

    return () => {
      socket.off('round_init');
      socket.off('hint_reveal');
    };
  }, []);

  const handleStartGame = () => {
    if (!roomId) return;
    socket.emit("start_game", { roomId });
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden group">
      
      {/* Dynamic Grid Background Layer (Visible during active gameplay) */}
      {status === 'playing' && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none transition-opacity duration-1000 animate-pulse"
          style={{ backgroundImage: `url('https://i.pinimg.com/736x/1a/30/fc/1a30fc8b941014520ab470cbb178685c.jpg')` }}
        />
      )}

      {/* ==========================================
          LOBBY TERMINAL VIEW
         ========================================== */}
      {status === 'lobby' && (
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6 z-10 animate-fade-in">
          {/* Cyberpunk/Anime Standby Frame */}
          <div className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-slate-950/80 p-2 flex items-center justify-center shadow-2xl overflow-hidden group/lobby">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 to-transparent z-10" />
            <img 
              src="https://i.pinimg.com/736x/1a/30/fc/1a30fc8b941014520ab470cbb178685c.jpg" 
              alt="Lobby Standby Asset" 
              className="w-full h-full object-cover rounded-xl opacity-60 transition-transform duration-700 group-hover/lobby:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <span className="font-mono text-[10px] font-black tracking-widest text-indigo-400 bg-slate-950/90 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-lg animate-pulse">
                TERMINAL IDLE
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-mono font-black tracking-widest text-slate-400 uppercase">
              Awaiting Synchronization
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              {isAdmin 
                ? "All systems operational. Initialize the socket array when the network lobby roster is complete." 
                : "Waiting for the Lobby Admiral to broadcast the match ignition packet."
              }
            </p>
          </div>

          {/* Conditional Operational Ignition Trigger */}
          {isAdmin ? (
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-slate-950 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 transform active:scale-[0.98] shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
            >
              ⚡ ENGAGE ARENA TERMINAL ⚡
            </button>
          ) : (
            <div className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] font-bold text-slate-500 tracking-wider animate-pulse uppercase">
              ⏳ STANDBY — HOST CONTROLLING PACKET TRANSMISSION
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          ACTIVE PLAYING ARENA LOOP VIEW
         ========================================== */}
      {status === 'playing' && (
        <div className="w-full flex flex-col items-center z-10">
          
          {/* Top Floating Utility Round Stats Banner */}
          <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-mono font-black text-indigo-400 tracking-widest">
            ROUND 0{round}
          </div>
          <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-md text-[10px] font-mono font-black text-orange-400 tracking-widest animate-pulse">
            ⚡ SCANNING VECTOR...
          </div>

          {/* Primary Guess Target Canvas Frame with constant organic zooming loop */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl shadow-black/80">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Target Identity" 
                className="w-full h-full object-cover blur-lg saturate-50 brightness-75 animate-anime-zoom" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-950 animate-pulse">
                <span className="font-mono text-xs text-slate-600 uppercase tracking-widest">Awaiting Vector...</span>
              </div>
            )}
            <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
          </div>

          {/* Smooth Sliding Clue Matrix Deck */}
          <div className="mt-6 w-full max-w-md space-y-2">
            {/* Clue Node 1 */}
            <div className={`p-3 rounded-xl border font-mono text-xs tracking-wide transition-all duration-500 transform
              ${hint1 
                ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300 opacity-100 translate-y-0 shadow-md shadow-indigo-500/5' 
                : 'bg-slate-950/40 border-slate-900 border-dashed text-slate-600 text-center opacity-50 -translate-y-1'
              }`}
            >
              {hint1 ? `✦ CLUE ALPHA: ${hint1}` : '🔒 CLUE ALPHA DECRYPTING...'}
            </div>

            {/* Clue Node 2 */}
            <div className={`p-3 rounded-xl border font-mono text-xs tracking-wide transition-all duration-500 transform delay-75
              ${hint2 
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 opacity-100 translate-y-0 shadow-md shadow-amber-500/5' 
                : 'bg-slate-950/40 border-slate-900 border-dashed text-slate-600 text-center opacity-50 -translate-y-1'
              }`}
            >
              {hint2 ? `✦ CLUE BETA: ${hint2}` : '🔒 CLUE BETA DECRYPTING...'}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}