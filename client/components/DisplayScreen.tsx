'use client'
import { socket } from "@/lib/socket";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
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
  isAdmin: boolean;
  hasReadiedUp: boolean
}

export default function DisplayScreen() {
  const params = useParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId.toUpperCase() : "";
  const round = useGameStore((state) => state.round);
  const imageUrl = useGameStore((state) => state.imageUrl);
  const hint1 = useGameStore((state) => state.hint1);
  const hint2 = useGameStore((state) => state.hint2);
  const status = useGameStore((state) => state.status);
  const { hintRevealListener } = useSocketListener(socket)

  useEffect(() => {
    const cleanHintReveal = hintRevealListener();
    return () => {
      if (cleanHintReveal) cleanHintReveal();
    };
  }, []);

  return (
    <div className="w-full h-full bg-white border-4 border-slate-950 rounded-2xl p-2.5 sm:p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center justify-center relative min-h-0 overflow-hidden select-none">
      {status === 'playing' && (
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dhdagkd03/image/upload/c_fill,g_auto,q_80/v1784294307/illusion-background_xe9jgr.png')` }}
        />
      )}
      {status === 'lobby' && (
        <div className="w-full h-full overflow-y-auto min-h-0 custom-scrollbar">
          <LobbyRoomConfig roomId={roomId} />
        </div>
      )}
      {status === 'playing' && (
        <div className="w-full h-full flex flex-col items-center justify-between z-10 min-h-0 space-y-2">
          <div className="w-full flex items-center justify-between flex-shrink-0">
            <span className="bg-slate-950 border-2 border-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black text-rose-500 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]">
              STAGE 0{round}
            </span>
            <span className="bg-rose-500 border-2 border-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black text-white uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-pulse">
              DISPEL THE ILLUSION...
            </span>
          </div>
          <div className="w-full text-center py-0.5 flex-shrink-0">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-2 border-slate-950 px-3 py-0.5 rounded-md inline-block shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              🎯 GUESS THE CHARACTER OR ANIME
            </span>
          </div>
          <div className="relative flex-1 max-h-[150px] sm:max-h-[220px] aspect-square rounded-xl border-4 border-slate-950 bg-rose-50/10 overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ring-2 ring-rose-500/20 ring-offset-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Target Identity"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 animate-pulse">
                <span className="text-xl mb-1 animate-spin duration-3000">🔴</span>
                <span className="font-mono text-[9px] text-rose-500 font-bold uppercase tracking-widest">
                  Casting Jutsu...
                </span>
              </div>
            )}
          </div>
          <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2 flex-shrink-0">
            <div className={`px-2.5 py-1.5 sm:py-2 rounded-xl border-2 font-mono text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
              ${hint1
                ? 'bg-rose-50 border-slate-950 text-rose-900 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]'
                : 'bg-slate-50 border-slate-300 text-slate-400 text-center border-dashed shadow-none'
              }`}
            >
              {hint1 ? `SCROLL I: ${hint1}` : 'SCROLL I SEALED'}
            </div>

            <div className={`px-2.5 py-1.5 sm:py-2 rounded-xl border-2 font-mono text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
              ${hint2
                ? 'bg-slate-950 border-slate-950 text-rose-400 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]'
                : 'bg-slate-50 border-slate-300 text-slate-400 text-center border-dashed shadow-none'
              }`}
            >
              {hint2 ? `SCROLL II: ${hint2}` : 'SCROLL II SEALED'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}