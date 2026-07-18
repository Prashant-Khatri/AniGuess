import { useGameHandler } from "@/hooks/useGameHandler";
import { AVATARS } from "@/lib/avatar";
import { socket } from "@/lib/socket";
import { useGameStore } from "@/store/game.store";

export default function EndGameOverlay({ roomId }: { roomId: string }) {
    const endGameData = useGameStore((state) => state.endGameData)
    if (!endGameData) return
    const isAdmin = useGameStore((state) => state.isAdmin);
    const hasReadiedUp = useGameStore((state) => state.hasReadiedUp);
    const setHasReadiedUp = useGameStore((state) => state.setHasReadiedUp);
    const { handleDisbandRoom, handleLeaveRoom, handlePlayAgain, playerReadyToggle } = useGameHandler(socket)
    const handleReadyUp = () => {
        setHasReadiedUp(!hasReadiedUp);
        playerReadyToggle(roomId);
    };
    return (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_80%)] pointer-events-none" />
            <div className="w-full max-w-xl bg-white border-4 border-slate-950 rounded-3xl p-6 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] z-10">
                <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600" />
                <div className="text-center space-y-2 mb-6">
                    <span className="text-[10px] uppercase font-mono font-black tracking-widest bg-slate-950 text-white border-2 border-slate-950 px-3 py-1 rounded-md inline-block shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
                        GAME OVER
                    </span>
                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">
                        Final Standings
                    </h2>
                </div>
                <div className="space-y-2 mb-6 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                    {endGameData.finalLeaderboard?.map((entry) => {
                        const avatarUrl = AVATARS[entry.avatarId - 1].imageUrl;
                        const isWinner = entry.rank === 1;
                        return (
                            <div
                                key={entry.userId}
                                className={`flex items-center justify-between p-3.5 rounded-xl border-2 border-slate-950 transition-all relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${isWinner ? 'bg-red-50 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]' : 'bg-slate-50'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className={`font-mono font-black text-sm w-5 text-center ${isWinner ? 'text-red-600' : 'text-slate-400'}`}>
                                        {isWinner ? '👑' : `${entry.rank}`}
                                    </span>
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="w-8 h-8 bg-white border-2 border-slate-950 rounded-full"
                                    />
                                    <span className={`font-mono font-black text-xs tracking-wide ${isWinner ? 'text-red-600 text-sm' : 'text-slate-950'}`}>
                                        {entry.userName}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {entry.hasReadiedUp && (
                                        <span className="font-mono text-[9px] font-black tracking-widest text-emerald-600 bg-emerald-50 border-2 border-emerald-500 px-2 py-0.5 rounded-md animate-pulse">
                                            ✓ READY
                                        </span>
                                    )}
                                    <span className={`font-mono text-xs font-black px-2.5 py-1 border-2 border-slate-950 rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                ${isWinner ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-950'}`}>
                                        {entry.totalScore} PTS
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    {isAdmin ? (
                        <div className="flex flex-col gap-2.5 w-full col-span-2">
                            <button
                                onClick={() => handlePlayAgain(roomId)}
                                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white border-4 border-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none cursor-pointer"
                            >
                                Play Again
                            </button>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    onClick={() => handleLeaveRoom(roomId)}
                                    className="py-3 bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                >
                                    Leave Room
                                </button>
                                <button
                                    onClick={() => handleDisbandRoom(roomId)}
                                    className="py-3 bg-slate-950 hover:bg-red-950 text-red-500 border-2 border-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                >
                                    Close Lobby
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2.5 w-full col-span-2">
                            <button
                                onClick={handleReadyUp}
                                disabled={hasReadiedUp}
                                className={`py-3.5 font-mono font-black text-xs uppercase tracking-wider rounded-xl border-4 border-slate-950 transition cursor-pointer flex items-center justify-center gap-1.5 
              ${hasReadiedUp
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-500 animate-pulse shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)]"
                                        : "bg-red-600 hover:bg-red-700 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                                    }`}
                            >
                                {hasReadiedUp ? (
                                    <>Waiting for Host...</>
                                ) : (
                                    <>Ready Up</>
                                )}
                            </button>
                            <button
                                onClick={() => handleLeaveRoom(roomId)}
                                className="py-3.5 bg-white hover:bg-slate-100 border-4 border-slate-950 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none cursor-pointer"
                            >
                                Leave Room
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}