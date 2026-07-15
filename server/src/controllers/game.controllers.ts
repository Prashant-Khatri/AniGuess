import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import { Character, ICharacter } from "../models/character.models.js";
import { IPlayers } from "./room.controllers.js";

const disconnectionTimers: Record<string, NodeJS.Timeout> = {};

export const reJoinRoom = (io: Server, socket: Socket) => {
    socket.on('rejoin_room', async (data: {
        roomId: string,
        userId: string
    }) => {
        const { roomId, userId } = data
        const roomKey = `room:${roomId}`
        const pipeline1 = redis.pipeline();
        pipeline1.exists(`socket_to_user:${socket.id}`);
        pipeline1.hgetall(`${roomKey}:players`);
        pipeline1.hget(roomKey, 'adminId');
        pipeline1.hmget(roomKey, 'status', 'currentRound', 'hint1', 'hint2', 'timerEndsAt', 'currentCharacterUrl');
        const results = await pipeline1.exec();
        if (!results) return;
        const isFirstTimeMounting = results[0][1] as number;
        if (isFirstTimeMounting) return
        const playersRaw = results[1][1] as Record<string, string> || {};
        const adminId = results[2][1] as string | null;
        const roomState = results[3][1] as (string | null)[];
        const reJoiningPlayerStr = playersRaw[userId];
        if (!reJoiningPlayerStr) return;
        socket.emit('set_is_refreshing')
        const reJoiningPlayer: IPlayers = JSON.parse(reJoiningPlayerStr)
        const previousSocketId = reJoiningPlayer.socketId
        const isAdmin = adminId === previousSocketId
        reJoiningPlayer.isOnline = true
        reJoiningPlayer.socketId = socket.id
        const status = roomState[0] || 'lobby';
        const currentRound = parseInt(roomState[1] || '1', 10);
        const hint1 = roomState[2] || '';
        const hint2 = roomState[3] || '';
        const timerEndsAt = parseInt(roomState[4] || '0', 10);
        const currentCharacterUrl = roomState[5] || '';
        const timeLeftInSecond = Math.max(0, (timerEndsAt - Date.now()) / 1000);
        playersRaw[userId] = JSON.stringify(reJoiningPlayer);
        const freshPlayers: IPlayers[] = Object.values(playersRaw).map((p) => JSON.parse(p));
        const pipeline2 = redis.pipeline();
        pipeline2.set(`socket_to_user:${socket.id}`, userId);
        pipeline2.hset(`${roomKey}:players`, userId, JSON.stringify(reJoiningPlayer));
        if (isAdmin) {
            pipeline2.hset(roomKey, 'adminId', socket.id);
        }
        await pipeline2.exec();
        await socket.join(roomId);
        socket.to(roomId).emit('player_rejoin', { freshPlayers, userName: reJoiningPlayer.userName });
        socket.emit('rejoin_success', {
            status,
            currentRound,
            timeLeftInSecond,
            hint1,
            hint2,
            freshPlayers,
            currentCharacterUrl,
            isAdmin
        });
        if (disconnectionTimers[userId]) {
            clearTimeout(disconnectionTimers[userId]);
            delete disconnectionTimers[userId];
        }
    })
}

export const syncIntermissionData = (io: Server, socket: Socket) => {
    socket.on('sync_intermission_data', async (data: { userId: string }) => {
        const { userId } = data;
        const roomId = await redis.get(`user_to_room:${userId}`);
        if (!roomId) return;
        const roomKey = `room:${roomId}`;
        const pipeline = redis.pipeline();
        pipeline.hmget(
            roomKey,
            'status',
            'currentCharacterName',
            'alternateAnswer',
            'currentCharacterUrl',
            'currentAnswer'
        );
        pipeline.hgetall(`${roomKey}:players`);
        const results = await pipeline.exec();
        if (!results) return;
        const roomFields = results[0][1] as (string | null)[];
        const playersRaw = results[1][1] as Record<string, string> || {};
        const status = roomFields[0];
        if (status !== 'intermission') return;
        const currentCharacterName = roomFields[1] || '';
        const alternateAnswerStr = roomFields[2];
        const currentCharacterUrl = roomFields[3] || '';
        const animeName = roomFields[4] || '';
        const alternateNames: string[] = JSON.parse(alternateAnswerStr as string);
        const playersList = Object.entries(playersRaw).map(([idKey, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);
            return {
                ...parsedPlayer,
                userId: idKey
            };
        });
        const sortedPlayers = playersList.sort((a, b) => b.score - a.score);
        const turnScores = sortedPlayers.map((player) => ({
            userId: player.socketId,
            userName: player.userName,
            avatarId: player.avatarId,
            pointsGained: player.turnScore,
            totalScore: player.score
        }));
        const intermissionPayload = {
            correctAnswer: currentCharacterName,
            alternateNames,
            imageUrl: currentCharacterUrl,
            animeName,
            turnScores
        };
        socket.emit('intermission_data_synced', intermissionPayload);
    });
}

