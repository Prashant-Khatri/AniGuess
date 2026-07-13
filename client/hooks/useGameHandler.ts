import { useGameStore } from "@/store/game.store";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";

export const useGameHandler = (socket: Socket) => {
    const router=useRouter()
    const handleKickAction = (roomId: string, targetSocketId: string) => {
        socket.emit('kick_player', { roomId, targetSocketId });
    };
    const submitGuess = (roomId: string, userId: string | null, guessText: string) => {
        socket.emit('submit_guess', {
            roomId,
            userId,
            guess: guessText.trim()
        });
    }

    const startGame=(roomId : string)=>{
        console.log("Inside start game")
        socket.emit("start_game", { roomId });
    }
    const handlePlayAgain = (roomId:string) => socket.emit('play_again', { roomId });
    const handleDisbandRoom = (roomId : string) => socket.emit('disband_room', { roomId });

    const handleLeaveRoom = (roomId : string) => {
        const userId = localStorage.getItem('game_user_id');
        if(!userId){
            return
        }
        socket.emit('leave_room', { roomId ,userId});
        router.push('/');
    };
    const requestRoomData=(roomId : string)=>{
        socket.emit('request_room_data', { roomId });
    }
    const playerReadyToggle=(roomId : string,socketId : string)=>{
        console.log("Inside player ready toggle emitter (frontend)",roomId,socketId)
        socket.emit('play_again_toggle',{roomId,socketId})
    }
    const reJoinRoom=(roomId : string)=>{
        const userId = localStorage.getItem('game_user_id');
        if(!userId) return
        console.log("Inside rejoin room emitter (frontend) : ",roomId,userId)
        socket.emit('rejoin_room',{roomId,userId})
    }
    //handlePlayAgain,handleDisbandRoom,handleLeaveRoom ko dhang se likhna hai
    return { handleKickAction,submitGuess,startGame,handlePlayAgain,handleDisbandRoom,handleLeaveRoom,requestRoomData,playerReadyToggle,reJoinRoom}
}