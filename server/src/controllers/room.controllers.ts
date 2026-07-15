import { redis } from "../config/redis.js";
import { Socket, Server } from "socket.io"

export interface IPlayers {
    userName: string;
    socketId: string;
    avatarId: number;
    score: number;
    turnScore: number;
    hasGuessed: boolean;
    isOnline: boolean;
    isAdmin: boolean;
    hasReadiedUp : boolean
}

export const createRoom = (io: Server, socket: Socket) => {
    socket.on('create_room', async (data: {
        userName: string;
        avatarId: number;
        userId: string
    }) => {
        try {
            const { userName, avatarId, userId } = data
            if (!userName || !avatarId || !userId) {
                return socket.emit('join_error', { message: 'Fill all the required fields' })
            }
            const roomId = Math.floor(100000 + Math.random() * 900000).toString();
            const roomKey=`room:${roomId}`
            const playersHashKey=`${roomKey}:players`
            const takenAvatarsKey=`${roomKey}:taken_avatars`
            const socketToUserKey=`socket_to_user:${socket.id}`
            const userToRoomKey=`user_to_room:${userId}`
            const hostProfile: IPlayers = {
                userName,
                socketId: socket.id,
                avatarId,
                score: 0,
                turnScore: 0,
                hasGuessed: false,
                isOnline: true,
                isAdmin: true,
                hasReadiedUp : false
            }
            const pipeline=redis.pipeline()
            pipeline.hset(`room:${roomId}`, {
                roomId,
                totalRounds: '3',
                currentRound: '',
                currentTurn: '',
                adminId: socket.id,
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
                imagesInOneRound: '5',
                guessTime: '20',
                maxPlayers: '8'
            })
            pipeline.expire(roomKey, 86400);
            pipeline.hset(playersHashKey, userId, JSON.stringify(hostProfile))
            pipeline.set(userToRoomKey, roomId)
            pipeline.set(socketToUserKey, userId)
            pipeline.sadd(takenAvatarsKey, avatarId)
            pipeline.expire(userToRoomKey, 86400);
            pipeline.expire(socketToUserKey, 86400)
            pipeline.expire(playersHashKey, 86400);
            pipeline.expire(takenAvatarsKey, 86400);
            const result=await pipeline.exec()
            if(!result){
                socket.emit('join_error', { message: 'Internal server error during room provisioning.' })
            }
            socket.join(roomId)
            socket.emit('room_created', { roomId })
            io.to(roomId).emit('room_state_update', [hostProfile]);
        } catch (error) {
            if (error instanceof Error) {
                console.log('Failed to create room : ', error.message)
                socket.emit('join_error', { message: 'Internal server error during room provisioning.' })
            }
        }
    })
}