export const syncEndGameData = (io: Server, socket: Socket) => {
    socket.on('sync_ended_data', async (data: { userId: string }) => {
        const { userId } = data;
        const roomId = await redis.get(`user_to_room:${userId}`);
        if (!roomId) return;
        const roomKey = `room:${roomId}`;
        const pipeline = redis.pipeline();
        pipeline.hget(roomKey, 'status');
        pipeline.hgetall(`${roomKey}:players`);
        const results = await pipeline.exec();
        if (!results) return;
        const status = results[0][1] as string | null;
        const playersRaw = results[1][1] as Record<string, string> || {};
        if (status !== 'ended') return;
        const playersList = Object.entries(playersRaw).map(([idKey, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);
            return {
                ...parsedPlayer,
                userId: idKey
            };
        });
        const sortedFinalStandings: IPlayers[] = playersList.sort((a, b) => b.score - a.score);
        const finalLeaderboard = sortedFinalStandings.map((player, index) => ({
            userId: player.socketId,
            userName: player.userName,
            avatarId: player.avatarId,
            totalScore: player.score,
            rank: index + 1,
            hasReadiedUp: player.hasReadiedUp,
        }));
        const endGamePayload = {
            finalLeaderboard
        };
        socket.emit('ended_data_synced', endGamePayload);
    });
};

export const handlePlayerPermanentlyLeft = async (io: Server, userId: string) => {
    try {
        const roomId = await redis.get(`user_to_room:${userId}`);
        if (!roomId) return;
        const roomKey = `room:${roomId}`;
        const playersHashKey = `${roomKey}:players`;
        const pipeline1 = redis.pipeline();
        pipeline1.exists(roomKey);
        pipeline1.hget(roomKey, 'adminId');
        pipeline1.hgetall(playersHashKey);
        const results1 = await pipeline1.exec();
        if (!results1) return;
        const roomExists = results1[0][1] as number;
        if (!roomExists) return;
        const adminId = results1[1][1] as string | null;
        const playersRaw = results1[2][1] as Record<string, string> || {};
        const targetPlayerRaw = playersRaw[userId];
        if (!targetPlayerRaw) return;
        const playerToBeRemoved: IPlayers = JSON.parse(targetPlayerRaw);
        const isAdmin = adminId === playerToBeRemoved.socketId;
        let newAdminUserName = "";
        let newAdminSocketId: string | null = null;
        if (isAdmin) {
            const nextHost = Object.values(playersRaw)
                .map((p) => JSON.parse(p) as IPlayers)
                .find((p) => p.socketId !== playerToBeRemoved.socketId);
            if (nextHost) {
                newAdminSocketId = nextHost.socketId;
                newAdminUserName = nextHost.userName;
            }
        }
        delete playersRaw[userId];
        const remainingPlayers = Object.values(playersRaw).map((p) => JSON.parse(p) as IPlayers);
        const remainingPlayerCount = remainingPlayers.length;
        const pipeline2 = redis.pipeline();
        if (remainingPlayerCount === 0) {
            pipeline2.del(roomKey, playersHashKey, `${roomKey}:taken_avatars`);
            pipeline2.del(`user_to_room:${userId}`);
            pipeline2.del(`socket_to_user:${playerToBeRemoved.socketId}`);
            await pipeline2.exec();
            return;
        }
        pipeline2.hdel(playersHashKey, userId);
        pipeline2.srem(`${roomKey}:taken_avatars`, playerToBeRemoved.avatarId);
        pipeline2.del(`user_to_room:${userId}`);
        pipeline2.del(`socket_to_user:${playerToBeRemoved.socketId}`);
        if (isAdmin && newAdminSocketId) {
            pipeline2.hset(roomKey, 'adminId', newAdminSocketId);
        }
        await pipeline2.exec();
        io.to(roomId).emit('room_state_update', remainingPlayers);
        io.to(roomId).emit('player_leaved', {
            isAdmin,
            newAdminUserName,
            userName: playerToBeRemoved.userName,
            roomId
        });
    } catch (error) {
        console.error("Error encountered handling permanent player departure: ", error);
    }
};

