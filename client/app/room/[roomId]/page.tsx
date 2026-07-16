'use client'
import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameHandler } from "@/hooks/useGameHandler";
import { useSocketListener } from "@/hooks/useSocketListener";
import { useGameStore } from "@/store/game.store";
import { RefreshLoader } from "@/components/RefreshLoader";
import { socket } from "@/lib/socket";
import IntermissionOverlay from "@/components/IntermissionOverlay";
import EndGameOverlay from "@/components/EndGameOverlay";
import GameScreen from "@/components/GameScreen";

export interface IntermissionData {
  correctAnswer: string;
  animeName: string;
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
    hasReadiedUp: boolean;
  }[];
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = useMemo(() => {
    return typeof params?.roomId === 'string' ? params.roomId.toUpperCase() : "";
  }, [params?.roomId]);
  const status = useGameStore((state) => state.status);
  const isRefreshing = useGameStore((state) => state.isRefreshing);
  const isValidating = useGameStore((state) => state.isValidating);
  const verifyEntry = useGameStore((state) => state.verifyEntry);
  const getAdminIdandAvatar = useGameStore((state) => state.getAdminIdandAvatar);
  const endGameData = useGameStore((state) => state.endGameData);
  const { reJoinRoom } = useGameHandler(socket);
  const listeners = useSocketListener(socket);
  const listenersRef = useRef(listeners);
  useEffect(() => {
    listenersRef.current = listeners;
  }, [listeners]);
  useEffect(() => {
    const userId = localStorage.getItem('game_user_id');
    if (!userId || !roomId) return;
    verifyEntry(roomId, userId, router);
    getAdminIdandAvatar(roomId);
    const handleSafeRejoin = () => {
      reJoinRoom(roomId);
    };
    if (socket.connected) {
      handleSafeRejoin();
    } else {
      socket.once("connect", handleSafeRejoin);
    }
    return () => {
      socket.off("connect", handleSafeRejoin);
    };
  }, [roomId, verifyEntry, getAdminIdandAvatar, reJoinRoom, router]);
  useEffect(() => {
    const activeListeners = listenersRef.current;
    const cleanups = [
      activeListeners.gameErrorListener(),
      activeListeners.kickedFromRoomListener(),
      activeListeners.roundInitListener(),
      activeListeners.gameStartedListener(),
      activeListeners.roundIntermissionStartListener(),
      activeListeners.gameEndedListener(),
      activeListeners.playerJoined(),
      activeListeners.playAgainSuccessListener(),
      activeListeners.playAgainToggleSuccessListener(),
      activeListeners.playerLeavedListener(),
      activeListeners.roomDisbandedListener(),
      activeListeners.reJoinSuccessListener(),
      activeListeners.endedDataSyncedListener(),
      activeListeners.intermissionDataSyncedListener(),
      activeListeners.playerOfflineListener(),
      activeListeners.playerRejoinListener(),
      activeListeners.disconnectListener(),
      activeListeners.connectListener(),
      activeListeners.setIsRefreshingListener()
    ];
    return () => {
      cleanups.forEach(cleanup => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, [roomId]);
  if (isValidating) {
    return <RefreshLoader message="Verifying Identity Clearance Matrix..." />;
  }
  return (
    <main className="h-screen w-full bg-slate-50 text-slate-900 px-2 py-2 sm:p-4 flex flex-col antialiased relative overflow-hidden select-none font-sans selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
      {isRefreshing && <RefreshLoader />}
      <div className="relative flex-1 flex flex-col min-h-0 w-full z-10">
        <GameScreen roomId={roomId}/>
      </div>
      {status === 'intermission' && <IntermissionOverlay />}
      {status === 'ended' && endGameData && <EndGameOverlay roomId={roomId}/>}
    </main>
  );
}