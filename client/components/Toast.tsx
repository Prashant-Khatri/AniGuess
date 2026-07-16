import { toast } from 'react-hot-toast';
import { Sparkles, Zap, WifiOff, AlertTriangle } from 'lucide-react';

export const SystemMessageToast = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
          max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex items-center space-x-3 pointer-events-auto font-mono text-xs`}
      >
        <span className="text-sm text-red-600 animate-pulse">🐦</span>
        <div className="flex-1 text-slate-950 tracking-wide leading-relaxed">
          <span className="text-red-600 font-black uppercase tracking-widest mr-1">
            [ANNOUNCEMENT]:
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
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-xs bg-white border-4 border-slate-950 px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex items-center space-x-2.5 pointer-events-auto font-mono text-xs`}
    >
      <span className="text-red-600">📋</span>
      <div className="text-slate-950 tracking-wide">
        <span className="text-red-600 font-black uppercase tracking-widest mr-1">[COPY]:</span>
        <span>Room code copied to clipboard!</span>
      </div>
    </div>
  ), { duration: 3000 });
};

export const GameErrorToast = (message: string) => {
  toast.error(`⚠️ ERROR: ${message}`, {
    style: { 
      background: '#ffffff', 
      color: '#020617', 
      border: '4px solid #0f172a', 
      boxShadow: '4px 4px 0px 0px #dc2626',
      fontFamily: 'monospace', 
      fontWeight: 'bold',
      fontSize: '12px'
    }
  });
};

export const KickedFromRoomToast = () => {
  toast.error(`🚫 REMOVED: You have been kicked from the lobby.`, {
    style: { 
      background: '#ffffff', 
      color: '#dc2626', 
      border: '4px solid #020617', 
      boxShadow: '4px 4px 0px 0px #020617',
      fontFamily: 'monospace', 
      fontWeight: 'bold',
      fontSize: '12px'
    }
  });
};

export const GameStartedToast = () => {
  toast.success("⚔️ THE GAME HAS BEGUN!", {
    style: { 
      background: '#ffffff', 
      color: '#dc2626', 
      border: '4px solid #020617', 
      boxShadow: '4px 4px 0px 0px #dc2626',
      fontFamily: 'monospace', 
      fontWeight: 'black',
      fontSize: '12px'
    }
  });
};

/**
 * Connected to room successfully
 */
export const JoinSuccessToast = () => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
      
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 border-2 border-slate-950 flex items-center justify-center text-red-600 font-mono text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        👁️
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
          Lobby Connection
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-wide">
          Successfully joined. <span className="text-red-600 font-black">CONNECTED</span>
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * New game room created
 */
export const RoomCreatedToast = () => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
      
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 border-2 border-slate-950 flex items-center justify-center text-red-600 font-mono text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        🔥
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
          Room Creator
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-wide">
          Lobby created successfully. <span className="text-red-600 font-black">READY</span>
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * Join room failed
 */
export const JoinErrorToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-slate-950" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-ping" />
      
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 border-2 border-slate-950 flex items-center justify-center text-red-600 font-mono text-xs font-black">
        💥
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-red-600 font-black">
          Action Failed
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-tight">
          {message || "Could not connect to this room."}
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * New player joined
 */
export const PlayerJoinedToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600" />
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
      </div>
      
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 border-2 border-slate-950 flex items-center justify-center text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-sm font-black">
        🐦
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
          Lobby Update
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-tight">
          {message || "A new player has entered the lobby."}
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

export const PlayAgainSuccessToast = () => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600" />
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
      </div>
      
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 border-2 border-slate-950 flex items-center justify-center text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-sm font-black">
        🔁
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
          Game Restarted
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-tight">
          The room has been reset. Get ready for <span className="text-red-600 font-black">ROUND 1</span>!
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

/**
 * Player readied up
 */
export const ReadyToPlayAgain = (userName: string) => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex items-center space-x-3.5 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600" />
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
      </div>
      
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 border-2 border-slate-950 flex items-center justify-center text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-sm font-black">
        ⚡
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
          Ready Check
        </p>
        <p className="text-xs font-mono font-bold text-slate-950 mt-0.5 tracking-tight">
          <span className="text-red-600 uppercase">[{userName || "Player"}]</span> is ready for the next match.
        </p>
      </div>
    </div>
  ), { position: "top-center" });
};

