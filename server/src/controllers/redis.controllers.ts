import { Request, Response } from "express"
import { redis } from "../config/redis.js"
import { IPlayers } from "./room.controllers.js"

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

export const getAdmin=async(req : Request,res : Response)=>{
    try {
        const roomId = (req.params.roomId as string).trim().toUpperCase();
        const roomKey=`room:${roomId}`
        const isRoomExists=await redis.exists(roomKey)
        if(!Boolean(isRoomExists)){
            return res.status(404).json({ message: 'Room code does not exist.' });
        }
        const adminId=await redis.hget(roomKey,'adminId')
        const playersRaw=await redis.hgetall(`${roomKey}:players`)
        const players : IPlayers[]=Object.values(playersRaw).map((p)=>JSON.parse(p))
        const admin=players.filter((p)=>p.socketId===adminId)[0]
        return res.status(200).json({
            userName : admin.userName,
            avatarId : admin.avatarId,
            adminId
        })
    } catch (error) {
        console.error('Error fetching admin info:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const isAuthorized=async(req : Request,res : Response)=>{
    try {
        const {userId,roomId}=req.body
        if(!userId || !roomId){
            return res.status(401).json({
                success : false,
                message : "UserId or RoomId not found"
            })
        }
        const roomExists=await redis.exists(`room:${roomId}`)
        if(!roomExists){
            return res.status(402).json({
                success : false,
                message : "Room doesn't exists"
            })
        }
        const player=await redis.hget(`room:${roomId}:players`,userId)
        if(!player){
            return res.status(401).json({
                success : false,
                message : "Unauthorized"
            })
        }
        return res.status(200).json({
            success : true,
            message : "Authorized"
        })
    } catch (error) {
        console.log("Error in authorizing player",error)
        return res.status(500).json({
            success : false,
            message : "Server error in authorizing player"
        })
    }
}