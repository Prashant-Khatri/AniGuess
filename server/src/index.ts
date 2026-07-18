import express from 'express'
import cors from 'cors'
import { app,server } from './socket/socket.js'
import { connectDB } from './config/db.js'
import { getAdmin, getTakenAvatars, isAuthorized } from './controllers/redis.controllers.js'

const PORT = Number(process.env.PORT) || 8000;
const FRONTEND_URL=process.env.NEXT_FRONTEND_URL!

console.log("Frontend url in index ts",FRONTEND_URL)

app.use(cors({
    origin : [FRONTEND_URL],
    methods : ['GET','POST']
}))
app.use(express.json())

app.get('/api/taken-avatars/:roomId',getTakenAvatars)
app.get('/api/get-admin/:roomId',getAdmin)
app.post('/api/verify-entry',isAuthorized)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at PORT : ${PORT}`);
  connectDB();
});
