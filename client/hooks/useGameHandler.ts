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
    const handlePlayAgain = (roomId:string) => socket.emit('restart_game', { roomId });
    const handleDisbandRoom = (roomId : string) => socket.emit('disband_room', { roomId });
    const handleLeaveRoom = (roomId : string) => {
        socket.emit('leave_room', { roomId });
        router.push('/');
    };
    const requestRoomData=(roomId : string)=>{
        socket.emit('request_room_data', { roomId });
    }
    //handlePlayAgain,handleDisbandRoom,handleLeaveRoom ko dhang se likhna hai
    return { handleKickAction,submitGuess,startGame,handlePlayAgain,handleDisbandRoom,handleLeaveRoom,requestRoomData}
}