export const PlayerLeavedToast = (isAdmin: boolean, userName: string, newAdminUserName: string) => {
  return toast.custom((t) => (
    <div
      className={`${t.visible ? 'animate-fade-in animate-scale-up' : 'animate-leave'} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto flex flex-col space-y-2 font-mono relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600" />

      {/* Row 1: Player Disconnect Notification */}
      <div className="flex items-center space-x-3">
        <span className="text-red-600 font-black animate-pulse">❌</span>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            System Log // Left Lobby
          </p>
          <p className="text-xs font-bold text-slate-950">
            <span className="text-red-600 font-black uppercase">{userName}</span> has disconnected and left the game.
          </p>
        </div>
      </div>

      {/* Row 2: Host Migration Alert */}
      {isAdmin && newAdminUserName && (
        <div className="mt-1 pt-2 border-t-2 border-slate-100 flex items-center space-x-3 animate-scale-up">
          <span className="text-amber-500">👑</span>
          <div className="flex-1">
            <p className="text-[9px] uppercase font-black tracking-widest text-amber-600">
              New Room Host Assigned
            </p>
            <p className="text-[11px] font-bold text-slate-600">
              Host permissions assigned to: <span className="text-slate-950 font-black uppercase">{newAdminUserName}</span>.
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
      className={`${t.visible ? 'animate-fade-in animate-scale-up' : 'animate-leave'} 
        max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex flex-col space-y-2 font-mono relative overflow-hidden`}
    >
      {/* Header Banner */}
      <div className="flex items-center space-x-3 relative z-10">
        <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-slate-950 text-red-600 text-xs font-black animate-pulse">
          ⚠️
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-red-600">
            LOBBY CLOSED
          </p>
          <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide mt-0.5">
            Lobby Closed by Host
          </h4>
        </div>
      </div>

      {/* Description */}
      <div className="pt-1.5 border-t-2 border-slate-100 relative z-10">
        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
          The host has ended the lobby. Returning all active players back to the start menu...
        </p>
      </div>

      {/* Flat bottom progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-red-600" />
    </div>
  ), {
    duration: 4500,
    position: "top-center"
  });
};

export const PlayerRejoinToast = (userName: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
          max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex relative overflow-hidden`}
        style={{
          clipPath: 'polygon(0 0, 95% 0, 100% 15px, 100% 100%, 5% 100%, 0 calc(100% - 15px))' // Classic angular anime cuts
        }}
      >
        {/* Status Indicator Stripe */}
        <div className="absolute top-0 left-0 h-full w-[6px] bg-red-600 animate-pulse" />

        <div className="flex items-center justify-between w-full z-10 pl-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 border-2 border-slate-950 text-red-600 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 fill-red-600" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] tracking-[0.15em] uppercase font-mono font-black text-red-600 flex items-center gap-1">
                SYSTEM // RECONNECTED
              </span>
              <p className="text-xs font-bold mt-0.5 text-slate-950">
                <span className="text-red-600 font-extrabold tracking-wide">
                  {userName}
                </span>{' '}
                has returned and re-entered the match!
              </p>
            </div>
          </div>

          <div className="opacity-40 text-red-600 animate-pulse ml-4">
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
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
          max-w-md w-full bg-white border-4 border-slate-950 p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] pointer-events-auto flex relative overflow-hidden`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), 95% 100%, 0 100%, 0 15px)' // Matching opposite cut
        }}
      >
        <div className="absolute top-0 right-0 h-full w-[6px] bg-red-600 animate-pulse" />

        <div className="flex items-center justify-between w-full z-10 pr-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 border-2 border-slate-950 text-red-600 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <WifiOff className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] tracking-[0.15em] uppercase font-mono font-black text-red-600 flex items-center gap-1 animate-pulse">
                [!] WARNING // DISCONNECTED
              </span>
              <p className="text-xs font-bold mt-0.5 text-slate-950">
                Lost connection to{' '}
                <span className="text-red-600 font-extrabold tracking-wide">
                  {userName}
                </span>
                . Waiting for them to rejoin...
              </p>
            </div>
          </div>

          <div className="opacity-40 text-red-600 animate-bounce ml-4 hidden sm:block">
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