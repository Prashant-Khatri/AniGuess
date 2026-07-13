import { toast } from 'react-hot-toast'; // or 'sonner' depending on your setup
import { Sparkles, Zap } from 'lucide-react'; // Or use emojis if preferred
import { WifiOff, AlertTriangle } from 'lucide-react';

export const SystemMessageToast = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-slate-950/90 border-2 border-dashed border-amber-500/40 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl shadow-amber-500/10 flex items-center space-x-3 pointer-events-auto font-mono text-xs`}
      >
        <span className="text-base text-amber-400 animate-pulse">⚡</span>
        <div className="flex-1 text-slate-200 tracking-wide leading-relaxed">
          <span className="text-amber-400 font-black uppercase tracking-widest mr-1">
            [SYSTEM]:
          </span>
          {message}
        </div>
      </div>
    ),
    { duration: 4000 }
  );
};

export const RoomCodeCopiedToast = () => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-xs bg-slate-950/90 border border-dashed border-indigo-500/40 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl shadow-indigo-500/10 flex items-center space-x-2.5 pointer-events-auto font-mono text-xs`}
    >
      <span className="text-indigo-400 animate-pulse">📋</span>
      <div className="text-slate-200 tracking-wide">
        <span className="text-indigo-400 font-black uppercase tracking-widest mr-1">[LINK]:</span>
        <span className="text-slate-200">Vector code synced to clipboard!</span>
      </div>
    </div>
  ), { duration: 3000 });
}

export const GameErrorToast = (message: string) => {
  toast.error(`❌ MATRIX EXCEPTION: ${message}`, {
    style: { background: '#0f172a', color: '#f43f5e', border: '1px solid #f43f5e30', fontFamily: 'monospace' }
  });
}

export const KickedFromRoomToast = () => {
  toast.error(`🚫 EXPATRIATED: You have been kicked.`, {
    style: { background: '#0f172a', color: '#ef4444', border: '1px solid #ef444430', fontFamily: 'monospace' }
  });
}

export const GameStartedToast = () => {
  toast.success("⚔️ THE GAME MATRIX HAS COMMENCED!", {
    style: { background: '#0f172a', color: '#10b981', border: '1px solid #10b98130', fontFamily: 'monospace' }
  });
}

/**
 * 🟢 ACCESS GRANTED: Successfully connected to the room gateway array.
 */
