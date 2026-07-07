'use client'
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

interface LiveFeedPanelProps {
  status: string; // "lobby" | "playing" | "intermission" | "ended"
}

export default function LiveFeedPanel() {
  // const [feedMessagesCollection, setFeedMessagesCollection] = useState<FeedMessage[]>([]);
  const {feedMessagesCollection,status,setFeedMessagesCollection}=useGameStore()
  const {feedMessageListener}=useSocketListener(socket)

  useEffect(() => {
    feedMessageListener()
  }, []);

  // Automatically reset the stream logs whenever a new round starts or returns to lobby
  useEffect(() => {
    if (status !== 'playing') {
      setFeedMessagesCollection([]);
    }
  }, [status]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col backdrop-blur-md shadow-xl min-h-[380px] max-h-[420px] relative overflow-hidden group">
      
      {/* Decorative Matrix Accent Line */}
      <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Panel Header */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h3 className="text-xs uppercase font-mono font-black tracking-widest text-slate-400 flex items-center gap-1.5">
          📡 Decoded Transmissions
        </h3>
        {status === 'playing' && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </div>

      {/* Dynamic Conditional Feed Viewport */}
      {status !== 'playing' ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/50 rounded-xl bg-slate-950/20">
          <span className="text-lg mb-1 opacity-40 filter grayscale">🛸</span>
          <span className="font-mono text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {status === 'lobby' ? 'Lobby Link Offline' : status === 'intermission' ? 'Feed Paused for Intermission' : 'Terminal Matrix Halted'}
          </span>
        </div>
      ) : feedMessagesCollection.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <span className="font-mono text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">
            Awaiting Speculation Waves...
          </span>
        </div>
      ) : (
        /* Message Stream Grid Viewport */
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800 flex flex-col">
          {feedMessagesCollection.map((msg) => (
            <div 
              key={msg.id} 
              className="flex items-start gap-2 bg-slate-950/30 border border-slate-900 px-3 py-2.5 rounded-xl hover:border-slate-800 transition-colors animate-fade-in"
            >
              <span className="font-mono text-indigo-500 font-bold select-none text-xs">❯</span>
              <div className="font-mono text-xs leading-relaxed min-w-0 break-words">
                <span className="font-black text-slate-400 uppercase tracking-tight mr-2 border-r border-slate-800 pr-2">
                  {msg.userName}
                </span>
                <span className="text-slate-200 tracking-normal font-sans">{msg.guesss}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}