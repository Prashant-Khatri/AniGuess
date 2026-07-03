import { Request, Response } from "express"
import { redis } from "../config/redis.js"

export const getTakenAvatars=async(req:Request,res:Response)=>{
    //get room id from the url
    console.log('Inside api')
    console.log(req.params)
    try {
        const roomId = (req.params.roomId as string).trim().toUpperCase();
        const isRoomExists=await redis.exists(`room:${roomId}`)
        if(!Boolean(isRoomExists)){
            return res.status(404).json({ message: 'Room code does not exist.' });
        }
        const takenAvatars=await redis.smembers(`room:${roomId}:taken_avatars`)
        return res.status(200).json({takenAvatars})
    } catch (error) {
        console.error('Error fetching taken avatars:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}