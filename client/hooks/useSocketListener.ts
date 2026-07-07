import { EndGameData, IntermissionData } from "@/app/room/[roomId]/page";
import { IPlayers } from "@/components/DisplayScreen";
import { FeedMessageData } from "@/components/LiveFeedPanel";
import { GameErrorToast, GameStartedToast, KickedFromRoomToast, SystemMessageToast } from "@/components/Toast";
import { useGameStore } from "@/store/game.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";

export const useSocketListener = (socket: Socket) => {
    const router = useRouter()
    const {
        setStatus,
        setIntermissionData,
        setRound,
        setImageUrl,
        setHint1,
        setHint2,
        setShowAnswerPhase,
        setEndGameData,
        setFeedMessagesCollection,
        setRemainingTime,
        setPlayers
    } = useGameStore()
    // setStatus('playing');
    // setIntermissionData(null);
    // setRound(currentRound);
    // setImageUrl(imageUrl);
    // setHint1("");
    // setHint2("");
    const connectListener = () => {
        console.log('🔄 Initializing Socket Gateway on Home Page...');
        const onConnect = () => {
            console.log("🟢 Connected to backend! My ID is:", socket.id);
        };
        socket.on("connect", onConnect);
        if (!socket.connected) {
            socket.connect();
        } else {
            // If it's already connected (due to a hot-reload), run the log immediately
            onConnect();
        }
        return () => {
            socket.off("connect", onConnect);
        };
    }
    const disconnectListener = () => {
        const onDisconnect = () => {
            console.log("🔴 Disconnected from backend server.");
        };

        // 1. Attach listeners BEFORE invoking the connection call
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("disconnect", onDisconnect);
            // NOTE: We do NOT call socket.disconnect() here so that the socket connection
            // stays alive as the user moves from the home page to the dynamic game room page!
        };
    }
    const gameErrorListener = () => {
        socket.on('game_error', (data: { message: string }) => {
            GameErrorToast(data.message)
        });
        return () => {
            socket.off('game_error')
        };
    }
    const kickedFromRoomListener = () => {
        socket.on('kicked_from_room', (data) => {
            console.log("Inside listener kicked from room")
            KickedFromRoomToast()
            router.push('/');
        });
        return () => {
            socket.off('kicked_from_room')
        };
    }
    const roundInitListener = () => {
        socket.on('round_init', (data: {
            currentRound: number,
            currentTurn: number,
            imageUrl: string,
            timerEndsAt: number,
            players: IPlayers[]
        }) => {
            const { currentRound, imageUrl } = data;
            setStatus('playing');
            setIntermissionData(null);
            setRound(currentRound);
            setImageUrl(imageUrl);
            setHint1("");
            setHint2("");
        });
        return () => {
            socket.off('round_init')
        };
    }
    const gameStartedListener = () => {
        socket.on('game_started', () => {
            console.log("Inside game started")
            setStatus('playing');
            GameStartedToast()
        });
        return () => {
            socket.off('game_started')
        };
    }
    const roundIntermissionStartListener = () => {
        socket.on('round_intermission_start', (data: IntermissionData) => {
            setIntermissionData(data);
            setStatus('intermission');
            setShowAnswerPhase(true);

            // Auto flip intermission views from Answer Canvas to Turn Scores after 4.5 seconds
            const phaseTimer = setTimeout(() => {
                setShowAnswerPhase(false);
            }, 4500);

            return () => clearTimeout(phaseTimer);
        });
        return () => {
            socket.off('round_intermission_start');
        };
    }
    const gameEndedListener = () => {
        socket.on('game_ended', (data: EndGameData) => {
            setEndGameData(data);
            setStatus('ended');
        });
        return () => {
            socket.off('game_ended')
        };
    }
    const hintRevealListener = () => {
        socket.on('hint_reveal', (data: {
            id: number,
            hint: string
        }) => {
            const { id, hint } = data;
            if (id === 1) setHint1(hint);
            if (id === 2) setHint2(hint);
        });
        return () => {
            socket.off('hint_reveal');
        };
    }
    const timerTickListener = () => {
        socket.on('timer_tick', (data: { timeLeftInSecond: number }) => {
            const { timeLeftInSecond } = data;
            setRemainingTime(timeLeftInSecond);
        });
        return () => {
            socket.off('timer_tick');
        };
    }
    const roomCreatedListener = () => {
        socket.on('room_created', (data: { roomId: string }) => {
            const { roomId } = data;
            toast.success('Room Created successfully');
            router.push(`/room/${roomId}`);
        });
        return () => {
            socket.off('room_created');
        };
    }
    const joinErrorListener = () => {
        socket.on('join_error', (data: { message: string }) => {
            const { message } = data;
            toast.error(message);
        });
        return () => {
            socket.off('join_error');
        };
    }
    const feedMessageListener = () => {
        socket.on('feed_message', (data: FeedMessageData) => {
            const { userName, systemMsg, message } = data;

            if (!systemMsg) {
                // Appends new transmissions in latest-first format (newest at the top)
                setFeedMessagesCollection((prev) => [
                    {
                        id: `${Date.now()}-${Math.random()}`,
                        userName,
                        guesss: message
                    },
                    ...prev,
                ]);
            } else {
                SystemMessageToast(message)
            }
        });
        return () => {
            socket.off('feed_message');
        };
    }
    const roomStateUpdateListener = () => {
        socket.on('room_state_update', (data: IPlayers[]) => {
            console.log("Mila hai abhi ek : ", data)
            // Automatically keep the roster synchronized on any socket updates
            setPlayers(data);
        });
        return () => {
            socket.off('room_state_update');
        };
    }
    return {
        connectListener,
        disconnectListener,
        gameErrorListener,
        kickedFromRoomListener,
        roundInitListener,
        gameStartedListener,
        roundIntermissionStartListener,
        gameEndedListener,
        hintRevealListener,
        timerTickListener,
        roomCreatedListener,
        joinErrorListener,
        feedMessageListener,
        roomStateUpdateListener
    }
}