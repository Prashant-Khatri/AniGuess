import DisplayScreen from "./DisplayScreen";
import GuessInputBar from "./GuessInputBar";
import LiveFeedPanel from "./LiveFeedPanel";
import RoasterPanel from "./RoasterPanel";
import RoomHeader from "./RoomHeader";

export default function GameScreen({ roomId }: { roomId: string }) {
    return (
        <>
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none z-0" />
            <div className="w-full h-full flex flex-col space-y-3 min-h-0 relative z-10 overflow-hidden">
                <div className="flex-shrink-0">
                    <RoomHeader roomId={roomId} />
                </div>
                <div className="flex-1 min-h-0 w-full flex flex-col space-y-3 overflow-hidden">
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
                        <div className="lg:col-span-7 min-h-0 h-full w-full relative overflow-hidden bg-slate-50 border-4 border-slate-950 rounded-2xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                            <DisplayScreen />
                        </div>
                        <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 lg:flex lg:flex-col gap-3 min-h-0 h-full overflow-hidden">
                            <div className="flex-1 min-h-0 w-full relative">
                                <RoasterPanel roomId={roomId} />
                            </div>
                            <div className="flex-1 min-h-0 w-full relative">
                                <LiveFeedPanel />
                            </div>
                        </div>

                    </div>
                    <div className="flex-shrink-0 w-full">
                        <GuessInputBar roomId={roomId} />
                    </div>
                </div>
            </div>
        </>
    )
}