export const joinRoom = (io: Server, socket: Socket) => {
    socket.on('join_room', async (data: {
        userName: string;
        avatarId: number;
        roomId: string;
        userId: string
    }) => {
        try {
            const { userName, avatarId, roomId, userId } = data
            if (!userName || !avatarId || !roomId) {
                return socket.emit('join_error', { message: 'All fields are required' })
            }
            const roomKey = `room:${roomId}`
            const playerHashKey=`${roomKey}:players`
            const takenAvatarsKey=`${roomKey}:taken_avatars`
            const socketToUserKey=`socket_to_user:${socket.id}`
            const userToRoomKey=`user_to_room:${userId}`
            const pipeline1=redis.pipeline()
            pipeline1.exists(roomKey)
            pipeline1.hmget(
                roomKey,
                'status',
                'maxPlayers',
                'guessTime',
                'imagesInOneRound',
                'totalRounds'
            )
            pipeline1.sismember(takenAvatarsKey, avatarId)
            pipeline1.hgetall(playerHashKey);
            const result=await pipeline1.exec()
            if(!result){
                return socket.emit('join_error', { message: 'Internal server error during room joining.' })
            }
            const roomExists=result[0][1] as number
            if (!roomExists) {
                return socket.emit('join_error', { message: 'Room Id is not valid' })
            }
            const roomFields=result[1][1] as (string | null)[]
            const roomStatus=roomFields[0]
            const maxPlayersRaw=roomFields[1]
            const guessTimeRaw=roomFields[2]
            const imagesInOneRoundRaw=roomFields[3]
            const totalRoundsRaw=roomFields[4]
            const avatarTaken=result[2][1] as number
            const players=result[3][1] as Record<string,string> || {}
            if (roomStatus !== 'lobby') {
                return socket.emit('join_error', { message: 'Cannot join this room. The match has already started!' });
            }
            if (avatarTaken === 1) {
                return socket.emit('join_error', { message: 'Avatar is already taken' })
            }
            const currentPlayerCount = players ? Object.keys(players).length : 0;
            const parsedMaxPlayers = Number(maxPlayersRaw) || 0;
            if (currentPlayerCount >= parsedMaxPlayers) {
                return socket.emit('join_error', { message: 'Room Is Full' });
            }
            const pipeline2=redis.pipeline()
            const joinerProfile: IPlayers = {
                userName,
                avatarId,
                socketId: socket.id,
                score: 0,
                turnScore: 0,
                hasGuessed: false,
                isOnline: true,
                isAdmin: false,
                hasReadiedUp : false
            }
            players[userId]=JSON.stringify(joinerProfile)
            pipeline2.set(userToRoomKey, roomId)
            pipeline2.set(socketToUserKey, userId)
            pipeline2.expire(userToRoomKey, 86400);
            pipeline2.expire(socketToUserKey, 86400)
            pipeline2.hset(playerHashKey, userId, JSON.stringify(joinerProfile))
            await pipeline2.exec()
            socket.join(roomId)
            const playersInRoom: IPlayers[] = Object.values(players).map((v) => JSON.parse(v as string))
            const maxPlayers = maxPlayersRaw ? parseInt(maxPlayersRaw, 10) : 8;
            const guessTime = guessTimeRaw ? parseInt(guessTimeRaw, 10) : 30;
            const imagesInOneRound = imagesInOneRoundRaw ? parseInt(imagesInOneRoundRaw, 10) : 3;
            const totalRounds = totalRoundsRaw ? parseInt(totalRoundsRaw, 10) : 5;
            socket.emit("join_success", {
                roomId,
                time: guessTime,
                images: imagesInOneRound,
                rounds: totalRounds,
                players: maxPlayers
            });
            io.to(roomId).emit('room_state_update', playersInRoom)
            socket.to(roomId).emit('player_joined', { userName });
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in joining room', error.message)
                socket.emit('join_error', { message: 'Internal server error during room joining.' })
            }
        }
    })
}

export const changeRoomConfig = (io: Server, socket: Socket) => {
    socket.on('change_config', async (data: {
        roomId: string;
        key: string;
        value: number;
    }) => {
        try {
            const { roomId, key, value } = data
            const roomKey = `room:${roomId}`
            const pipeline=redis.pipeline()
            pipeline.exists(roomKey)
            pipeline.hmget(
                roomKey,
                'status',
                'adminId'
            )
            const result=await pipeline.exec()
            if(!result){
                return socket.emit('config_error', { message: 'Error in changing config' });
            }
            const isExists=result[0][1] as number
            if (!isExists) {
                return socket.emit('config_error', { message: 'Room not exists' })
            }
            const roomFields=result[1][1] as (string | null)[]
            const roomStatus = roomFields[0]
            if (roomStatus !== 'lobby') {
                return socket.emit('config_error', { message: 'Cannot change the config mid-game' })
            }
            const adminSocketId=roomFields[1]
            if (adminSocketId !== socket.id) {
                return socket.emit('config_error', { message: 'Only host can change the room configuration' })
            }
            await redis.hset(roomKey, key, value.toString())
            io.to(roomId).emit('config_updated', { key, value })
            return socket.to(roomId).emit('feed_message', {
                userName: "SYSTEM",
                systemMsg: true,
                message: `${key} set to ${value}`
            })
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in changing config', error.message)
                return socket.emit('config_error', { message: 'Error in changing config' })
            }
        }
    })
}

export const syncRoomStateOnDemand = (io: Server, socket: Socket) => {
    socket.on('request_room_data', async (data: { roomId: string }) => {
        try {
            const { roomId } = data;
            if (!roomId) return;
            socket.join(roomId);
            const playersInRoomRaw = await redis.hgetall(`room:${roomId}:players`);
            if (!playersInRoomRaw || Object.keys(playersInRoomRaw).length === 0) return;
            const playersInRoom: IPlayers[] = Object.values(playersInRoomRaw).map(
                (v) => JSON.parse(v as string)
            );
            socket.emit('room_state_update', playersInRoom);
        } catch (error) {
            console.error('Error fetching on-demand snapshot:', error);
        }
    });
};