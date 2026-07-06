'use client'
import CreateRoomForm from "@/components/CreateRoomForm";
import JoinRoomForm from "@/components/JoinRoomForm";
import { socket } from "@/lib/socket";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  //homepage
  //two form (create,join)
  //socket emit createRoom,joinRoom
  useEffect(() => {
    console.log('🔄 Initializing Socket Gateway on Home Page...');

    const onConnect = () => {
      console.log("🟢 Connected to backend! My ID is:", socket.id);
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected from backend server.");
    };

    // 1. Attach listeners BEFORE invoking the connection call
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // 2. Safely trigger connection manually if it hasn't connected yet
    if (!socket.connected) {
      socket.connect();
    } else {
      // If it's already connected (due to a hot-reload), run the log immediately
      onConnect();
    }

    // 3. CLEANUP: Strip listeners when transitioning pages to avoid multi-print stacking
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // NOTE: We do NOT call socket.disconnect() here so that the socket connection
      // stays alive as the user moves from the home page to the dynamic game room page!
    };
  }, []);

  return (
    <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">

      {/* Dynamic Background Neon Glow Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Arena Wrapper */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[600px]">

        {/* LEFT COLUMN: Visual Anime Art Showcase (5 Columns Wide) */}
        <div className="relative md:col-span-5 bg-slate-950 min-h-[320px] sm:min-h-[400px] md:min-h-full overflow-hidden flex flex-col justify-end p-6 border-b md:border-b-0 md:border-r border-slate-800 group">

          {/* Fully Responsive & Optimized Next.js Image Element Tag */}
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
          
          {/* Top Gradient Linear Overlay Filter Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10 pointer-events-none" />

          {/* Typography Overlays */}
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

        {/* RIGHT COLUMN: Interactive Control Operations (7 Columns Wide) */}
        <div className="md:col-span-7 flex flex-col p-6 md:p-10 justify-center">

          {/* Custom Dual-Option UI Tab Toggle Switch */}
          <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 mb-8 max-w-md mx-auto w-full">
            <button
              onClick={() => setActiveTab('create')}
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
              onClick={() => setActiveTab('join')}
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

          {/* Form Dynamic Mounting Window Container */}
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