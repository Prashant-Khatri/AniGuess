'use client'
import { socket } from "@/lib/socket";
import React, { useState } from "react";

interface GuessInputBarProps {
  roomId: string;
}

export default function GuessInputBar({ roomId }: GuessInputBarProps) {
  const [guessText, setGuessText] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  // Safely extract identifying client handle tokens from localStorage context lines
  const userId = typeof window !== 'undefined' ? localStorage.getItem('game_user_id') : null;

  const dispatchGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessText.trim() || isPending) return;

    setIsPending(true);

    // Dispatches standard data packets down into handlePlayerGuess in game.controllers.ts
    socket.emit('submit_guess', {
      roomId,
      userId, 
      guess: guessText.trim()
    });

    // Wipe text field buffer cleanly
    setGuessText('');

    // Release locking mechanism after a short interface tick delay
    setTimeout(() => setIsPending(false), 400);
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-3 backdrop-blur-md shadow-xl relative overflow-hidden group">
      {/* Decorative Bottom Cyber Accent Glow Strip */}
      <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <form onSubmit={dispatchGuess} className="flex items-center gap-2.5">
        <div className="relative flex-1 flex items-center">
          {/* Prefix Input Command Terminal Indicator Icon */}
          <span className="absolute left-4 font-mono text-indigo-400 text-sm font-black select-none animate-pulse">
            ❯
          </span>

          <input
            type="text"
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "TRANSMITTING VECTOR DATA..." : "TYPE CHARACTER IDENTITY GUESS..."}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl pl-9 pr-4 py-3.5 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none transition-all duration-200 uppercase tracking-wider shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Quick Clear Indicator Line Utility (Visible when input has values text strings) */}
          {guessText && !isPending && (
            <button
              type="button"
              onClick={() => setGuessText('')}
              className="absolute right-3 text-slate-600 hover:text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
            >
              ESC
            </button>
          )}
        </div>

        {/* Submit Decryption Ignition Button Trigger */}
        <button
          type="submit"
          disabled={!guessText.trim() || isPending}
          className="px-6 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-slate-950 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 shadow-md hover:shadow-indigo-500/10 transition-all duration-200 transform active:scale-[0.97] disabled:opacity-20 disabled:filter disabled:grayscale disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {isPending ? "📡 ..." : "LAUNCH ⚡"}
        </button>
      </form>
    </div>
  );
}