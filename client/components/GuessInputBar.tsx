'use client'
import { useGameHandler } from "@/hooks/useGameHandler";
import { socket } from "@/lib/socket";
import React, { useState, useRef, useEffect } from "react";

interface GuessInputBarProps {
  roomId: string;
}

export default function GuessInputBar({ roomId }: GuessInputBarProps) {
  const [guessText, setGuessText] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const { submitGuess } = useGameHandler(socket);
  const inputRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      userIdRef.current = localStorage.getItem('game_user_id');
    }
  }, []);
  const dispatchGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessText.trim() || isPending) return;
    setIsPending(true);
    submitGuess(roomId, userIdRef.current, guessText);
    setGuessText('');
    inputRef.current?.focus();
    setTimeout(() => {
      setIsPending(false);
      inputRef.current?.focus();
    }, 400);
  };
  return (
    <div className="w-full bg-white border-4 border-slate-950 rounded-2xl p-1.5 sm:p-2 relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex-shrink-0 select-none">
      <form onSubmit={dispatchGuess} className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3 font-mono text-rose-600 text-xs font-black select-none animate-pulse">
            ❯
          </span>
          <input
            ref={inputRef}
            type="text"
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            placeholder={isPending ? "TRANSMITTING..." : "GUESS CHARACTER..."}
            className="w-full bg-slate-50 border-2 border-slate-950 focus:bg-rose-50 rounded-lg pl-7 pr-12 py-1.5 sm:py-2 font-mono text-xs text-slate-950 placeholder-slate-400 outline-none transition-all uppercase tracking-wider font-black"
          />
          {guessText && !isPending && (
            <button
              type="button"
              onClick={() => {
                setGuessText('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 text-slate-950 hover:bg-rose-50 text-[8px] font-mono px-1 py-0.5 rounded border border-slate-950 bg-white font-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
            >
              ESC
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!guessText.trim() || isPending}
          className="px-4 py-1.5 sm:py-2 font-mono text-xs font-black uppercase tracking-wider text-white rounded-lg bg-rose-600 hover:bg-rose-500 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer flex-shrink-0"
        >
          {isPending ? "..." : "LAUNCH"}
        </button>
      </form>
    </div>
  );
}