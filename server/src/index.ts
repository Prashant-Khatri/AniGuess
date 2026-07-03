import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { app,server } from './socket/socket.js'
import { connectDB } from './config/db.js'
import { getTakenAvatars } from './controllers/avatars.controllers.js'

dotenv.config()
const PORT= process.env.PORT || 8000
console.log("REDIS_URL : ",process.env.REDIS_URL)

app.use(cors({
    origin : ['http://localhost:3000'],
    methods : ['GET','POST']
}))
app.use(express.json())


//saara kaam kaaz idhar
// app.use('/',(req,res)=>{
//     res.send('Tera bhai seedhe maut')
// })

app.get('/api/taken-avatars/:roomId',getTakenAvatars)


server.listen(PORT,()=>{
    connectDB()
    console.log(`Server listening at PORT : ${PORT}`)
})
