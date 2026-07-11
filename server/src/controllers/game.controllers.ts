import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import axios from "axios";
import { Character, ICharacter } from "../models/character.models.js";
import { IPlayers } from "./room.controllers.js";

const disconnectionTimers: Record<string, NodeJS.Timeout> = {};

// game_error
// kicked_from_room

export const reJoinRoom = (io: Server, socket: Socket) => {
    socket.on('rejoin_room', async (data: {
        roomId: string,
        userId: string
    }) => {
        const { roomId, userId } = data
        console.log("I am inside rejoin room : ",roomId,userId)
        //check if in redis if socket_to_user:${socket.id} exists if exists then do nothing if not then store it in redis socket_to_user
        const isFirstTimeMounting = await redis.exists(`socket_to_user:${socket.id}`)
        console.log("Is this first time : ",isFirstTimeMounting)
        if (isFirstTimeMounting) return
        await redis.set(`socket_to_user:${socket.id}`, userId)
        const playersRaw = await redis.hgetall(`room:${roomId}:players`)
        const adminId = await redis.hget(`room:${roomId}`, 'adminId')
        const reJoiningPlayerStr = playersRaw[userId]
        const reJoiningPlayer: IPlayers = JSON.parse(reJoiningPlayerStr)
        const previousSocketId = reJoiningPlayer.socketId
        const isAdmin = adminId === previousSocketId
        //fetch previous socket id by redis playershash userId player.socketId and update player.socketId to new socket id then save this back in redis
        //check if adminid===previous socket if yes then change that to new socket in roomhash
        reJoiningPlayer.isOnline = true
        reJoiningPlayer.socketId = socket.id
        console.log("previous socket id is : ",previousSocketId)
        await redis.hset(`room:${roomId}:players`, userId, JSON.stringify(reJoiningPlayer))
        if (isAdmin) {
            await redis.hset(`room:${roomId}`, 'adminId', socket.id)
        }
        const [status, currentRoundStr, hint1, hint2, timerEndsAtStr,currentCharacterUrl] = await redis.hmget(
            `room${roomId}`,
            'status',
            'currentRound',
            'hint1',
            'hint2',
            'timerEndsAt',
            'currentCharacterUrl'
        )
        const currentRound = parseInt(currentRoundStr as string)
        const timerEndsAt = parseInt(timerEndsAtStr as string)
        const timeLeft = timerEndsAt - Date.now()
        const timeLeftInSecond = timeLeft / 1000
        const freshPlayersRaw = await redis.hgetall(`room:${roomId}:players`)
        const freshPlayers: IPlayers[] = Object.values(freshPlayersRaw).map((p) => JSON.parse(p))
        socket.to(roomId).emit('player_rejoin', {freshPlayers,userName : reJoiningPlayer.userName})
        socket.emit('rejoin_success', {
            status,
            currentRound,
            timeLeftInSecond,
            hint1,
            hint2,
            freshPlayers,
            currentCharacterUrl
        })
        console.log('Rejoin success : ',status,
            currentRound,
            timeLeftInSecond,
            timerEndsAt,
            hint1,
            hint2,
            freshPlayers,
            currentCharacterUrl)
        await socket.join(roomId)
        //emit success with room snapshot(status,currentanswer,timerendsat... etc) as payload
    })
}

