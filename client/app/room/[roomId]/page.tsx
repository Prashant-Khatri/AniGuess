'use client'
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import { AVATARS } from "@/lib/avatar";
import { socket } from "@/lib/socket";

// Component Registry Imports
import RoomHeader from "@/components/RoomHeader";
import DisplayScreen from "@/components/DisplayScreen";
import RoasterPanel from "@/components/RoasterPanel";
import LiveFeedPanel from "@/components/LiveFeedPanel";
import GuessInputBar from "@/components/GuessInputBar";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useSocketListener } from "@/hooks/useSocketListener";
import { useGameStore } from "@/store/game.store";

export interface IntermissionData {
  correctAnswer: string;
  alternateNames: string[];
  imageUrl: string;
  turnScores: {
    userId: string;
    userName: string;
    avatarId: number;
    pointsGained: number;
    totalScore: number;
  }[];
}

export interface EndGameData {
  finalLeaderboard: {
    userId: string;
    userName: string;
    avatarId: number;
    totalScore: number;
    rank: number;
  }[];
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  console.log(params)
  
  // Cleanly isolate Room Transmission Token from safe client parameters
  const roomId = typeof params?.roomId === 'string' ? params.roomId.toUpperCase() : "";
  console.log(roomId)
  
  // const currentSocketId = socket.id;
  const {
    hostName,
    avatarUrl,
    adminId,
    isAdmin,
    status,
    intermissionData,
    endGameData,
    showAnswerPhase,
    getAdminIdandAvatar
  }=useGameStore()
  // const [hostName, setHostName] = useState<string>("");
  // const [avatarUrl, setAvatarUrl] = useState<string>("");
  // const [adminId, setAdminId] = useState<string>("");
  // const [isAdmin, setIsAdmin] = useState<boolean>(false);
  // const [status, setStatus] = useState<string>("lobby"); // lobby, playing, intermission, ended

  // State payloads to power tactical overlay matrices
  // const [intermissionData, setIntermissionData] = useState<IntermissionData | null>(null);
  // const [endGameData, setEndGameData] = useState<EndGameData | null>(null);

  // Phase tracker inside intermission overlay (true = show answer card, false = show round scores)
  // const [showAnswerPhase, setShowAnswerPhase] = useState<boolean>(true);
  const {handleDisbandRoom,handleLeaveRoom,handlePlayAgain}=useGameHandler(socket)
  const {gameEndedListener,gameErrorListener,gameStartedListener,roundInitListener,roundIntermissionStartListener,kickedFromRoomListener}=useSocketListener(socket)

  useEffect(() => {
    if (!roomId) return;
    console.log("Room Id is : ",roomId)
    getAdminIdandAvatar(roomId);
  }, [roomId, socket.id]);

  useEffect(() => {
    gameErrorListener()
    kickedFromRoomListener()
    roundInitListener()
    gameStartedListener()
    roundIntermissionStartListener()
    gameEndedListener()
  }, [router]);

  // Host Action Control Handlers

