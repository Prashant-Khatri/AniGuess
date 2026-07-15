import { EndGameData, IntermissionData } from "@/app/room/[roomId]/page";
import { IPlayers } from "@/components/DisplayScreen";
import { FeedMessageData } from "@/components/LiveFeedPanel";
import { GameErrorToast, GameStartedToast, JoinErrorToast, JoinSuccessToast, KickedFromRoomToast, PlayAgainSuccessToast, PlayerJoinedToast, PlayerLeavedToast, PlayerOfflineToast, PlayerRejoinToast, ReadyToPlayAgain, RoomCreatedToast, RoomDisbandedToast, SystemMessageToast } from "@/components/Toast";
import { useGameStore } from "@/store/game.store";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";

export const useSocketListener = (socket: Socket) => {
    const router = useRouter()
    const setStatus = useGameStore((s) => s.setStatus);
    const setIntermissionData = useGameStore((s) => s.setIntermissionData);
    const setRound = useGameStore((s) => s.setRound);
    const setImageUrl = useGameStore((s) => s.setImageUrl);
    const setHint1 = useGameStore((s) => s.setHint1);
    const setHint2 = useGameStore((s) => s.setHint2);
    const setShowAnswerPhase = useGameStore((s) => s.setShowAnswerPhase);
    const setEndGameData = useGameStore((s) => s.setEndGameData);
    const setFeedMessagesCollection = useGameStore((s) => s.setFeedMessagesCollection);
    const setRemainingTime = useGameStore((s) => s.setRemainingTime);
    const setPlayers = useGameStore((s) => s.setPlayers);
    const setTotalRounds = useGameStore((s) => s.setTotalRounds);
    const setGuessTime = useGameStore((s) => s.setGuessTime);
    const setImagesInOneRound = useGameStore((s) => s.setImagesInOneRound);
    const setMaxPlayers = useGameStore((s) => s.setMaxPlayers);
    const setHasReadiedUp = useGameStore((s) => s.setHasReadiedUp);
    const getAdminIdandAvatar = useGameStore((s) => s.getAdminIdandAvatar);
    const setAdminId = useGameStore((s) => s.setAdminId);
    const setIsAdmin = useGameStore((s) => s.setIsAdmin);
    const setIsRefreshing = useGameStore((s) => s.setIsRefreshing);
    const connectListener = () => {
        const onConnect = () => {
            console.log("Connected to backend! My ID is:", socket.id);
        };
        socket.on("connect", onConnect);
        if (!socket.connected) {
            socket.connect();
        } else {
            onConnect();
        }
        return () => {
            socket.off("connect", onConnect);
        };
    }
    const disconnectListener = () => {
        const onDisconnect = () => {
            console.log("Disconnected from backend server.");
        };
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("disconnect", onDisconnect);
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
            setRemainingTime(useGameStore.getState().guessTime)
            setIntermissionData(null);
            setRound(currentRound);
            setImageUrl(imageUrl);
            setHint1("");
            setHint2("");
            setFeedMessagesCollection([])
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
            const phaseTimer = setTimeout(() => {
                setShowAnswerPhase(false);
            }, 4000);
            return () => clearTimeout(phaseTimer);
        });
        return () => {
            socket.off('round_intermission_start');
        };
    }
    const gameEndedListener = () => {
        socket.on('game_ended', (data: EndGameData) => {
            setHasReadiedUp(false)
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
            setStatus('lobby')
            setFeedMessagesCollection([])
            RoomCreatedToast()
            router.push(`/room/${roomId}`);
        });
        return () => {
            socket.off('room_created');
        };
    }
    const joinErrorListener = () => {
        socket.on('join_error', (data: { message: string }) => {
            const { message } = data;
            JoinErrorToast(message)
        });
        return () => {
            socket.off('join_error');
        };
    }
    const feedMessageListener = () => {
        socket.on('feed_message', (data: FeedMessageData) => {
            const { userName, systemMsg, message } = data;
            const uniqueMessageId = `${Date.now()}-${Math.random()}`;
            setFeedMessagesCollection((prev) => {
                return [
                    {
                        id: uniqueMessageId,
                        userName,
                        guesss: message
                    },
                    ...prev,
                ];
            });
            if (systemMsg) {
                SystemMessageToast(message);
            }
        });
        return () => {
            socket.off('feed_message');
        };
    }
    const roomStateUpdateListener = () => {
        socket.on('room_state_update', (data: IPlayers[]) => {
            setPlayers(data);
        });
        return () => {
            socket.off('room_state_update');
        };
    }
    const joinSuccessListener = () => {
        socket.on('join_success', (data: {
            roomId: string,
            players: number,
            rounds: number,
            images: number,
            time: number
        }) => {
            const { roomId, time, rounds, images, players } = data
            setGuessTime(time)
            setTotalRounds(rounds)
            setImagesInOneRound(images)
            setMaxPlayers(players)
            setStatus('lobby')
            setFeedMessagesCollection([])
            JoinSuccessToast()
            router.push(`/room/${roomId.toUpperCase()}`);
        });
        return () => {
            socket.off('join_success');
        };
    }

    const configUpdatedListener = () => {
        socket.on('config_updated', (data: {
            key: string;
            value: number
        }) => {
            const { key, value } = data
            if (key === 'totalRounds') {
                setTotalRounds(value)
            }
            if (key === 'maxPlayers') {
                setMaxPlayers(value)
            }
            if (key === 'guessTime') {
                setRemainingTime(value)
                setGuessTime(value)
            }
            if (key === 'imagesInOneRound') {
                setImagesInOneRound(value)
            }
        })
        return () => {
            socket.off('config_updated')
        }
    }
    const playerJoined = () => {
        socket.on('player_joined', (data: { userName: string }) => {
            const { userName } = data
            const uniqueMessageId = `${Date.now()}-${Math.random()}`;
            const message = `${userName} joined the game`
            setFeedMessagesCollection((prev) => {
                return [
                    {
                        id: uniqueMessageId,
                        userName: 'SYSTEM',
                        guesss: message
                    },
                    ...prev,
                ];
            });
            PlayerJoinedToast(message)
        })
        return () => {
            socket.off('player_joined')
        }
    }
    const playAgainSuccessListener = () => {
        socket.on('play_again_success', (data: IPlayers[]) => {
            setFeedMessagesCollection([])
            setStatus('lobby')
            setPlayers(data)
            PlayAgainSuccessToast()
        })
        return () => {
            socket.off('play_again_success')
        }
    }
    const playAgainToggleSuccessListener = () => {
        socket.on('play_again_toggle_success', (data: { endGamePayload: EndGameData, userName: string }) => {
            const { endGamePayload, userName } = data;
            console.log("Inside play again toggle success lsitener : ",endGamePayload,userName)
            setEndGameData(endGamePayload)
            ReadyToPlayAgain(userName);
        });
        return () => {
            socket.off('play_again_toggle_success');
        };
    };
    const playerLeavedListener = () => {
        socket.on('player_leaved', (data: {
            roomId: string,
            isAdmin: boolean,
            newAdminUserName: string,
            userName: string
        }) => {
            const { isAdmin, userName, newAdminUserName, roomId } = data
            if (isAdmin) {
                getAdminIdandAvatar(roomId)
            }
            PlayerLeavedToast(isAdmin, userName, newAdminUserName)
        })
        return () => {
            socket.off('player_leaved')
        }
    }
    const roomDisbandedListener = () => {
        socket.on('room_disbanded', (data) => {
            RoomDisbandedToast()
            setTimeout(() => {
                router.push('/');
            }, 1500);
        })
        return () => {
            socket.off('room_disbanded')
        }
    }
    const playerOfflineListener = () => {
        socket.on('player_offline', (data: { socketId: string }) => {
            const { socketId } = data
            let userName = ""
            const players: IPlayers[] = useGameStore.getState().players
            const updatedPlayers = players.map((p) => {
                if (p.socketId === socketId) {
                    userName = p.userName
                    return { ...p, isOnline: false }
                }
                return p
            })
            setPlayers(updatedPlayers)
            if (userName) PlayerOfflineToast(userName)
        })
        return () => {
            socket.off('player_offline')
        }
    }
    const reJoinSuccessListener = () => {
        socket.on('rejoin_success', (data: {
            status: string,
            currentRound: number,
            timeLeftInSecond: number,
            hint1: string,
            hint2: string,
            freshPlayers: IPlayers[],
            currentCharacterUrl: string,
            isAdmin: boolean
        }) => {
            const {
                status,
                currentRound,
                timeLeftInSecond,
                hint1,
                hint2,
                freshPlayers,
                currentCharacterUrl,
                isAdmin
            } = data
            const userId = localStorage.getItem('game_user_id');
            if (status === 'intermission') {
                socket.emit('sync_intermission_data', { userId })
            }
            if (status === 'ended') {
                socket.emit('sync_ended_data', { userId })
            }
            if (isAdmin) {
                setIsAdmin(true)
                setAdminId(socket.id as string)
            }
            console.log('Inside rejoin success (listener) : ', data)
            setStatus(status)
            setRound(currentRound)
            setPlayers(freshPlayers)
            setHint1(hint1)
            setHint2(hint2)
            setRemainingTime(timeLeftInSecond)
            setImageUrl(currentCharacterUrl)
            setIsRefreshing(false)
        })
        return () => {
            socket.off('rejoin_success')
        }
    }
    const endedDataSyncedListener = () => {
        socket.on('ended_data_synced', (data: EndGameData) => {
            const currentPlayer = data.finalLeaderboard.filter((p) => p.userId === socket.id)
            console.log("I am inside endedData sync", data, currentPlayer)
            if (currentPlayer && currentPlayer[0] && currentPlayer[0].hasReadiedUp) {
                setHasReadiedUp(true)
            }
            setEndGameData(data)
        })
        return () => {
            socket.off('ended_data_synced')
        }
    }
    const intermissionDataSyncedListener = () => {
        socket.on('intermission_data_synced', (data: IntermissionData) => {
            setIntermissionData(data)
        })
        return () => {
            socket.off('intermission_data_synced')
        }
    }
    const playerRejoinListener = () => {
        socket.on('player_rejoin', (data: {
            freshPlayers: IPlayers[],
            userName: string
        }) => {
            const { freshPlayers, userName } = data
            setPlayers(freshPlayers)
            console.log("Player rejoin listener (frontend) : ", freshPlayers)
            PlayerRejoinToast(userName)
        })
        return () => {
            socket.off('player_rejoin')
        }
    }

    const setIsRefreshingListener = () => {
        socket.on('set_is_refreshing', (data) => {
            setIsRefreshing(true)
        })
        return () => {
            socket.off('set_is_refreshing')
        }
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
        roomStateUpdateListener,
        joinSuccessListener,
        configUpdatedListener,
        playerJoined,
        playAgainSuccessListener,
        playAgainToggleSuccessListener,
        playerLeavedListener,
        roomDisbandedListener,
        reJoinSuccessListener,
        playerOfflineListener,
        endedDataSyncedListener,
        intermissionDataSyncedListener,
        playerRejoinListener,
        setIsRefreshingListener
    }
}