export const JoinSuccessToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 shadow-xl shadow-emerald-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Neon Indicator Accent Lines */}
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
      <div className="absolute top-0 right-0 w-[4px] h-[4px] rounded-full bg-emerald-400 animate-pulse m-1" />
      
      {/* Glowing Hexagonal/Status Core Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20 font-mono text-xs font-black">
        ⚡
      </div>
      
      {/* Text Context Frame */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
          System Handshake
        </p>
        <p className="text-xs font-bold text-slate-200 mt-0.5 tracking-wide">
          Lobby Connection Stabilized. <span className="text-emerald-400 font-mono font-black">INITIALIZED</span>
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * 🌌 MATRIX PROVISIONED: New game room channel generated in the core database layer.
 */
export const RoomCreatedToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 shadow-xl shadow-indigo-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Neon Indicator Accent Lines */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500" />
      <div className="absolute top-0 right-0 w-[4px] h-[4px] rounded-full bg-indigo-400 animate-pulse m-1" />
      
      {/* Glowing Hexagonal/Status Core Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/20 font-mono text-xs font-black">
        🔮
      </div>
      
      {/* Text Context Frame */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
          Domain Manifest
        </p>
        <p className="text-xs font-bold text-slate-200 mt-0.5 tracking-wide">
          Lobby Space Manifested. <span className="text-indigo-400 font-mono font-black">READY</span>
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * ❌ DECODE FATAL: Synchronization handshake rejected by server array matrix.
 */
export const JoinErrorToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/90 backdrop-blur-md border border-rose-500/40 shadow-xl shadow-rose-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Neon Indicator Accent Lines */}
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
      <div className="absolute top-0 right-0 w-[4px] h-[4px] rounded-full bg-rose-400 animate-ping m-1" />
      
      {/* Glowing Hexagonal/Status Core Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm shadow-rose-500/20 font-mono text-xs font-black">
        💥
      </div>
      
      {/* Text Context Frame */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-rose-500/70 font-black animate-pulse">
          Sequence Collapse
        </p>
        <p className="text-xs font-mono font-bold text-slate-300 mt-0.5 tracking-tight">
          {message || "Gateway rejection token encountered."}
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * 📡 SIGNAL ACQUIRED: New tactical connection established with the room gateway.
 */
export const PlayerJoinedToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 shadow-xl shadow-indigo-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Structural Accent Borders */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
      
      {/* Radar Signal Pulse Dot */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
      </div>
      
      {/* Tech Interface Core Icon Frame */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner shadow-indigo-500/20 font-mono text-sm font-black">
        🎚️
      </div>
      
      {/* Notification Text Content Layer */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
          Link Established
        </p>
        <p className="text-xs font-mono font-bold text-slate-200 mt-0.5 tracking-tight">
          {message || "A new player materialized in the lobby."}
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};


export const PlayAgainSuccessToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 shadow-xl shadow-emerald-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Structural Neon Laser Accent Line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 via-cyan-500 to-indigo-500" />
      
      {/* High-Frequency Sync Ping Indicator */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </div>
      
      {/* Tactical UI Icon Frame */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shadow-emerald-500/20 font-mono text-sm font-black">
        🔁
      </div>
      
      {/* Terminal Telemetry Broadcast Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
          System Core Recycled
        </p>
        <p className="text-xs font-mono font-bold text-slate-200 mt-0.5 tracking-tight">
          Lobby re-initialized. Prepare for <span className="text-emerald-400">ROUND 01</span>!
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * 📡 REGISTRATION TRIGGER: Player logged a confirmation sequence to the room host.
 */
export const ReadyToPlayAgain = (userName: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-md w-full bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 shadow-xl shadow-cyan-500/5 p-4 rounded-xl pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      {/* Structural Cyber-Grid Accent Sidebar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-600" />
      
      {/* Synchronization Signal Dot */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
      </div>
      
      {/* HUD Telemetry Icon Container */}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shadow-cyan-500/20 font-mono text-sm font-black">
        ⚡
      </div>
      
      {/* Notification Text Strings */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-500 font-bold">
          Vote Received
        </p>
        <p className="text-xs font-mono font-bold text-slate-200 mt-0.5 tracking-tight">
          <span className="text-cyan-400 uppercase">[{userName || "SYSTEM_USER"}]</span> has readied up for the next match.
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};


export const PlayerLeavedToast = (isAdmin: boolean, userName: string, newAdminUserName: string) => {
  return toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-fade-in animate-scale-up' : 'animate-leave'
      } max-w-md w-full bg-slate-900/95 backdrop-blur-md border-2 ${
        isAdmin ? 'border-amber-500/50 shadow-amber-500/10' : 'border-rose-500/50 shadow-rose-500/10'
      } p-4 rounded-2xl shadow-2xl pointer-events-auto flex flex-col space-y-2 font-mono relative overflow-hidden`}
    >
      {/* Decorative Top Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${
        isAdmin ? 'from-amber-500 via-orange-500 to-transparent' : 'from-rose-500 via-red-500 to-transparent'
      }`} />

      {/* Row 1: Player Disconnect Notification */}
      <div className="flex items-center space-x-3">
        <span className="text-rose-400 font-black animate-pulse">❌</span>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
            System Log // Connection Lost
          </p>
          <p className="text-xs font-bold text-slate-200">
            <span className="text-rose-400 font-black uppercase">{userName}</span> has desynced and left the instance.
          </p>
        </div>
      </div>

      {/* Row 2: Host Migration Alert (Only fires if the leaving player was the admin) */}
      {isAdmin && newAdminUserName && (
        <div className="mt-1 pt-2 border-t border-slate-800/60 flex items-center space-x-3 animate-scale-up">
          <span className="text-amber-400">👑</span>
          <div className="flex-1">
            <p className="text-[9px] uppercase font-black tracking-widest text-amber-500/80">
              Authority Vector Shifted
            </p>
            <p className="text-[11px] text-slate-400">
              Permissions assigned to: <span className="text-amber-400 font-black uppercase">{newAdminUserName}</span> is now hosting.
            </p>
          </div>
        </div>
      )}
    </div>
  ), {
    duration: 4000,
    position: "top-right"
  });
};

export const RoomDisbandedToast = () => {
  return toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-fade-in animate-scale-up' : 'animate-leave'
      } max-w-md w-full bg-slate-950/95 backdrop-blur-md border-2 border-red-600/60 p-4 rounded-2xl shadow-2xl shadow-red-950/20 pointer-events-auto flex flex-col space-y-2 font-mono relative overflow-hidden`}
    >
      {/* Glitch-style Grid Background Overlay Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Warning Alert Header Banner */}
      <div className="flex items-center space-x-3 relative z-10">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-red-500/10 border border-red-500 text-red-500 text-xs font-black animate-pulse">
          ⚠️
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-red-500 animate-pulse">
            CRITICAL CRASH // LOBBY_TERMINATED
          </p>
          <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide mt-0.5">
            Instance Disbanded by Host
          </h4>
        </div>
      </div>

      {/* Subtext description log lines */}
      <div className="pt-1.5 border-t border-slate-900 relative z-10">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The host has severed the terminal connection. Evacuating all active players back to the central hub command deck...
        </p>
      </div>

      {/* Scanning Laser Line Animation Effect */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_#ef4444] animate-[pulse_1.5s_infinite]" />
    </div>
  ), {
    duration: 4500,
    position: "top-center" // Centered at the top looks more like an unmissable global game alert
  });
};

export const PlayerRejoinToast = (userName: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-slate-950/95 border-2 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-auto flex p-4 backdrop-blur-md relative overflow-hidden`}
        style={{
          clipPath: 'polygon(0 0, 95% 0, 100% 25%, 100% 100%, 5% 100%, 0 75%)' // Sharp angular anime cuts
        }}
      >
        {/* Subtle Cyber Grid Background Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b210_1px,transparent_1px),linear-gradient(to_bottom,#0891b210_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        {/* Neon Status Indicator Stripe */}
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-blue-600 animate-pulse" />

        <div className="flex items-center justify-between w-full z-10">
          <div className="flex items-center gap-3">
            {/* Action Icon Wrapper */}
            <div className="p-2 bg-cyan-950 border border-cyan-500 text-cyan-400 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.3)] animate-bounce">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>

            {/* Notification Messages */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-cyan-400 font-mono flex items-center gap-1">
                SYSTEM // RE-LINK SYSTEM
              </span>
              <p className="text-sm font-medium mt-0.5 text-slate-100">
                <span className="text-cyan-300 font-extrabold tracking-wide drop-shadow-[0_0_5px_rgba(103,232,249,0.4)]">
                  {userName}
                </span>{' '}
                has broken through the void and re-entered the match!
              </p>
            </div>
          </div>

          {/* Sparkly visual trailing edge */}
          <div className="opacity-40 text-cyan-400 animate-pulse ml-4">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: 'top-right',
    }
  );
};

export const PlayerOfflineToast = (userName: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-slate-950/95 border-2 border-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] pointer-events-auto flex p-4 backdrop-blur-md relative overflow-hidden`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 95% 100%, 0 100%, 0 25%)' // Sharp angular cut matching the UI matrix
        }}
      >
        {/* Warning Neon Glitch Stripe */}
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-amber-500 to-red-600 animate-pulse" />

        <div className="flex items-center justify-between w-full z-10">
          <div className="flex items-center gap-3">
            {/* Warning Icon Wrapper */}
            <div className="p-2 bg-amber-950/80 border border-amber-600 text-amber-500 rounded-sm shadow-[0_0_8px_rgba(217,119,6,0.3)] animate-pulse">
              <WifiOff className="w-5 h-5" />
            </div>

            {/* Notification Messages */}
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-500 font-mono flex items-center gap-1 animate-pulse">
                [!] WARNING // LINK_LOST
              </span>
              <p className="text-sm font-medium mt-0.5 text-slate-200">
                Signal lost for{' '}
                <span className="text-amber-400 font-extrabold tracking-wide drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]">
                  {userName}
                </span>
                . Awaiting matrix synchronization...
              </p>
            </div>
          </div>

          {/* Danger structural accent tag */}
          <div className="opacity-30 text-red-500 animate-bounce ml-4 hidden sm:block">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  );
};