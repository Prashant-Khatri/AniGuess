import express from 'express'
import {createServer} from 'http'
import {Server} from 'socket.io'
import { createRoom, joinRoom } from './roomHandler.js'

const app=express()
const server=createServer(app)

const io=new Server(server,{
    cors : {
        origin:['http://localhost:3000'],
        methods:['GET', 'POST']
    }
})

io.on('connection',(socket)=>{
    console.log('Socket connected : ',socket.id)
    createRoom(io,socket)
    joinRoom(io,socket)
    socket.on('disconnect', (reason) => {
        console.log(`❌ [SOCKET DETACHED] ID: ${socket.id} | Reason: ${reason}`)
    })
})

export {app,io,server}
