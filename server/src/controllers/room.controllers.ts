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
    isAdmin: boolean
}

export const createRoom = (io: Server, socket: Socket) => {
    socket.on('create_room', async (data: {
        userName: string;
        totalRounds: number;
        avatarId: number;
        userId: string
    }) => {
        try {
            console.log('Inside createroom socket backend')
            const { userName, totalRounds, avatarId, userId } = data
            if (!userName || !totalRounds || !avatarId) {
                return socket.emit('join_error', { message: 'Fill all the required fields' })
            }
            const roomId = Math.floor(Math.random() * 1000000).toString()
            await redis.hset(`room:${roomId}`, {
                roomId,
                totalRounds: totalRounds.toString(),
                currentRound: '0',
                currentTurn: '0',
                adminId: socket.id,
                status: 'lobby',
                currentCharacterName: '',
                currentCharacterUrl: '',
                currentAnswer: '',
                alternateAnswer: JSON.stringify([]), // ◄ Explicitly make this "[]" instead of letting it convert to ""
                hint1: '',
                hint2: '',
                hint1Revealed: 'false', // ◄ Good practice to make these explicit strings too!
                hint2Revealed: 'false',
                timerEndsAt: '0'
            })
            await redis.expire(`room:${roomId}`, 7200);
            const hostProfile: IPlayers = {
                userName,
                socketId: socket.id,
                avatarId,
                score: 0,
                turnScore: 0,
                hasGuessed: false,
                isOnline: true,
                isAdmin: true
            }
            await redis.hset(`room:${roomId}:players`, userId, JSON.stringify(hostProfile))
            await redis.set(`socket_to_room:${socket.id}`, roomId)
            await redis.sadd(`room:${roomId}:taken_avatars`, avatarId)
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
            const roomExists = await redis.exists(`room:${roomId}`)
            if (!Boolean(roomExists)) {
                return socket.emit('join_error', { message: 'Room Id is not valid' })
            }
            const roomStatus=await redis.hget(`room:${roomId}`,'status')
            if (roomStatus !== 'lobby') {
                return socket.emit('join_error', { message: 'Cannot join this room. The match has already started!' });
            }
            if (!userName || !avatarId || !roomId) {
                return socket.emit('join_error', { message: 'All fields are required' })
            }
            const avatarTaken = await redis.sadd(`room:${roomId}:taken_avatars`, avatarId)
            if (avatarTaken === 0) {
                return socket.emit('join_error', { message: 'Avatar is already taken' })
            }
            
            const joinerProfile: IPlayers = {
                userName,
                avatarId,
                socketId: socket.id,
                score: 0,
                turnScore: 0,
                hasGuessed: false,
                isOnline: true,
                isAdmin: false
            }
            await redis.set(`socket_to_room:${socket.id}`, roomId)
            await redis.hset(`room:${roomId}:players`, userId, JSON.stringify(joinerProfile))
            socket.join(roomId)
            const playersInRoomRaw = await redis.hgetall(`room:${roomId}:players`)
            const playersInRoom: IPlayers[] = Object.values(playersInRoomRaw).map((v) => JSON.parse(v as string))
            socket.emit("join_success", {
                roomId
            });
            io.to(roomId).emit('room_state_update', playersInRoom)
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
        rounds: number
    }) => {
        try {
            const { roomId, rounds } = data
            const roomKey = `room:${roomId}`
            //is exits
            const isExists = await redis.exists(roomKey)
            if (!Boolean(isExists)) {
                return socket.emit('config_error', { message: 'Room not exists' })
            }
            //check is admin
            const adminSocketId = await redis.hget(roomKey, 'adminId')
            const roomStatus = await redis.hget(roomKey, 'status')
            if (adminSocketId !== socket.id) {
                return socket.emit('config_error', { message: 'Only host can the room configuration' })
            }
            //check room status 
            if (roomStatus === 'playing' || roomStatus === 'intermission') {
                return socket.emit('config_error', { message: 'Cannot change the config mid-game' })
            }
            //change rounds
            await redis.hset(roomKey, 'totalRounds', rounds.toString())
            //emit config_updated
            return io.to(roomId).emit('config_updated', { totalRounds: rounds })
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in changing config', error.message)
                return socket.emit('config_error', { message: 'Error in changing config' })
            }
        }
    })
}

export const playAgain = (io: Server, socket: Socket) => {
    socket.on('play_again', async (data: {
        roomId: string
    }) => {
        try {
            const { roomId } = data
            //roomExists
            const roomExists = await redis.exists(`room:${roomId}`)
            if (!Boolean(roomExists)) {
                return;
            }
            //ishost
            const adminId = await redis.hget(`room:${roomId}`, 'adminId')
            if (adminId !== socket.id) {
                return;
            }
            //isended
            const roomStatus = await redis.hget(`room:${roomId}`, 'status')
            if (roomStatus !== 'ended') {
                return;
            }
            //room currentanswer,currentround,altername,status change
            await redis.hset(`room:${roomId}`, {
                currentCharacterName: '',
                currentCharacterUrl: '',
                currentAnswer: '',
                alternateAnswer: JSON.stringify([]), // ◄ Convert array to string
                currentRound: '0',
                status: 'lobby',
                hint1: '',
                hint2: '',
                hint1Revealed: 'false',           // ◄ Convert boolean to string
                hint2Revealed: 'false',         // ◄ Convert boolean to string
                timerEndsAt: '0'
            });
            //freshplayers
            const playersRaw = await redis.hgetall(`room:${roomId}:players`)
            for (const [userId, profileStr] of Object.entries(playersRaw)) {
                const profile: IPlayers = JSON.parse(profileStr as string)
                profile.score = 0;
                profile.turnScore = 0;
                profile.hasGuessed = false
                await redis.hset(`room:${roomId}`, userId, JSON.stringify(profile))
            }
            const freshPlayers: IPlayers[] = Object.values(await redis.hgetall(`room:${roomId}:players`)).map((v) => JSON.parse(v as string))
            //socket emit play again confirmed
            return io.to(roomId).emit('play_again_confirmed', freshPlayers)
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in playing again', error.message)
            }
        }
    })
}

// BACKEND: Add this export function right below your joinRoom controller block

export const syncRoomStateOnDemand = (io: Server, socket: Socket) => {
    socket.on('request_room_data', async (data: { roomId: string }) => {
        try {
            const { roomId } = data;
            if (!roomId) return;

            // 1. Force ensure the socket is joined to the Room channel path
            socket.join(roomId);

            // 2. Fetch the player list map from Redis
            const playersInRoomRaw = await redis.hgetall(`room:${roomId}:players`);
            if (!playersInRoomRaw || Object.keys(playersInRoomRaw).length === 0) return;

            const playersInRoom: IPlayers[] = Object.values(playersInRoomRaw).map(
                (v) => JSON.parse(v as string)
            );

            // 3. Emit ONLY to the requesting socket to sync their empty state arrays
            socket.emit('room_state_update', playersInRoom);
        } catch (error) {
            console.error('Error fetching on-demand snapshot:', error);
        }
    });
};