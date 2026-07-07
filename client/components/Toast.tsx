import { toast } from 'react-hot-toast'; // or 'sonner' depending on your setup

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