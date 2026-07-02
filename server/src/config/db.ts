import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const res=await mongoose.connect(process.env.MONGODB_URI!)
        if(res.connection.readyState===1){
            console.log('MONGODB CONNECTED')
        }
    } catch (error) {
        console.log('Failed to connect to MONGODB : ',error)
        process.exit(1)
    }
}