  return (
    <main className="min-h-screen w-full bg-slate-950 p-3 sm:p-6 text-slate-100 flex flex-col space-y-4 font-sans antialiased relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Energy Rays */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none z-0" />

      {/* 1. Global Room Header Matrix Banner */}
      <RoomHeader roomId={roomId}/>

      {/* Main Form/Arena Controller Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start relative z-10">
        
        {/* Core Screen Frame & Action Dispatch Trackers */}
        <div className="lg:col-span-7 flex flex-col space-y-4 h-full justify-between">
          <DisplayScreen/>
          <GuessInputBar roomId={roomId} />
        </div>

        {/* Tactical Feeds & Leaderboard Registers */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
          <RoasterPanel roomId={roomId}/>
          <LiveFeedPanel/>
        </div>
      </div>

      {/* =========================================================
          INTERMISSION STATE OVERLAY: INTERCEPT INTERACTION MATRIX
         ========================================================= */}
      {status === 'intermission' && intermissionData && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-amber-500/10 text-center">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            {showAnswerPhase ? (
              <div className="space-y-5 animate-scale-up">
                <span className="text-[10px] uppercase font-black tracking-widest bg-amber-500/10 border border-amber-500/40 text-amber-400 px-3 py-1 rounded-md inline-block animate-pulse">
                  Transmission Decoded
                </span>
                
                <div className="relative w-56 h-56 mx-auto rounded-2xl border-4 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
                  <img src={intermissionData.imageUrl} alt="Decoded Target" className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500">Core Identity Match:</h3>
                  <h2 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 tracking-wide drop-shadow">
                    {intermissionData.correctAnswer}
                  </h2>
                </div>

                {intermissionData.alternateNames?.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-tight mb-1">Accepted Vector Aliases:</p>
                    <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                      {intermissionData.alternateNames.map((name, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-scale-up">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 px-3 py-1 rounded-md inline-block">
                    Turn Performance Standings
                  </span>
                  <h2 className="text-xl font-black uppercase text-white tracking-tight mt-2">Scoreboard Delta Vector</h2>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {intermissionData.turnScores?.map((player, index) => (
                    <div key={player.userId} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-black text-slate-600 text-sm">#{index + 1}</span>
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.avatarId}`} alt="" className="w-7 h-7 bg-slate-900 border border-slate-800 rounded-full" />
                        <span className="font-mono font-bold text-xs uppercase tracking-wide text-slate-200">{player.userName}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-black font-mono text-emerald-400 animate-pulse">+{player.pointsGained} XP</span>
                        <span className="text-[10px] font-mono text-slate-500">TOTAL: {player.totalScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          ENDED STATE OVERLAY: FINAL PODIUM LEADERBOARD MATRIX
         ========================================================= */}
      {status === 'ended' && endGameData && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-orange-500 via-indigo-500 to-violet-600" />
            
            <div className="text-center space-y-1.5 mb-6">
              <span className="text-[10px] uppercase font-black tracking-widest bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1 rounded-md inline-block shadow-md">
                Server Match Concluded
              </span>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase tracking-tight">
                Final Hall of Fame
              </h2>
            </div>

            {/* Main Score Standings Grid Block */}
            <div className="space-y-2 mb-6 max-h-[260px] overflow-y-auto pr-1">
              {endGameData.finalLeaderboard?.map((entry) => {
                const isPodium = entry.rank <= 3;
                return (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all
                      ${entry.rank === 1 ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5' : 'bg-slate-950/40 border-slate-900'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`font-mono font-black text-sm w-5 text-center ${entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {entry.rank === 1 ? '👑' : `${entry.rank}`}
                      </span>
                      <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${entry.avatarId}`} alt="" className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-full" />
                      <span className={`font-mono font-bold text-xs uppercase tracking-wide ${entry.rank === 1 ? 'text-amber-400 text-sm font-black' : 'text-slate-200'}`}>
                        {entry.userName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 border border-indigo-500/20 rounded-md">
                      {entry.totalScore} TOTAL PTS
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tactical Action Grid Operations Bar */}
            <div className="grid grid-cols-2 gap-2.5">
              {isAdmin ? (
                <>
                  <button 
                    onClick={()=>handlePlayAgain(roomId)}
                    className="py-3 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg hover:shadow-indigo-500/10 cursor-pointer active:scale-95"
                  >
                    ⚡ Rematch Vector ⚡
                  </button>
                  <button 
                    onClick={()=>handleDisbandRoom(roomId)}
                    className="py-3 bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
                  >
                    💥 Disband Terminal
                  </button>
                </>
              ) : (
                <button 
                  onClick={()=>handleLeaveRoom(roomId)}
                  className="col-span-2 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer active:scale-95"
                >
                  🚪 Disconnect From Lobby Vector
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}