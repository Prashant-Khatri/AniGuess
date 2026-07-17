import express from 'express'
import cors from 'cors'
import { app,server } from './socket/socket.js'
import { connectDB } from './config/db.js'
import { getAdmin, getTakenAvatars, isAuthorized } from './controllers/redis.controllers.js'

const PORT= process.env.PORT || 8000
const FRONTEND_URL=process.env.NEXT_FRONTEND_URL || 'http://localhost:3000'

app.use(cors({
    origin : [FRONTEND_URL],
    methods : ['GET','POST']
}))
app.use(express.json())

app.get('/api/taken-avatars/:roomId',getTakenAvatars)
app.get('/api/get-admin/:roomId',getAdmin)
app.post('/api/verify-entry',isAuthorized)

server.listen(PORT,()=>{
    connectDB()
    console.log(`Server listening at PORT : ${PORT}`)
})
