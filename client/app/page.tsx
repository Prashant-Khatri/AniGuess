'use client'
import React, { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSocketListener } from "@/hooks/useSocketListener";
import { socket } from "@/lib/socket";
const CreateRoomForm = dynamic(() => import("@/components/CreateRoomForm"), { ssr: false });
const JoinRoomForm = dynamic(() => import("@/components/JoinRoomForm"), { ssr: false });
const ShowcaseSidebar = React.memo(() => {
  return (
    <div className="relative md:col-span-5 bg-slate-950 min-h-[320px] sm:min-h-[400px] md:min-h-full overflow-hidden flex flex-col justify-end p-6 border-b md:border-b-0 md:border-r border-slate-800 group">
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 opacity-60 z-0">
        <Image
          src="https://i.pinimg.com/736x/1a/30/fc/1a30fc8b941014520ab470cbb178685c.jpg"
          alt="Anime Artwork Banner"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10 pointer-events-none" />
      <div className="relative z-20 space-y-2">
        <span className="text-[10px] uppercase tracking-widest font-extrabold bg-indigo-500 text-white px-2 py-0.5 rounded-md shadow-sm w-max block">
          v1.0.0 Live
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow">
          Ani<span className="text-indigo-400">Guess</span> Arena
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          Test your otaku intuition. Create a private tactical terminal or challenge players across active server networks instantly.
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
    <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[600px]">
        <ShowcaseSidebar />
        <div className="md:col-span-7 flex flex-col p-6 md:p-10 justify-center">
          <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 mb-8 max-w-md mx-auto w-full">
            <button
              onClick={() => handleTabChange('create')}
              className={`py-2.5 px-4 font-bold text-sm rounded-lg tracking-wide uppercase transition-all duration-200
                ${activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }
              `}
            >
              ❖ Create Room
            </button>
            <button
              onClick={() => handleTabChange('join')}
              className={`py-2.5 px-4 font-bold text-sm rounded-lg tracking-wide uppercase transition-all duration-200
                ${activeTab === 'join'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }
              `}
            >
              ✦ Join Match
            </button>
          </div>
          <div className="w-full max-w-md mx-auto bg-slate-900/40 border border-slate-800/40 p-6 rounded-2xl shadow-inner min-h-[420px] flex flex-col justify-center animate-fade-in">
            {activeTab === 'create' ? (
              <div>
                <div className="mb-4 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">Setup Room Matrix</h3>
                  <p className="text-xs text-slate-500">Configure round conditions and claim your initial avatar profile.</p>
                </div>
                <CreateRoomForm />
              </div>
            ) : (
              <div>
                <div className="mb-4 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">Infiltrate Lobby</h3>
                  <p className="text-xs text-slate-500">Enter a 6-character broadcast vector token to sync up roster slots.</p>
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