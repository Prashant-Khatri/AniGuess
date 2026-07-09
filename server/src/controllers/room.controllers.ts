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
        avatarId: number;
        userId: string
    }) => {
        try {
            console.log('Inside createroom socket backend')
            const { userName, avatarId, userId } = data
            if (!userName || !avatarId) {
                return socket.emit('join_error', { message: 'Fill all the required fields' })
            }
            const roomId = Math.floor(Math.random() * 1000000).toString()
            await redis.hset(`room:${roomId}`, {
                roomId,
                totalRounds: '3',
                currentRound: '',
                currentTurn: '',
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
                timerEndsAt: '',
                imagesInOneRound: '5',
                guessTime: '20',
                maxPlayers: '8'
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
            const roomStatus = await redis.hget(`room:${roomId}`, 'status')
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
            const maxPlayers = await redis.hget(`room:${roomId}`, 'maxPlayers');
            const players = await redis.hgetall(`room:${roomId}:players`);

            // 1. Handle case where room doesn't exist yet (players will be empty/null)
            const currentPlayerCount = players ? Object.keys(players).length : 0;

            // 2. Convert maxPlayers to a number (defaulting to 0 or a fallback if null)
            const parsedMaxPlayers = Number(maxPlayers) || 0;

            // 3. Compare numbers
            if (currentPlayerCount >= parsedMaxPlayers) {
                return socket.emit('join_error', { message: 'Room Is Full' });
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
            // 🪐 Emits 'player_joined' to all clients in 'roomId' EXCEPT the sender
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
            console.log("Chnage config listener (backend) : ",roomId,key,value)
            const roomKey = `room:${roomId}`
            //is exits
            const isExists = await redis.exists(roomKey)
            if (!Boolean(isExists)) {
                return socket.emit('config_error', { message: 'Room not exists' })
            }
            //check is admin
            const adminSocketId = await redis.hget(roomKey, 'adminId')
            if (adminSocketId !== socket.id) {
                return socket.emit('config_error', { message: 'Only host can change the room configuration' })
            }
            const roomStatus = await redis.hget(roomKey, 'status')
            //check room status 
            if (roomStatus !== 'lobby') {
                return socket.emit('config_error', { message: 'Cannot change the config mid-game' })
            }
            //change rounds
            await redis.hset(roomKey, key, value.toString())
            //emit config_updated
            console.log("Config updated emiiter (backend) : ",key,value)
            io.to(roomId).emit('config_updated', { key, value })
            return socket.to(roomId).emit('feed_message',{
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