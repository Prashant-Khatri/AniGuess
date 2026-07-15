import { Request, Response } from "express"
import { redis } from "../config/redis.js"
import { IPlayers } from "./room.controllers.js"

export const getTakenAvatars = async (req: Request, res: Response) => {
    try {
        const roomId = (req.params.roomId as string).trim().toUpperCase();
        const roomKey = `room:${roomId}`;
        const pipeline = redis.pipeline();
        pipeline.exists(roomKey);
        pipeline.smembers(`${roomKey}:taken_avatars`);
        const results = await pipeline.exec();
        if (!results) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        const isRoomExists = results[0][1] as number;
        const takenAvatars = results[1][1] as string[] || [];
        if (isRoomExists === 0) {
            return res.status(404).json({ message: 'Room code does not exist.' });
        }
        return res.status(200).json({ takenAvatars });
    } catch (error) {
        console.error('Error fetching taken avatars:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAdmin = async (req: Request, res: Response) => {
    try {
        const roomId = (req.params.roomId as string).trim().toUpperCase();
        const roomKey = `room:${roomId}`
        const playersHashKey=`${roomKey}:players`
        const pipeline = redis.pipeline()
        pipeline.exists(roomKey)
        pipeline.hget(roomKey,'adminId')
        pipeline.hgetall(playersHashKey)
        const result = await pipeline.exec() 
        if(!result){
            return res.status(500).json({ message: 'Internal server error' });
        }
        const roomExists = result[0][1] as number
        const adminId = result[1][1] as string | null
        const playersRaw = result[2][1] as Record<string,string> || {}
        if(!roomExists){
            return res.status(404).json({ message: 'Room code does not exist.' })
        }
        if (!adminId) {
            return res.status(404).json({ message: 'No administrator registered for this room.' });
        }
        const players: IPlayers[] = Object.values(playersRaw).map((p) => JSON.parse(p))
        const admin = players.filter((p) => p.socketId === adminId)[0]
        return res.status(200).json({
            userName: admin.userName,
            avatarId: admin.avatarId,
            adminId
        })
    } catch (error) {
        console.error('Error fetching admin info:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const isAuthorized = async (req: Request, res: Response) => {
    try {
        const { userId, roomId } = req.body
        const roomKey=`room:${roomId}`
        const playersHashKey=`${roomKey}:players`
        if (!userId || !roomId) {
            return res.status(401).json({
                success: false,
                message: "UserId or RoomId not found"
            })
        }
        const pipeline=redis.pipeline()
        pipeline.exists(roomKey)
        pipeline.hget(playersHashKey,userId)
        const result=await pipeline.exec()
        if(!result){
            return res.status(500).json({
                success : false,
                message: 'Internal server error' 
            });
        }
        const roomExists=result[0][1] as number
        const player=result[1][1] as string | null
        if (!roomExists) {
            return res.status(402).json({
                success: false,
                message: "Room doesn't exists"
            })
        }
        if (!player) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Authorized"
        })
    } catch (error) {
        console.log("Error in authorizing player", error)
        return res.status(500).json({
            success: false,
            message: "Server error in authorizing player"
        })
    }
}