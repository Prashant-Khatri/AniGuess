import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { changeRoomConfig, createRoom, joinRoom, syncRoomStateOnDemand } from '../controllers/room.controllers.js'
import { disbandRoom, disconnect, handlePlayerGuess, kickPlayer, leaveRoom, playAgain, playAgainToggle, reJoinRoom, startGame, syncEndGameData, syncIntermissionData } from '../controllers/game.controllers.js'

const app = express()
const server = createServer(app)
const FRONTEND_URL=process.env.NEXT_FRONTEND_URL || 'http://localhost:3000'

console.log("Frontend url in socket.ts",FRONTEND_URL)

const io = new Server(server, {
    cors: {
        origin: [FRONTEND_URL],
        methods: ['GET', 'POST']
    }
})


io.on('connection', (socket: Socket) => {
    console.log('Socket connected : ', socket.id)
    createRoom(io, socket)
    joinRoom(io, socket)
    startGame(io, socket)
    handlePlayerGuess(io, socket)
    kickPlayer(io, socket)
    syncRoomStateOnDemand(io, socket)
    changeRoomConfig(io, socket)
    playAgain(io, socket)
    playAgainToggle(io, socket)
    leaveRoom(io, socket)
    disbandRoom(io, socket)
    disconnect(io,socket)
    reJoinRoom(io,socket)
    syncIntermissionData(io,socket)
    syncEndGameData(io,socket)
})

export { app, io, server }
