'use client'
import React, { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
const CreateRoomForm = dynamic(() => import("@/components/CreateRoomForm"), { ssr: false });
const JoinRoomForm = dynamic(() => import("@/components/JoinRoomForm"), { ssr: false });
const ShowcaseSidebar = React.memo(() => {
  console.log("Socket is in home page : ",socket.id)
  return (
    <div className="relative md:col-span-5 bg-slate-950 min-h-[320px] sm:min-h-[400px] md:min-h-full overflow-hidden flex flex-col justify-end p-6 border-b md:border-b-0 md:border-r-4 border-slate-950 group">
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 opacity-50 z-0">
        <Image
          src="https://res.cloudinary.com/dhdagkd03/image/upload/v1784207313/itachi-home-image_exrvzt.png"
          alt="Itachi Artwork"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 pointer-events-none" />
      <div className="relative z-20 space-y-3 text-left">
        <span className="text-[9px] uppercase tracking-widest font-mono font-black bg-red-600 text-white border-2 border-slate-950 px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] w-max block animate-pulse">
          STATUS: READY
        </span>
        <h1 className="text-3.5xl font-mono font-black tracking-tighter text-white uppercase drop-shadow">
          Ani<span className="text-red-600">Guess</span> Arena
        </h1>
        <p className="text-xs font-mono font-bold text-slate-300 leading-relaxed max-w-xs">
          Test your anime knowledge. Create a private room to challenge your friends or join a lobby to play together instantly.
        </p>
      </div>
    </div>
  );
});
ShowcaseSidebar.displayName = "ShowcaseSidebar";
export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [, startTransition] = useTransition();
  const { connectListener, disconnectListener } = useSocketListener(socket);

  useEffect(() => {
    const cleanConnect = connectListener();
    const cleanDisconnect = disconnectListener();
    return () => {
      if (cleanConnect) cleanConnect();
      if (cleanDisconnect) cleanDisconnect();
    };
  }, []);
  const handleTabChange = (tab: 'create' | 'join') => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  return (
    <main className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-red-600 selection:text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_80%)] pointer-events-none" />
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-white border-4 border-slate-950 rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] min-h-[600px] z-10">
        <ShowcaseSidebar />
        <div className="md:col-span-7 flex flex-col p-6 md:p-10 justify-center bg-slate-50 relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 hidden md:block" />
          <div className="grid grid-cols-2 bg-white p-1.5 rounded-2xl border-4 border-slate-950 mb-8 max-w-md mx-auto w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => handleTabChange('create')}
              className={`py-2.5 px-4 font-mono font-black text-xs rounded-xl tracking-wider uppercase transition-all duration-150 cursor-pointer
            ${activeTab === 'create'
                  ? 'bg-red-600 text-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }
          `}
            >
              Create Room
            </button>
            <button
              onClick={() => handleTabChange('join')}
              className={`py-2.5 px-4 font-mono font-black text-xs rounded-xl tracking-wider uppercase transition-all duration-150 cursor-pointer
            ${activeTab === 'join'
                  ? 'bg-red-600 text-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }
          `}
            >
              Join Room
            </button>
          </div>
          <div className="w-full max-w-md mx-auto min-h-[420px] flex flex-col justify-center animate-fade-in">
            {activeTab === 'create' ? (
              <div className="space-y-4">
                <div className="mb-2 text-center md:text-left">
                  <h3 className="text-xl font-mono font-black text-slate-950 uppercase tracking-tight">Create a Lobby</h3>
                  <p className="text-xs font-mono font-bold text-slate-400 mt-1">Set up game parameters and choose your avatar profile.</p>
                </div>
                <CreateRoomForm />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-2 text-center md:text-left">
                  <h3 className="text-xl font-mono font-black text-slate-950 uppercase tracking-tight">Enter a Room</h3>
                  <p className="text-xs font-mono font-bold text-slate-400 mt-1">Provide a valid 6-letter room code to jump in and join the lobby.</p>
                </div>
                <JoinRoomForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}