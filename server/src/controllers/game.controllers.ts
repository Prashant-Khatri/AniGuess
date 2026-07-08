import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import axios from "axios";
import { Character, ICharacter } from "../models/character.models.js";
import { IPlayers } from "./room.controllers.js";


// game_error
// kicked_from_room

export const playAgain=(io : Server,socket : Socket)=>{
    //roomId
    //in end game empty roaster means player or make everyone offline (any other way)
    //join the player in the room with same url
    socket.on('play_again',(data:{roomId : string})=>{
        const {roomId}=data
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
            await redis.del(`socket_to_room:${targetSocketId}`);

            // Free up the player's avatar slot so other incoming applicants can claim it
            if (targetAvatarId !== null) {
                await redis.srem(`${roomKey}:taken_avatars`, targetAvatarId);
            }

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
            if (status==='intermission' || status==='ended') {
                return
            }
            console.log("Inside submit guess guess is :",guess)
            const playerRaw = await redis.hget(`${roomKey}:players`, userId)
            if (!playerRaw) return;
            const player: IPlayers = JSON.parse(playerRaw);
            // Block submissions if player already guessed correctly
            //check guess is right or wrong
            const answer = await redis.hget(roomKey, 'currentCharacterName')
            console.log("Inside submit guess and answer is : ",answer)
            const alternateAnswer: string[] = JSON.parse(await redis.hget(roomKey, 'alternateAnswer') as string)
            const cleanedGuess = guess.trim().toLowerCase()
            const isCorrect = guess.trim()==='' ? false : cleanedGuess === answer || alternateAnswer.includes(cleanedGuess)
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
            } else {
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
        const guessTime=parseInt(await redis.hget(roomKey,'guessTime') as string)
        const timerEndsAt = parseInt(await redis.hget(roomKey, 'timerEndsAt') as string)
        const timeLeft = timerEndsAt - Date.now()
        const timeLeftInSecond = timeLeft / 1000
        //timerEnd (emdTurnIntermission)
        if (timeLeft <= 0) {
            clearInterval(timeInterval)
            return endTurnIntermission(io, roomId)
        }
        //hint emit io
        if (timeLeftInSecond <= (2/3)*guessTime) {
            const ishint1Revealed = (await redis.hget(roomKey, 'hint1Revealed')) === 'true';
            if (!ishint1Revealed) {
                io.to(roomId).emit('hint_reveal', { id: 1, hint: await redis.hget(roomKey, 'hint1') })
            }
        }
        if (timeLeftInSecond <= guessTime/3) {
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
        console.log("New profile for next round",profile)
        await redis.hset(`${roomKey}:players`,userId,JSON.stringify(profile))
    }
    const resetedAllPlayersRaw = await redis.hgetall(`${roomKey}:players`)
    const resetedAllPlayers: IPlayers[] = Object.values(resetedAllPlayersRaw).map((p) => JSON.parse(p))
    console.log("Ab me krne wala hu reset : ",resetedAllPlayers)
    io.to(roomId).emit('room_state_update',resetedAllPlayers)
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
            rank: index + 1 // Loop index index tracking placement values (1st, 2nd, 3rd...)
        }));

        const endGamePayload = {
            finalLeaderboard
        };
        return io.to(roomId).emit('game_ended',endGamePayload)
    }
    const nextCharacter: ICharacter = JSON.parse(nextCharacterRaw as string)
    console.log("I am inside load next round backend current character : ",nextCharacter)
    const currentRound = parseInt(await redis.hget(roomKey, 'currentRound') as string)
    const currentTurn = parseInt(await redis.hget(roomKey, 'currentTurn') as string)
    const imagesInOneRound=parseInt(await redis.hget(roomKey, 'imagesInOneRound') as string)
    const guessTime=parseInt(await redis.hget(roomKey, 'guessTime') as string)
    let nextRound = currentRound
    let nextTurn = currentTurn + 1
    if (nextTurn === imagesInOneRound) {
        nextTurn = 0
        nextRound += 1
    }
    const roundDurationMs = (guessTime)*1000
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
    await redis.hset(roomKey,{status : 'playing'})
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
            const totalRounds=await redis.hget(roomKey,'totalRounds')
            const imagesInOneRound=await redis.hget(roomKey,'imagesInOneRound')
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