export const syncIntermissionData = (io: Server, socket: Socket) => {
    socket.on('sync_intermission_data', async (data: { userId: string }) => {
        const { userId } = data
        const roomId = await redis.get(`user_to_room:${userId}`)
        const roomKey = `room:${roomId}`
        const status = await redis.hget(roomKey, 'status')
        if (status !== 'intermission') {
            return
        }
        //showleaderboard for client (answer and players)
        const currentAnswer = await redis.hget(roomKey, 'currentAnswer')
        const currentCharacterName = await redis.hget(roomKey, 'currentCharacterName')
        const alternateName: string[] = JSON.parse(await redis.hget(roomKey, 'alternateAnswer') as string)
        const currentCharacterUrl = await redis.hget(roomKey, 'currentCharacterUrl')
        const playersRaw = await redis.hgetall(`${roomKey}:players`);

        // Object.entries splits the hash into an array of tuples: [userIdKey, stringifiedPlayerValue]
        const playersList = Object.entries(playersRaw).map(([userId, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);

            return {
                ...parsedPlayer,
                userId: userId // Injects the Redis hash field key inside the object
            };
        });
        const sortedPlayers = playersList.sort((a, b) => b.score - a.score);

        // 4. Map into your precise IntermissionData contract layout structure
        const turnScores = sortedPlayers.map((player) => ({
            userId: player.socketId, // Mapping socketId or unique key as userId boundary
            userName: player.userName,
            avatarId: player.avatarId,
            pointsGained: player.turnScore,
            totalScore: player.score
        }));

        const intermissionPayload = {
            correctAnswer: currentCharacterName,
            alternateNames: alternateName,
            imageUrl: currentCharacterUrl,
            turnScores // Sent fully ordered from highest to lowest score
            //here add the anime name also
        };

        // 5. Transmit the payload matrix down the socket pipes
        socket.emit('intermission_data_synced', intermissionPayload);
    })
}

export const syncEndGameData = (io: Server, socket: Socket) => {
    socket.on('sync_ended_data', async (data: { userId: string }) => {
        const { userId } = data
        const roomId = await redis.get(`user_to_room:${userId}`)
        const roomKey = `room:${roomId}`
        const status = await redis.hget(roomKey, 'status')
        if (status !== 'ended') {
            return
        }
        const playersRaw = await redis.hgetall(`${roomKey}:players`);
        const playersList = Object.entries(playersRaw).map(([userId, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);
            return {
                ...parsedPlayer,
                userId: userId // Injects the Redis hash field key inside the object
            };
        });

        // 2. SORTING MECHANISM: Sort descending high-to-low based on overall total points
        const sortedFinalStandings = playersList.sort((a, b) => b.score - a.score);

        // 3. Map into the final leaderboard array tracking explicit placement numerical ranks
        const finalLeaderboard = sortedFinalStandings.map((player, index) => ({
            userId: player.socketId,
            userName: player.userName,
            avatarId: player.avatarId,
            totalScore: player.score,
            rank: index + 1,// Loop index index tracking placement values (1st, 2nd, 3rd...)
            hasReadiedUp: false,
        }));

        const endGamePayload = {
            finalLeaderboard
        };
        return socket.emit('ended_data_synced', endGamePayload)
    })
}

export const handlePlayerPermanentlyLeft = async (io: Server, userId: string) => {
    try {
        const roomId = await redis.get(`user_to_room:${userId}`) as string
        const roomKey = `room:${roomId}`;
        const playersHashKey = `${roomKey}:players`;
        const roomExists = await redis.exists(roomKey);
        if (!roomExists) return;
        const [adminId, playersRaw] = await Promise.all([
            redis.hget(roomKey, 'adminId'),
            redis.hgetall(playersHashKey)
        ]);
        const targetPlayerRaw = playersRaw[userId];
        if (!targetPlayerRaw) {
            return
        }
        const playerToBeRemoved: IPlayers = JSON.parse(targetPlayerRaw);
        const isAdmin = adminId === playerToBeRemoved.socketId;
        let newAdminUserName = "";
        if (isAdmin) {
            const nextHost = Object.values(playersRaw)
                .map((p) => JSON.parse(p) as IPlayers)
                .find((p) => p.socketId !== playerToBeRemoved.socketId);

            if (nextHost) {
                await redis.hset(roomKey, 'adminId', nextHost.socketId);
                newAdminUserName = nextHost.userName;
            }
        }
        await Promise.all([
            redis.hdel(playersHashKey, userId),
            redis.srem(`${roomKey}:taken_avatars`, playerToBeRemoved.avatarId),
            redis.del(`user_to_room:${userId}`),
            redis.del(`socket_to_user:${playerToBeRemoved.socketId}`)
        ]);
        delete playersRaw[userId];
        const remainingPlayerCount = Object.keys(playersRaw).length;
        if (remainingPlayerCount === 0) {
            await redis.del(roomKey, playersHashKey, `${roomKey}:taken_avatars`);
            return
        }
        const freshPlayers: IPlayers[] = Object.values(playersRaw).map((p) => JSON.parse(p));
        io.to(roomId).emit('room_state_update', freshPlayers);
        io.to(roomId).emit('player_leaved', {
            isAdmin,
            newAdminUserName,
            userName: playerToBeRemoved.userName,
            roomId
        });
    } catch (error) {
        console.log("Error in permanently lefting player : ", error)
    }
}

