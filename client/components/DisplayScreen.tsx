'use client'
import { socket } from "@/lib/socket";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useSocketListener } from "@/hooks/useSocketListener";
import { useGameStore } from "@/store/game.store";
import LobbyRoomConfig from "./LobbyRoomConfig";

export interface IPlayers {
  userName: string;
  socketId: string;
  avatarId: number;
  score: number;
  turnScore: number;
  hasGuessed: boolean;
  isOnline: boolean;
  isAdmin: boolean
}

interface DisplayScreenProps {
  status: string;   // "lobby", "playing", "intermission", "ended"
  isAdmin: boolean; // Determines if the current user is the host
}

export default function DisplayScreen() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId.toUpperCase() : "";
  const { round, imageUrl, hint1, hint2, isAdmin, status } = useGameStore()

  // const [round, setRound] = useState<number>(1);
  // const [imageUrl, setImageUrl] = useState<string>("");
  // const [hint1, setHint1] = useState<string>("");
  // const [hint2, setHint2] = useState<string>("");

  const { startGame } = useGameHandler(socket)
  const { roundInitListener, hintRevealListener } = useSocketListener(socket)

  useEffect(() => {
    // Bind the hint reveal listener and capture its cleanup function
    const cleanHintReveal = hintRevealListener();

    // Strip the listener on unmount to prevent double updates
    return () => {
      if (cleanHintReveal) cleanHintReveal();
    };
  }, []); // Secure empty array ensures this binds exactly once on mount

  const handleStartGame = () => {
    if (!roomId) return;
    startGame(roomId)
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden group">

      {/* Dynamic Grid Background Layer (Visible during active gameplay) */}
      {status === 'playing' && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none transition-opacity duration-1000 animate-pulse"
          style={{ backgroundImage: `url('https://i.pinimg.com/736x/62/dc/4f/62dc4f10cee9cccab5588d311195569e.jpg')` }}
        />
      )}

      {/* ==========================================
          LOBBY TERMINAL VIEW
         ========================================== */}
      {status === 'lobby' && (
        <LobbyRoomConfig roomId={roomId}/>
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
                className="w-full h-full object-cover blur-xs saturate-50 brightness-75 animate-anime-zoom"
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