export const leaveRoom = (io: Server, socket: Socket) => {
    socket.on('leave_room', async (data: { roomId: string, userId: string }) => {
        try {
            const { roomId, userId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const pipeline1 = redis.pipeline();
            pipeline1.exists(roomKey);
            pipeline1.hget(roomKey, 'adminId');
            pipeline1.hgetall(playersHashKey);
            const results1 = await pipeline1.exec();
            if (!results1) return;
            const roomExists = results1[0][1] as number;
            if (!roomExists) return;
            const adminId = results1[1][1] as string | null;
            const playersRaw = results1[2][1] as Record<string, string> || {};
            const targetPlayerRaw = playersRaw[userId];
            if (!targetPlayerRaw) {
                return socket.emit('game_error', { message: "Player profile not discovered in this channel" });
            }
            const playerToBeRemoved: IPlayers = JSON.parse(targetPlayerRaw);
            const isAdmin = adminId === socket.id;
            let newAdminUserName = "";
            let newAdminSocketId: string | null = null;
            if (isAdmin) {
                const nextHost = Object.values(playersRaw)
                    .map((p) => JSON.parse(p) as IPlayers)
                    .find((p) => p.socketId !== socket.id);

                if (nextHost) {
                    newAdminSocketId = nextHost.socketId;
                    newAdminUserName = nextHost.userName;
                }
            }
            delete playersRaw[userId];
            const remainingPlayers = Object.values(playersRaw).map((p) => JSON.parse(p) as IPlayers);
            const remainingPlayerCount = remainingPlayers.length;
            const pipeline2 = redis.pipeline();
            if (remainingPlayerCount === 0) {
                pipeline2.del(roomKey, playersHashKey, `${roomKey}:taken_avatars`);
                pipeline2.del(`user_to_room:${userId}`);
                pipeline2.del(`socket_to_user:${socket.id}`);
                await pipeline2.exec();
                await socket.leave(roomId);
                return;
            }
            pipeline2.hdel(playersHashKey, userId);
            pipeline2.srem(`${roomKey}:taken_avatars`, playerToBeRemoved.avatarId);
            pipeline2.del(`user_to_room:${userId}`);
            pipeline2.del(`socket_to_user:${socket.id}`);
            if (isAdmin && newAdminSocketId) {
                pipeline2.hset(roomKey, 'adminId', newAdminSocketId);
            }
            await pipeline2.exec();
            socket.to(roomId).emit('room_state_update', remainingPlayers);
            socket.to(roomId).emit('player_leaved', {
                isAdmin,
                newAdminUserName,
                userName: playerToBeRemoved.userName,
                roomId
            });
            await socket.leave(roomId);
        } catch (error) {
            console.error("Critical error inside leave vector execution:", error);
            socket.emit('game_error', { message: "Failed to cleanly detach from current workspace infrastructure" });
        }
    });
};

export const disbandRoom = (io: Server, socket: Socket) => {
    socket.on('disband_room', async (data: { roomId: string }) => {
        try {
            const { roomId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const pipeline1 = redis.pipeline();
            pipeline1.hget(roomKey, 'adminId');
            pipeline1.hgetall(playersHashKey);
            const results = await pipeline1.exec();
            if (!results) return;
            const adminId = results[0][1] as string | null;
            const totalRosterRaw = results[1][1] as Record<string, string> || {};
            if (adminId !== socket.id) {
                return socket.emit('game_error', { message: "Unable to disband room" });
            }
            const pipeline2 = redis.pipeline();
            for (const [userId, playerRaw] of Object.entries(totalRosterRaw)) {
                const player = JSON.parse(playerRaw);
                if (player.socketId) {
                    pipeline2.del(`socket_to_user:${player.socketId}`);
                }
                pipeline2.del(`user_to_room:${userId}`);
            }
            pipeline2.del(roomKey, playersHashKey, `${roomKey}:taken_avatars`);
            await pipeline2.exec();
            io.to(roomId).emit('room_disbanded');
            io.in(roomId).socketsLeave(roomId);
        } catch (error) {
            console.error("Error in disbanding room : ", error);
            socket.emit('game_error', { message: "Unable to disband room" });
        }
    });
};

export const playAgainToggle = (io: Server, socket: Socket) => {
    socket.on('play_again_toggle', async (data: { roomId: string, userId: string }) => {
        try {
            const { roomId, userId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const allPlayersRaw = await redis.hgetall(playersHashKey);
            const targetPlayerRaw = allPlayersRaw[userId]
            if (!allPlayersRaw || !targetPlayerRaw) return;
            const targetPlayer: IPlayers = JSON.parse(targetPlayerRaw);
            targetPlayer.hasReadiedUp = true;
            const userName = targetPlayer.userName || "";
            allPlayersRaw[userId] = JSON.stringify(targetPlayer);
            const pipeline = redis.pipeline();
            pipeline.hset(playersHashKey, userId, allPlayersRaw[userId]);
            await pipeline.exec();
            const playersList: IPlayers[] = Object.values(allPlayersRaw).map((p) => JSON.parse(p));
            const sortedFinalStandings = playersList.sort((a, b) => b.score - a.score);
            const finalLeaderboard = sortedFinalStandings.map((player, index) => ({
                userId: player.socketId,
                userName: player.userName,
                avatarId: player.avatarId,
                totalScore: player.score,
                rank: index + 1,
                hasReadiedUp: player.hasReadiedUp,
            }));
            const endGamePayload = {
                finalLeaderboard
            };
            io.to(roomId).emit('play_again_toggle_success', { endGamePayload, userName });
        } catch (error) {
            console.error("Error toggling ready status state:", error);
        }
    });
};

export const playAgain = (io: Server, socket: Socket) => {
    socket.on('play_again', async (data: { roomId: string }) => {
        try {
            const { roomId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const pipeline1 = redis.pipeline();
            pipeline1.hmget(roomKey, 'adminId', 'status');
            pipeline1.hgetall(playersHashKey);
            const results = await pipeline1.exec();
            if (!results) return;
            const roomFields = results[0][1] as (string | null)[];
            const allPlayersRaw = results[1][1] as Record<string, string> || {};
            const adminId = roomFields[0];
            const status = roomFields[1];
            if (status !== 'ended') return;
            if (socket.id !== adminId) {
                return socket.emit('game_error', { message: 'Only host can change status to lobby' });
            }
            const pipeline2 = redis.pipeline();
            pipeline2.hset(roomKey, {
                currentRound: '',
                currentTurn: '',
                status: 'lobby',
                currentCharacterName: '',
                currentCharacterUrl: '',
                currentAnswer: '',
                alternateAnswer: JSON.stringify([]),
                hint1: '',
                hint2: '',
                hint1Revealed: 'false',
                hint2Revealed: 'false',
                timerEndsAt: '',
            });
            const resetedAllPlayers: IPlayers[] = Object.entries(allPlayersRaw).map(([userId, profileStr]) => {
                const profile: IPlayers = JSON.parse(profileStr);
                profile.hasGuessed = false;
                profile.turnScore = 0;
                profile.score = 0;
                profile.hasReadiedUp = false;
                pipeline2.hset(playersHashKey, userId, JSON.stringify(profile));
                return profile;
            });
            await pipeline2.exec();
            return io.to(roomId).emit('play_again_success', resetedAllPlayers);
        } catch (error) {
            console.error("Couldn't reset the game : ", error);
            return socket.emit('game_error', { message: "Couldn't reset the game" });
        }
    });
};

export const kickPlayer = (io: Server, socket: Socket) => {
    socket.on('kick_player', async (data: { roomId: string; targetSocketId: string }) => {
        try {
            const { roomId, targetSocketId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const pipeline1 = redis.pipeline();
            pipeline1.hmget(roomKey, 'adminId', 'status');
            pipeline1.hgetall(playersHashKey);
            const results1 = await pipeline1.exec();
            if (!results1) return;
            const roomFields = results1[0][1] as (string | null)[];
            const playersRaw = results1[1][1] as Record<string, string> || {};
            const adminId = roomFields[0];
            const status = roomFields[1];
            if (socket.id !== adminId) {
                return socket.emit('game_error', { message: "Only host can kick players" });
            }
            if (status !== 'lobby') {
                return socket.emit("game_error", { message: "Kicking players is disabled mid-game!" });
            }
            let kickedPlayerUserName = "";
            let targetUserId = "";
            let targetAvatarId: number | null = null;
            for (const [userId, playerStr] of Object.entries(playersRaw)) {
                const currentPlayer: IPlayers = JSON.parse(playerStr);
                if (currentPlayer.socketId === targetSocketId) {
                    kickedPlayerUserName = currentPlayer.userName;
                    targetUserId = userId;
                    targetAvatarId = currentPlayer.avatarId;
                    break;
                }
            }
            if (!targetUserId) {
                return socket.emit("game_error", { message: "Player not found in active lobby memory." });
            }
            const pipeline2 = redis.pipeline();
            pipeline2.hdel(playersHashKey, targetUserId);
            pipeline2.del(`socket_to_user:${targetSocketId}`);
            pipeline2.del(`user_to_room:${targetUserId}`);
            if (targetAvatarId !== null) {
                pipeline2.srem(`${roomKey}:taken_avatars`, targetAvatarId);
            }
            await pipeline2.exec();
            io.to(targetSocketId).emit("kicked_from_room");
            const targetSocketInstance = io.sockets.sockets.get(targetSocketId);
            if (targetSocketInstance) {
                targetSocketInstance.leave(roomId);
            }
            delete playersRaw[targetUserId];
            const freshRoster: IPlayers[] = Object.values(playersRaw).map((v) => JSON.parse(v));
            io.to(roomId).emit("room_state_update", freshRoster);
            io.to(roomId).emit("feed_message", {
                userName: "SYSTEM",
                systemMsg: true,
                message: `${kickedPlayerUserName} was kicked by the host.`
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error("Internal server error unable to kick : ", error.message);
                return socket.emit('game_error', { message: 'Internal server error unable to kick' });
            }
        }
    });
};

export const handlePlayerGuess = (io: Server, socket: Socket) => {
    socket.on('submit_guess', async (data: { roomId: string, userId: string, guess: string }) => {
        try {
            const { roomId, userId, guess } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const trimmedGuess = guess.trim();
            const cleanedGuess = trimmedGuess.toLowerCase();
            const pipeline1 = redis.pipeline();
            pipeline1.hmget(roomKey, 'status', 'currentCharacterName', 'currentAnswer', 'alternateAnswer', 'timerEndsAt');
            pipeline1.hgetall(playersHashKey);
            const results1 = await pipeline1.exec();
            if (!results1) return;
            const roomFields = results1[0][1] as (string | null)[];
            const playersRaw = results1[1][1] as Record<string, string> || {};
            const status = roomFields[0];
            const answer = roomFields[1];
            const animeName = roomFields[2];
            const alternateAnswerRaw = roomFields[3];
            const timerEndsAtStr = roomFields[4] || "0";
            if (status === 'intermission' || status === 'ended') return;
            const playerRaw = playersRaw[userId];
            if (!playerRaw) return;
            const player: IPlayers = JSON.parse(playerRaw);
            const alternateAnswer: string[] = JSON.parse(alternateAnswerRaw as string);;
            const isCorrect = trimmedGuess === '' ? false : (cleanedGuess === answer || cleanedGuess === animeName || alternateAnswer.includes(cleanedGuess));
            if (isCorrect && !player.hasGuessed) {
                const timeLeftMs = parseInt(timerEndsAtStr) - Date.now();
                const secondsLeft = Math.max(0, Math.floor(timeLeftMs / 1000));
                if (secondsLeft === 0) return;
                const earnedTurnScore = 100 + secondsLeft * 8;
                player.hasGuessed = true;
                player.turnScore = earnedTurnScore;
                player.score += earnedTurnScore;
                const updatedPlayerString = JSON.stringify(player);
                playersRaw[userId] = updatedPlayerString;
                const pipeline2 = redis.pipeline();
                pipeline2.hset(playersHashKey, userId, updatedPlayerString);
                await pipeline2.exec();
                io.to(roomId).emit('feed_message', {
                    userName: "SYSTEM",
                    systemMsg: true,
                    message: `${player.userName} guessed the character correctly! 🎉 +${earnedTurnScore} pts`
                });
                const allPlayers: IPlayers[] = Object.values(playersRaw).map((p) => JSON.parse(p));
                io.to(roomId).emit('room_state_update', allPlayers);
                const totalOnlinePlayers = allPlayers.filter(p => p.isOnline).length;
                const totalGuessedCorrectly = allPlayers.filter(p => p.hasGuessed && p.isOnline).length;
                if (totalGuessedCorrectly >= totalOnlinePlayers) {
                    await endTurnIntermission(io, roomId);
                }
            }
            else if (!isCorrect) {
                io.to(roomId).emit('feed_message', {
                    userName: player.userName,
                    systemMsg: false,
                    message: trimmedGuess
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to parse incoming player guess stream:", error.message);
            }
        }
    });
};

export const endTurnIntermission = async (io: Server, roomId: string) => {
    try {
        const roomKey = `room:${roomId}`;
        const playersHashKey = `${roomKey}:players`;
        const pipeline1 = redis.pipeline();
        pipeline1.hmget(roomKey, 'status', 'currentCharacterName', 'currentAnswer', 'alternateAnswer', 'currentCharacterUrl');
        pipeline1.hgetall(playersHashKey);

        const results1 = await pipeline1.exec();
        if (!results1) return;

        const roomFields = results1[0][1] as (string | null)[];
        const playersRaw = results1[1][1] as Record<string, string> || {};

        const status = roomFields[0];
        const currentCharacterName = roomFields[1] || "";
        const animeName = roomFields[2] || "";
        const alternateAnswerRaw = roomFields[3];
        const currentCharacterUrl = roomFields[4] || "";
        if (status !== 'playing') return;
        await redis.hset(roomKey, { status: 'intermission' });
        const alternateName: string[] = JSON.parse(alternateAnswerRaw as string);
        const playersList = Object.entries(playersRaw).map(([userId, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);
            return {
                ...parsedPlayer,
                userId: userId
            };
        });
        const sortedPlayers = playersList.sort((a, b) => b.score - a.score);
        const turnScores = sortedPlayers.map((player) => ({
            userId: player.socketId,
            userName: player.userName,
            avatarId: player.avatarId,
            pointsGained: player.turnScore,
            totalScore: player.score
        }));
        const intermissionPayload = {
            correctAnswer: currentCharacterName,
            animeName,
            alternateNames: alternateName,
            imageUrl: currentCharacterUrl,
            turnScores
        };
        io.to(roomId).emit('round_intermission_start', intermissionPayload);
        setTimeout(async () => {
            const verifyStatus = await redis.hget(roomKey, "status");
            if (verifyStatus === "intermission") {
                await loadNextRound(io, roomId);
            }
        }, 9000);
    } catch (error) {
        console.error("Error running turn intermission flow workflow routine:", error);
    }
};

export const runRoundTimerLoop = (io: Server, roomId: string, roundId: number, turnId: number) => {
    const timeInterval = setInterval(async () => {
        try {
            const roomKey = `room:${roomId}`;
            const roomFields = await redis.hmget(
                roomKey,
                'status',
                'currentRound',
                'currentTurn',
                'guessTime',
                'timerEndsAt',
                'hint1Revealed',
                'hint1',
                'hint2Revealed',
                'hint2'
            );
            if (!roomFields) return;
            const status = roomFields[0];
            const currentRound = parseInt(roomFields[1] || "0");
            const currentTurn = parseInt(roomFields[2] || "0");
            const guessTime = parseInt(roomFields[3] || "0");
            const timerEndsAt = parseInt(roomFields[4] || "0");
            const hint1Revealed = roomFields[5];
            const hint1 = roomFields[6] || "";
            const hint2Revealed = roomFields[7];
            const hint2 = roomFields[8] || "";
            const isSafe = status === 'playing' && currentRound === roundId && currentTurn === turnId;
            if (!isSafe) {
                clearInterval(timeInterval);
                return;
            }
            const timeLeft = timerEndsAt - Date.now();
            const timeLeftInSecond = timeLeft / 1000;
            if (timeLeft <= 0) {
                clearInterval(timeInterval);
                return endTurnIntermission(io, roomId);
            }
            const pipeline = redis.pipeline();
            let shouldExecutePipeline = false;
            if (timeLeftInSecond <= (2 / 3) * guessTime && hint1Revealed !== 'true') {
                io.to(roomId).emit('hint_reveal', { id: 1, hint: hint1 });
                pipeline.hset(roomKey, 'hint1Revealed', 'true');
                shouldExecutePipeline = true;
            }
            if (timeLeftInSecond <= guessTime / 3 && hint2Revealed !== 'true') {
                io.to(roomId).emit('hint_reveal', { id: 2, hint: hint2 });
                pipeline.hset(roomKey, 'hint2Revealed', 'true');
                shouldExecutePipeline = true;
            }
            if (shouldExecutePipeline) {
                await pipeline.exec();
            }
            io.to(roomId).emit('timer_tick', {
                timeLeftInSecond: Math.max(0, Math.floor(timeLeftInSecond))
            });
        } catch (error) {
            console.error(`Error in timer tick execution loop for room ${roomId}:`, error);
        }
    }, 1000);
};

export const loadNextRound = async (io: Server, roomId: string) => {
    try {
        const roomKey = `room:${roomId}`;
        const playerKey = `${roomKey}:players`;
        const queueKey = `${roomKey}:queue`;
        const pipeline1 = redis.pipeline();
        pipeline1.hgetall(playerKey);
        pipeline1.lpop(queueKey);
        pipeline1.hmget(roomKey, 'currentRound', 'currentTurn', 'imagesInOneRound', 'guessTime');
        const results1 = await pipeline1.exec();
        if (!results1) return;
        const allPlayersRaw = results1[0][1] as Record<string, string> || {};
        const nextCharacterRaw = results1[1][1] as string | null;
        const roomFields = results1[2][1] as (string | null)[];
        const resetedAllPlayers: IPlayers[] = [];
        const writePipeline = redis.pipeline();
        for (const [userId, profileStr] of Object.entries(allPlayersRaw)) {
            const profile: IPlayers = JSON.parse(profileStr);
            profile.hasGuessed = false;
            profile.turnScore = 0;
            const updatedProfileStr = JSON.stringify(profile);
            allPlayersRaw[userId] = updatedProfileStr;
            resetedAllPlayers.push(profile);
            writePipeline.hset(playerKey, userId, updatedProfileStr);
        }
        io.to(roomId).emit('room_state_update', resetedAllPlayers);
        if (!nextCharacterRaw) {
            writePipeline.hset(roomKey, { status: "ended" });
            await writePipeline.exec();
            const playersList = Object.entries(allPlayersRaw).map(([userId, playerStr]) => {
                const parsedPlayer = JSON.parse(playerStr);
                return { ...parsedPlayer, userId };
            });
            const sortedFinalStandings = playersList.sort((a, b) => b.score - a.score);
            const finalLeaderboard = sortedFinalStandings.map((player, index) => ({
                userId: player.socketId,
                userName: player.userName,
                avatarId: player.avatarId,
                totalScore: player.score,
                rank: index + 1,
                hasReadiedUp: player.hasReadiedUp,
            }));
            return io.to(roomId).emit('game_ended', { finalLeaderboard });
        }
        const nextCharacter: ICharacter = JSON.parse(nextCharacterRaw);
        const currentRound = parseInt(roomFields[0] || "1");
        const currentTurn = parseInt(roomFields[1] || "0");
        const imagesInOneRound = parseInt(roomFields[2] || "5");
        const guessTime = parseInt(roomFields[3] || "30");
        let nextRound = currentRound;
        let nextTurn = currentTurn + 1;
        if (nextTurn === imagesInOneRound + 1) {
            nextTurn = 1;
            nextRound += 1;
        }
        const roundDurationMs = guessTime * 1000;
        const timerEndsAt = Date.now() + roundDurationMs;
        writePipeline.hset(roomKey, {
            currentRound: nextRound.toString(),
            currentTurn: nextTurn.toString(),
            currentCharacterName: nextCharacter.characterName.toString(),
            currentCharacterUrl: nextCharacter.imageUrl.toString(),
            currentAnswer: nextCharacter.animeNameEnglish.toString(),
            alternateAnswer: JSON.stringify(nextCharacter.alternateName.map((a) => a.toLowerCase())),
            hint1: nextCharacter.hint1.toString(),
            hint2: nextCharacter.hint2.toString(),
            hint1Revealed: 'false',
            hint2Revealed: 'false',
            timerEndsAt: timerEndsAt.toString(),
            status: 'playing'
        });
        writePipeline.del(`${roomKey}:feed`);
        await writePipeline.exec();
        io.to(roomId).emit("round_init", {
            currentRound: nextRound,
            currentTurn: nextTurn,
            imageUrl: nextCharacter.imageUrl,
            timerEndsAt,
            players: resetedAllPlayers
        });
        runRoundTimerLoop(io, roomId, nextRound, nextTurn);
    } catch (error) {
        console.error("Critical error inside next round load flow script execution:", error);
    }
};

export const startGame = (io: Server, socket: Socket) => {
    socket.on('start_game', async (data: { roomId: string }) => {
        try {
            const { roomId } = data;
            const roomKey = `room:${roomId}`;
            const queueKey = `${roomKey}:queue`;
            const pipeline1 = redis.pipeline();
            pipeline1.exists(roomKey);
            pipeline1.hmget(roomKey, 'adminId', 'status', 'totalRounds', 'imagesInOneRound');
            const results1 = await pipeline1.exec();
            if (!results1) return;
            const roomExists = results1[0][1] as number;
            const roomFields = results1[1][1] as (string | null)[];
            if (roomExists === 0) {
                return socket.emit('game_error', { message: 'Room does not exist' });
            }
            const adminId = roomFields[0];
            const status = roomFields[1];
            const totalRounds = roomFields[2];
            const imagesInOneRound = roomFields[3];
            if (socket.id !== adminId) {
                return socket.emit('game_error', { message: 'Only room host can start the game' });
            }
            if (status !== 'lobby') return;
            const noOfRequiredCharacters = Number(totalRounds || 0) * Number(imagesInOneRound || 0);
            const charactersPool: ICharacter[] = await Character.aggregate([
                { $sample: { size: noOfRequiredCharacters } }
            ]);
            if (charactersPool.length < noOfRequiredCharacters) {
                return socket.emit("game_error", { message: "Insufficient characters in database pool." });
            }
            const pipeline2 = redis.pipeline();
            pipeline2.del(queueKey);
            const stringifiedCharacters = charactersPool.map(character => JSON.stringify(character));
            if (stringifiedCharacters.length > 0) {
                pipeline2.rpush(queueKey, ...stringifiedCharacters);
            }
            pipeline2.hset(roomKey, {
                status: 'playing',
                currentRound: '1',
                currentTurn: '0'
            });
            await pipeline2.exec();
            io.to(roomId).emit("game_started");
            await loadNextRound(io, roomId);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Game Start Crash Execution Error:", error.message);
                return socket.emit('game_error', { message: 'Game Start Crash Execution Error' });
            }
        }
    });
};

export const disconnect = (io: Server, socket: Socket) => {
    socket.on('disconnect', async (reason) => {
        try {
            const socketToUserKey = `socket_to_user:${socket.id}`;
            const pipeline1 = redis.pipeline();
            pipeline1.get(socketToUserKey);
            pipeline1.del(socketToUserKey);
            const results1 = await pipeline1.exec();
            if (!results1) return;
            const userId = results1[0][1] as string | null;
            if (!userId) {
                return;
            }
            const userToRoomKey = `user_to_room:${userId}`;
            const roomId = await redis.get(userToRoomKey);
            if (!roomId) return;
            const playersHashKey = `room:${roomId}:players`;
            const playerRaw = await redis.hget(playersHashKey, userId);
            if (!playerRaw) return;
            const player: IPlayers = JSON.parse(playerRaw);
            if (player.socketId !== socket.id) {
                return;
            }
            player.isOnline = false;
            const pipeline3 = redis.pipeline();
            pipeline3.hset(playersHashKey, userId, JSON.stringify(player));
            await pipeline3.exec();
            io.to(roomId).emit('player_offline', { socketId: socket.id });
            disconnectionTimers[userId] = setTimeout(async () => {
                delete disconnectionTimers[userId];
                await handlePlayerPermanentlyLeft(io, userId);
            }, 8000);
        } catch (error) {
            console.error("Error during socket disconnect cleanup pipeline:", error);
        }
    });
};