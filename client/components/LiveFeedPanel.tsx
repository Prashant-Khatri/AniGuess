'use client'
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";
import React, { useEffect } from "react";

export interface FeedMessage {
  id: string;
  userName: string;
  guesss: string;
}

export interface FeedMessageData {
  userName: string;
  systemMsg: boolean;
  message: string;
}

export default function LiveFeedPanel() {
  const feedMessagesCollection = useGameStore((state) => state.feedMessagesCollection);
  const status = useGameStore((state) => state.status);
  const setFeedMessagesCollection = useGameStore((state) => state.setFeedMessagesCollection);
  const { feedMessageListener } = useSocketListener(socket);

  useEffect(() => {
    const cleanFeedMessage = feedMessageListener();
    return () => {
      if (cleanFeedMessage) cleanFeedMessage();
    };
  }, []);

  useEffect(() => {
    if (status === 'ended' || status === 'intermission') {
      setFeedMessagesCollection([]);
    }
  }, [status, setFeedMessagesCollection]);

  const isFeedActive = status === 'playing' || status === 'lobby';

  return (
    <div className="w-full h-full bg-white border-4 border-slate-950 rounded-2xl p-2 sm:p-3 flex flex-col relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] select-none group">
      <div className="mb-2 pl-1.5 flex items-center justify-between border-b-2 border-slate-950 pb-1.5 flex-shrink-0">
        <h3 className="text-[10px] sm:text-xs uppercase font-mono font-black tracking-wider text-slate-950 flex items-center gap-1">
          Transmissions
        </h3>
        {status === 'playing' && (
          <span className="flex h-2 w-2 relative mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
        )}
      </div>
      {!isFeedActive ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl">
          <span className="text-xl mb-1 filter grayscale">🛸</span>
          <span className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-wider">
            {status === 'intermission' ? 'Feed Paused' : 'Terminal Halted'}
          </span>
        </div>
      ) : feedMessagesCollection.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            Awaiting Speculations...
          </span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-start gap-1.5 overflow-hidden pl-1.5 pr-1.5 min-h-0">
          {feedMessagesCollection.map((msg) => {
            const isSystem = msg.userName === 'SYSTEM';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-1.5 px-2 py-1.5 rounded-xl border-2 border-slate-950 bg-white relative overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${isSystem ? "bg-amber-50/60 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]" : "hover:bg-slate-50"}`}
              >
                {isSystem && (
                  <div className="absolute left-0 top-0 w-[3px] h-full bg-amber-500" />
                )}
                <span className={`font-mono font-black select-none text-[10px] ${isSystem ? 'text-amber-600' : 'text-rose-600'}`}>
                  ❯
                </span>
                <div className="font-mono text-[10px] sm:text-xs leading-normal min-w-0 break-words flex-1">
                  {isSystem ? (
                    <>
                      <span className="font-mono font-black text-[7px] tracking-wider bg-amber-500 text-white border border-slate-950 px-1 py-0.5 rounded-sm uppercase mr-1.5 select-none">
                        {msg.userName}
                      </span>
                      <span className="text-amber-900 tracking-tight font-sans font-medium">
                        {msg.guesss}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-slate-950 uppercase tracking-tight mr-1.5 border-r border-slate-300 pr-1.5">
                        {msg.userName}
                      </span>
                      <span className="text-slate-700 tracking-normal font-sans">
                        {msg.guesss}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}