export const leaveRoom = (io: Server, socket: Socket) => {
    //roomexists
    //adminId
    //if one player only disband room
    //if admin : pick random from players(except userId) room adminId,
    //for both admin&non-admin : remove from players,and also its taken avatar
    //emit room_state_update,leave_success,player_leaved{isAdmin,newAdminUserName,userName}
    socket.on('leave_room', async (data: {
        roomId: string,
        userId: string
    }) => {
        try {
            const { roomId, userId } = data;
            const roomKey = `room:${roomId}`;
            const playersHashKey = `${roomKey}:players`;
            const roomExists = await redis.exists(roomKey);
            if (!roomExists) return;
            const [adminId, playersRaw] = await Promise.all([
                redis.hget(roomKey, 'adminId'),
                redis.hgetall(playersHashKey)
            ]);
            const targetPlayerRaw = playersRaw[userId];
            if (!targetPlayerRaw) {
                return socket.emit('game_error', { message: "Player profile not discovered in this channel" });
            }
            const playerToBeRemoved: IPlayers = JSON.parse(targetPlayerRaw);
            const isAdmin = adminId === socket.id;
            let newAdminUserName = "";
            if (isAdmin) {
                const nextHost = Object.values(playersRaw)
                    .map((p) => JSON.parse(p) as IPlayers)
                    .find((p) => p.socketId !== socket.id);

                if (nextHost) {
                    await redis.hset(roomKey, 'adminId', nextHost.socketId);
                    newAdminUserName = nextHost.userName;
                }
            }
            await Promise.all([
                redis.hdel(playersHashKey, userId),
                redis.srem(`${roomKey}:taken_avatars`, playerToBeRemoved.avatarId),
                redis.del(`user_to_room:${userId}`),
                redis.del(`socket_to_user:${socket.id}`)
            ]);
            delete playersRaw[userId];
            const remainingPlayerCount = Object.keys(playersRaw).length;
            if (remainingPlayerCount === 0) {
                await redis.del(roomKey, playersHashKey, `${roomKey}:taken_avatars`);
                await socket.leave(roomId)
                return
            }
            const freshPlayers: IPlayers[] = Object.values(playersRaw).map((p) => JSON.parse(p));
            socket.to(roomId).emit('room_state_update', freshPlayers);
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
    })
}

export const disbandRoom = (io: Server, socket: Socket) => {
    socket.on('disband_room', async (data: { roomId: string }) => {
        try {
            const { roomId } = data
            const roomKey = `room:${roomId}`
            const playersHashKey = `${roomKey}:players`
            const adminId = await redis.hget(roomKey, 'adminId')
            if (adminId !== socket.id) {
                return socket.emit('game_error', { message: "Unable to disband room" })
            }
            const totalRosterRaw = await redis.hgetall(playersHashKey);
            if (totalRosterRaw) {
                // 2. Iterate through every player entry to extract active vectors
                for (const [userId, playerRaw] of Object.entries(totalRosterRaw)) {
                    const player = JSON.parse(playerRaw);
                    const socketId = player.socketId;

                    // 3. Clear inverse lookups for this specific player
                    if (socketId) {
                        await redis.del(`socket_to_user:${socketId}`);
                    }
                    await redis.del(`user_to_room:${userId}`);
                    await redis.del(roomKey, `${roomKey}:players`, `${roomKey}:taken_avatars`)
                }
            }
            io.to(roomId).emit('room_disbanded')
            io.in(roomId).socketsLeave(roomId);
        } catch (error) {
            console.log("Error in disbanding room : ", error)
            socket.emit('game_error', { message: "Unable to disband room" })
        }
    })
}

export const playAgainToggle = (io: Server, socket: Socket) => {
    socket.on('play_again_toggle', async (data: { roomId: string, socketId: string }) => {
        const { roomId, socketId } = data
        console.log("Play again toggle listeners (backend)", socketId, roomId)
        const roomKey = `room:${roomId}`
        let userName = ""
        const allPlayersRaw = await redis.hgetall(`${roomKey}:players`)
        for (const [userId, playerStr] of Object.entries(allPlayersRaw)) {
            const player: IPlayers = JSON.parse(playerStr)
            if (player.socketId === socketId) {
                userName = player.userName
            }
        }
        console.log("Emit play again toggle success (backend)", socketId, userName)
        io.to(roomId).emit('play_again_toggle_success', { socketId, userName })
    })
}

export const playAgain = (io: Server, socket: Socket) => {
    //roomId
    //in end game empty roaster means player or make everyone offline (any other way)
    //join the player in the room with same url
    socket.on('play_again', async (data: { roomId: string }) => {
        try {
            const { roomId } = data
            const roomKey = `room:${roomId}`
            const adminId = await redis.hget(roomKey, 'adminId')
            const status = await redis.hget(roomKey, 'status')
            if (status !== 'ended') {
                return
            }
            if (socket.id !== adminId) {
                return socket.emit('game_error', { message: 'Only host can change status to lobby' })
            }
            //reset players,room
            await redis.hset(roomKey, {
                currentRound: '',
                currentTurn: '',
                status: 'lobby',
                currentCharacterName: '',
                currentCharacterUrl: '',
                currentAnswer: '',
                alternateAnswer: JSON.stringify([]), // ◄ Explicitly make this "[]" instead of letting it convert to ""
                hint1: '',
                hint2: '',
                hint1Revealed: 'false', // ◄ Good practice to make these explicit strings too!
                hint2Revealed: 'false',
                timerEndsAt: '',
            })
            const allPlayersRaw = await redis.hgetall(`${roomKey}:players`)
            for (const [userId, profileStr] of Object.entries(allPlayersRaw)) {
                const profile: IPlayers = JSON.parse(profileStr)
                profile.hasGuessed = false,
                    profile.turnScore = 0,
                    profile.score = 0
                await redis.hset(`${roomKey}:players`, userId, JSON.stringify(profile))
            }
            const resetedAllPlayersRaw = await redis.hgetall(`${roomKey}:players`)
            const resetedAllPlayers: IPlayers[] = Object.values(resetedAllPlayersRaw).map((p) => JSON.parse(p))
            return io.to(roomId).emit('play_again_success', resetedAllPlayers)
        } catch (error) {
            console.log("Couldn't reset the game : ", error)
            return socket.emit('game_error', { message: "Couldn't reset the game" })
        }
    })
}

export const kickPlayer = (io: Server, socket: Socket) => {
    socket.on('kick_player', async (data: {
        roomId: string;
        targetSocketId: string
    }) => {
        try {
            const { roomId, targetSocketId } = data
            const roomKey = `room:${roomId}`
            //check isadmin
            const adminId = await redis.hget(roomKey, 'adminId')
            if (socket.id !== adminId) {
                return socket.emit('game_error', { message: "Only host can kick players" })
            }
            //check status lobby
            const status = await redis.hget(roomKey, 'status')
            if (status !== 'lobby') {
                return socket.emit("game_error", { message: "Kicking players is disabled mid-game!" });
            }
            let kickedPlayerUserName = "";
            let targetUserId = "";
            let targetAvatarId: number | null = null;

            // 3. Scan the hash map to isolate the matching profile matching the socket target
            const playersRaw = await redis.hgetall(`${roomKey}:players`);
            for (const [userId, playerStr] of Object.entries(playersRaw)) {
                const currentPlayer: IPlayers = JSON.parse(playerStr);

                if (currentPlayer.socketId === targetSocketId) {
                    kickedPlayerUserName = currentPlayer.userName;
                    targetUserId = userId;
                    targetAvatarId = currentPlayer.avatarId;
                    break; // Target identified, break loop early
                }
            }

            // 4. Fallback safeguard if the target socket is already missing or unindexed
            if (!targetUserId) {
                return socket.emit("game_error", { message: "Player not found in active lobby memory." });
            }

            // 5. Atomic database extraction cleanups
            // Remove user from the Redis room players hash map registry
            await redis.hdel(`${roomKey}:players`, targetUserId);

            // Clean up the unique socket tracker mapping key
            await redis.del(`socket_to_user:${targetSocketId}`)
            await redis.del(`user_to_room:${targetUserId}`)

            // Free up the player's avatar slot so other incoming applicants can claim it
            if (targetAvatarId !== null) {
                await redis.srem(`${roomKey}:taken_avatars`, targetAvatarId);
            }
            //target socket leave the roomId

            // 6. Alert the kicked client immediately so they get redirected to the homepage
            io.to(targetSocketId).emit("kicked_from_room");

            // Force the disconnected socket pipeline instance to disconnect or drop room channels
            const targetSocketInstance = io.sockets.sockets.get(targetSocketId);
            if (targetSocketInstance) {
                targetSocketInstance.leave(roomId);
            }

            // 7. Extract the updated roster array and broadcast updates + notice to remaining participants
            const remainingPlayersRaw = await redis.hgetall(`${roomKey}:players`);
            const freshRoster: IPlayers[] = Object.values(remainingPlayersRaw).map((v) => JSON.parse(v));

            // Synchronize the room UI list configuration instantly
            io.to(roomId).emit("room_state_update", freshRoster);

            // Print the clean system notice to the chat feed log matrix
            io.to(roomId).emit("feed_message", {
                userName: "SYSTEM",
                systemMsg: true,
                message: `${kickedPlayerUserName} was kicked by the host.`
            })
        } catch (error) {
            if (error instanceof Error) {
                console.log("Internal server error unable to kick : ", error.message)
                return socket.emit('game_error', { message: 'Internal server error unable to kick' })
            }
        }
    })
}

export const handlePlayerGuess = (io: Server, socket: Socket) => {
    socket.on('submit_guess', async (data: {
        roomId: string,
        userId: string,
        guess: string
    }) => {
        try {
            //room status playing (check)
            const { roomId, userId, guess } = data
            const roomKey = `room:${roomId}`
            const status = await redis.hget(roomKey, 'status')
            if (status === 'intermission' || status === 'ended') {
                return
            }
            console.log("Inside submit guess guess is :", guess)
            const playerRaw = await redis.hget(`${roomKey}:players`, userId)
            if (!playerRaw) return;
            const player: IPlayers = JSON.parse(playerRaw);
            // Block submissions if player already guessed correctly
            //check guess is right or wrong
            const answer = await redis.hget(roomKey, 'currentCharacterName')
            console.log("Inside submit guess and answer is : ", answer)
            const alternateAnswer: string[] = JSON.parse(await redis.hget(roomKey, 'alternateAnswer') as string)
            const cleanedGuess = guess.trim().toLowerCase()
            const isCorrect = guess.trim() === '' ? false : cleanedGuess === answer || alternateAnswer.includes(cleanedGuess)
            //right: cal turnscore set hash hasguessed,turnscore,score emit feed_message
            if (isCorrect && !player.hasGuessed) {
                const timerEndsAtStr = await redis.hget(roomKey, "timerEndsAt") || "0";
                const timeLeftMs = parseInt(timerEndsAtStr) - Date.now();
                const secondsLeft = Math.max(0, Math.floor(timeLeftMs / 1000));
                if (secondsLeft === 0) {
                    return
                }
                const earnedTurnScore = 100 + secondsLeft * 8
                player.hasGuessed = true
                player.turnScore = earnedTurnScore
                player.score += earnedTurnScore
                await redis.hset(`${roomKey}:players`, userId, JSON.stringify(player))
                io.to(roomId).emit('feed_message', {
                    userName: "SYSTEM",
                    systemMsg: true,
                    message: `${player.userName} guessed the character correctly! 🎉 +${earnedTurnScore} pts`
                })
                const allPlayersRaw = await redis.hgetall(`${roomKey}:players`)
                const allPlayers: IPlayers[] = Object.values(allPlayersRaw).map((p) => JSON.parse(p))
                //emit room_state_update
                io.to(roomId).emit('room_state_update', allPlayers)
                //if all answer end timer
                const totalOnlinePlayers = allPlayers.filter(p => p.isOnline).length;
                const totalGuessedCorrectly = allPlayers.filter(p => p.hasGuessed && p.isOnline).length;

                if (totalGuessedCorrectly >= totalOnlinePlayers) {
                    await endTurnIntermission(io, roomId);
                }
            }
            else if (!isCorrect) {
                //wrong emit feed_message : guess
                io.to(roomId).emit('feed_message', {
                    userName: player.userName,
                    systemMsg: false,
                    message: guess.trim()
                })
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log("Failed to parse incoming player guess stream:", error.message)
            }
        }
    })
}

export const endTurnIntermission = async (io: Server, roomId: string) => {
    //current status not playing
    const roomKey = `room:${roomId}`
    const status = await redis.hget(roomKey, 'status')
    if (status !== 'playing') {
        return
    }
    //set status intermission
    await redis.hset(roomKey, { status: 'intermission' })
    //showleaderboard for client (answer and players)
    const currentAnswer = await redis.hget(roomKey, 'currentAnswer')
    const currentCharacterName = await redis.hget(roomKey, 'currentCharacterName')
    const alternateName: string[] = JSON.parse(await redis.hget(roomKey, 'alternateAnswer') as string)
    const currentCharacterUrl = await redis.hget(roomKey, 'currentCharacterUrl')
    const playersRaw = await redis.hgetall(`${roomKey}:players`);

    // Object.entries splits the hash into an array of tuples: [userIdKey, stringifiedPlayerValue]
    const playersList = Object.entries(playersRaw).map(([userId, playerStr]) => {
        const parsedPlayer = JSON.parse(playerStr);

        return {
            ...parsedPlayer,
            userId: userId // Injects the Redis hash field key inside the object
        };
    });
    const sortedPlayers = playersList.sort((a, b) => b.score - a.score);

    // 4. Map into your precise IntermissionData contract layout structure
    const turnScores = sortedPlayers.map((player) => ({
        userId: player.socketId, // Mapping socketId or unique key as userId boundary
        userName: player.userName,
        avatarId: player.avatarId,
        pointsGained: player.turnScore,
        totalScore: player.score
    }));

    const intermissionPayload = {
        correctAnswer: currentCharacterName,
        alternateNames: alternateName,
        imageUrl: currentCharacterUrl,
        turnScores // Sent fully ordered from highest to lowest score
        //here add the anime name also
    };

    // 5. Transmit the payload matrix down the socket pipes
    io.to(roomId).emit('round_intermission_start', intermissionPayload);
    //hold for 4 sec and loadnextround()
    setTimeout(async () => {
        const verifyStatus = await redis.hget(roomKey, "status");
        if (verifyStatus === "intermission") {
            await loadNextRound(io, roomId);
        }
    }, 9000);
}

export const runRoundTimerLoop = (io: Server, roomId: string, roundId: number, turnId: number) => {
    const timeInterval = setInterval(async () => {
        const roomKey = `room:${roomId}`
        //check safety status lobby,currentround correct
        const status = await redis.hget(roomKey, 'status')
        const currentRound = parseInt(await redis.hget(roomKey, 'currentRound') as string)
        const currentTurn = parseInt(await redis.hget(roomKey, 'currentTurn') as string)
        const isSafe = status === 'playing' && currentRound === roundId && currentTurn === turnId
        if (!isSafe) {
            clearInterval(timeInterval)
            return
        }
        //timeleft in sec
        const guessTime = parseInt(await redis.hget(roomKey, 'guessTime') as string)
        const timerEndsAt = parseInt(await redis.hget(roomKey, 'timerEndsAt') as string)
        const timeLeft = timerEndsAt - Date.now()
        const timeLeftInSecond = timeLeft / 1000
        //timerEnd (emdTurnIntermission)
        if (timeLeft <= 0) {
            clearInterval(timeInterval)
            return endTurnIntermission(io, roomId)
        }
        //hint emit io
        if (timeLeftInSecond <= (2 / 3) * guessTime) {
            const ishint1Revealed = (await redis.hget(roomKey, 'hint1Revealed')) === 'true';
            if (!ishint1Revealed) {
                io.to(roomId).emit('hint_reveal', { id: 1, hint: await redis.hget(roomKey, 'hint1') })
            }
        }
        if (timeLeftInSecond <= guessTime / 3) {
            const ishint2Revealed = (await redis.hget(roomKey, 'hint2Revealed')) === 'true';
            if (!ishint2Revealed) {
                io.to(roomId).emit('hint_reveal', { id: 2, hint: await redis.hget(roomKey, 'hint2') })
            }
        }
        //timer tick
        io.to(roomId).emit('timer_tick', { timeLeftInSecond: Math.max(0, Math.floor(timeLeftInSecond)) })
    }, 1000)
}

export const loadNextRound = async (io: Server, roomId: string) => {
    //remove all the turn score of players ,hasguessed
    //queue pop char
    //if no chsr left end game
    //set char detail in roomKey hash,currentturn+1 ,(check if it is 6 make currentround+=1),timeEndsAt
    //delete feed
    //emit init
    //runtimer
    const roomKey = `room:${roomId}`
    const playerKey = `${roomKey}:players`
    const queueKey = `${roomKey}:queue`
    const allPlayersRaw = await redis.hgetall(playerKey)
    for (const [userId, profileStr] of Object.entries(allPlayersRaw)) {
        const profile: IPlayers = JSON.parse(profileStr)
        profile.hasGuessed = false,
        profile.turnScore = 0
        await redis.hset(`${roomKey}:players`, userId, JSON.stringify(profile))
    }
    const resetedAllPlayersRaw = await redis.hgetall(`${roomKey}:players`)
    const resetedAllPlayers: IPlayers[] = Object.values(resetedAllPlayersRaw).map((p) => JSON.parse(p))
    io.to(roomId).emit('room_state_update', resetedAllPlayers)
    const nextCharacterRaw = await redis.lpop(queueKey)
    if (!nextCharacterRaw) {
        await redis.hset(roomKey, { status: "ended" });
        const playersRaw = await redis.hgetall(`${roomKey}:players`);
        const playersList = Object.entries(playersRaw).map(([userId, playerStr]) => {
            const parsedPlayer = JSON.parse(playerStr);
            return {
                ...parsedPlayer,
                userId: userId // Injects the Redis hash field key inside the object
            };
        });

        // 2. SORTING MECHANISM: Sort descending high-to-low based on overall total points
        const sortedFinalStandings = playersList.sort((a, b) => b.score - a.score);

        // 3. Map into the final leaderboard array tracking explicit placement numerical ranks
        const finalLeaderboard = sortedFinalStandings.map((player, index) => ({
            userId: player.socketId,
            userName: player.userName,
            avatarId: player.avatarId,
            totalScore: player.score,
            rank: index + 1,// Loop index index tracking placement values (1st, 2nd, 3rd...)
            hasReadiedUp: false,
        }));

        const endGamePayload = {
            finalLeaderboard
        };
        return io.to(roomId).emit('game_ended', endGamePayload)
    }
    const nextCharacter: ICharacter = JSON.parse(nextCharacterRaw as string)
    // console.log("I am inside load next round backend current character : ", nextCharacter)
    const currentRound = parseInt(await redis.hget(roomKey, 'currentRound') as string)
    const currentTurn = parseInt(await redis.hget(roomKey, 'currentTurn') as string)
    const imagesInOneRound = parseInt(await redis.hget(roomKey, 'imagesInOneRound') as string)
    const guessTime = parseInt(await redis.hget(roomKey, 'guessTime') as string)
    let nextRound = currentRound
    let nextTurn = currentTurn + 1
    if (nextTurn === imagesInOneRound) {
        nextTurn = 0
        nextRound += 1
    }
    const roundDurationMs = (guessTime) * 1000
    const timerEndsAt = Date.now() + roundDurationMs;
    await redis.hset(roomKey, {
        currentRound: nextRound.toString(),
        currentTurn: nextTurn.toString(),
        currentCharacterName: nextCharacter.characterName.toString(),
        currentCharacterUrl: nextCharacter.imageUrl.toString(),
        currentAnswer: nextCharacter.animeNameEnglish.toString(),
        alternateAnswer: JSON.stringify(nextCharacter.alternateName.map((a) => a.toLowerCase())), // ◄ Explicitly make this "[]" instead of letting it convert to ""
        hint1: nextCharacter.hint1.toString(),
        hint2: nextCharacter.hint2.toString(),
        hint1Revealed: 'false',
        hint2Revealed: 'false',
        timerEndsAt: timerEndsAt.toString()
    })
    await redis.del(`${roomKey}:feed`)
    await redis.hset(roomKey, { status: 'playing' })
    io.to(roomId).emit("round_init", {
        currentRound: nextRound,
        currentTurn: nextTurn,
        imageUrl: nextCharacter.imageUrl,
        timerEndsAt,
        players: Object.values(await redis.hgetall(playerKey)).map((p) => JSON.parse(p))
    });
    runRoundTimerLoop(io, roomId, nextRound, nextTurn)
}

export const startGame = (io: Server, socket: Socket) => {
    socket.on('start_game', async (data: {
        roomId: string
    }) => {
        //room exists
        //isadmin
        //islobby
        //fetch character from db and store in redis
        //remove old char queue
        //start status->playing currentround 0
        //loadnextRound
        //emit game_started
        try {
            const { roomId } = data
            const roomKey = `room:${roomId}`
            const roomExists = await redis.exists(roomKey)
            if (!Boolean(roomExists)) {
                return socket.emit('game_error', { message: 'Room does not exits' })
            }
            const adminId = await redis.hget(roomKey, 'adminId')
            const isAdmin = socket.id === adminId
            if (!isAdmin) {
                return socket.emit('game_error', { message: 'Only room host can start the game' })
            }
            const status = await redis.hget(roomKey, 'status')
            if (status !== 'lobby') {
                return
            }
            const totalRounds = await redis.hget(roomKey, 'totalRounds')
            const imagesInOneRound = await redis.hget(roomKey, 'imagesInOneRound')
            const noOfRequiredCharacters = Number(totalRounds) * Number(imagesInOneRound)
            //make this api
            const charactersPool: ICharacter[] = await Character.aggregate([{ $sample: { size: noOfRequiredCharacters } }]);
            if (charactersPool.length < noOfRequiredCharacters) {
                return socket.emit("game_error", { message: "Insufficient characters in database pool." });
            }
            const queueKey = `${roomKey}:queue`
            await redis.del(queueKey);
            for (const character of charactersPool) {
                await redis.rpush(queueKey, JSON.stringify(character))
            }
            await redis.hset(roomKey, { status: 'playing', currentRound: '1', currentTurn: '0' })
            io.to(roomId).emit("game_started");
            await loadNextRound(io, roomId);
        } catch (error) {
            if (error instanceof Error) {
                console.log("Game Start Crash Execution Error:", error.message)
                return socket.emit('game_error', { message: 'Game Start Crash Execution Error' })
            }
        }
    })
}

export const disconnect = (io: Server, socket: Socket) => {
    socket.on('disconnect', async (reason) => {
        //if socket to userId dont exist then no need to do anything
        const onHomePage = await redis.exists(`socket_to_user:${socket.id}`)
        if (onHomePage) return
        const userId = await redis.get(`socket_to_user:${socket.id}`) as string
        const roomId = await redis.get(`user_to_room:${userId}`) as string
        await redis.del(`socket_to_user:${socket.id}`)

        //store this userId from get socket to user id(redis)
        //roomid from user id to roomid
        //disconnection timer
        const playersHashKey = `room:${roomId}:players`;
        const playerRaw = await redis.hget(playersHashKey, userId);
        if (!playerRaw) return;

        const player: IPlayers = JSON.parse(playerRaw);

        // 3. Mark the player's vector state flag as "Away"
        player.isOnline = false;
        await redis.hset(playersHashKey, userId, JSON.stringify(player));
        io.to(roomId).emit('player_offline', { userId });
        disconnectionTimers[userId] = setTimeout(async () => {
            // Clear out references completely
            delete disconnectionTimers[userId];
            await handlePlayerPermanentlyLeft(io, userId)
        }, 8000);
        console.log(`❌ [SOCKET DETACHED] ID: ${socket.id} | Reason: ${reason}`)
    })
}