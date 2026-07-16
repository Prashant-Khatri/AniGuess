import { AVATARS } from "@/lib/avatar"
import { useGameStore } from "@/store/game.store"

const IntermissionOverlay = () => {
    const showAnswerPhase = useGameStore((state) => state.showAnswerPhase)
    const intermissionData = useGameStore((state) => state.intermissionData)
    if (!intermissionData) return
    return (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_80%)] pointer-events-none" />
            <div className="w-full max-w-xl bg-white border-4 border-slate-950 rounded-3xl p-6 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] text-center z-10">
                <div className="absolute top-0 left-0 w-full h-[6px] bg-red-600" />
                {showAnswerPhase ? (
                    <div className="space-y-5 animate-scale-up">
                        <span className="text-[10px] uppercase font-mono font-black tracking-widest bg-red-50 border-2 border-red-600 text-red-600 px-3 py-1 rounded-md inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                            ANSWER REVEALED
                        </span>
                        <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-2xl border-4 border-slate-950 bg-slate-100 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <img src={intermissionData.imageUrl} alt="Target" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[10px] uppercase font-mono font-black tracking-widest text-slate-400">CORRECT ANSWER:</h3>
                            <h2 className="text-2xl font-black uppercase text-slate-950 tracking-wide">
                                {intermissionData.correctAnswer}
                            </h2>
                        </div>
                        {intermissionData.alternateNames?.length > 0 && (
                            <div className="pt-1">
                                <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">ALSO ACCEPTED:</p>
                                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                                    {intermissionData.alternateNames.map((name, i) => (
                                        <span key={i} className="text-[10px] font-mono font-bold bg-slate-50 border-2 border-slate-950 text-slate-800 px-2.5 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5 animate-scale-up">
                        <div className="text-center">
                            <span className="text-[10px] uppercase font-mono font-black tracking-widest bg-slate-950 text-white border-2 border-slate-950 px-3 py-1 rounded-md inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] select-none">
                                ROUND STANDINGS
                            </span>
                            <h2 className="text-xl font-black uppercase text-slate-950 tracking-tight mt-3">Current Leaderboard</h2>
                        </div>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                            {intermissionData.turnScores?.map((player, index) => (
                                <div key={player.userId} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-mono font-black text-slate-400 text-xs sm:text-sm">#{index + 1}</span>
                                        <img src={AVATARS[player.avatarId - 1].imageUrl} alt="" className="w-8 h-8 bg-white border-2 border-slate-950 rounded-full" />
                                        <span className="font-mono font-black text-xs uppercase tracking-wide text-slate-950">{player.userName}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <span className="text-xs font-black font-mono text-red-600 animate-pulse">+{player.pointsGained} XP</span>
                                        <span className="text-[10px] font-mono font-bold text-slate-400 border-l border-slate-300 pl-3">
                                            TOTAL: {player.totalScore}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IntermissionOverlay