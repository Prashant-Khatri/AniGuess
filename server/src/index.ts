import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { app,server } from './socket/socket.js'
import { connectDB } from './config/db.js'

dotenv.config()
const PORT= process.env.PORT || 8000

app.use(cors({
    origin : ['http://localhost:3000'],
    methods : ['GET','POST']
}))
app.use(express.json())


//saara kaam kaaz idhar
app.use('/',(req,res)=>{
    res.send('Tera bhai seedhe maut')
})

app.use('/api/avatars',)


server.listen(PORT,()=>{
    connectDB()
    console.log(`Server listening at PORT : ${PORT}`)
})
