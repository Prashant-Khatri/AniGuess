import express from 'express'
import {createServer} from 'http'
import {Server, Socket} from 'socket.io'
import { createRoom, joinRoom, syncRoomStateOnDemand } from '../controllers/room.controllers.js'
import { handlePlayerGuess, kickPlayer, startGame } from '../controllers/game.controllers.js'

const app=express()
const server=createServer(app)

const io=new Server(server,{
    cors : {
        origin:['http://localhost:3000'],
        methods:['GET', 'POST']
    }
})

io.on('connection',(socket:Socket)=>{
    console.log('Socket connected : ',socket.id)
    createRoom(io,socket)
    joinRoom(io,socket)
    startGame(io,socket)
    handlePlayerGuess(io,socket)
    kickPlayer(io,socket)
    syncRoomStateOnDemand(io,socket)
    socket.on('disconnect', (reason) => {
        console.log(`❌ [SOCKET DETACHED] ID: ${socket.id} | Reason: ${reason}`)
    })
})

export {app,io,server}
