import { Socket } from 'socket.io-client';

export const useRoomHandler = (socket: Socket) => {
  
  const createRoom = (userName: string, avatarId: number, userId: string) => {
    console.log("I am inside useRoomHandler.ts : ",userName,avatarId,userId)
    console.log("Socket is inside createRoom : ",socket.id)
    if (!socket.connected) socket.connect();
    console.log("Going to emit : ",socket.id)
    socket.emit('create_room', { userName, avatarId, userId });
  }

  const joinRoom = (userName: string, roomId: string, avatarId: number, userId: string) => {
    if (!socket.connected) socket.connect();
    socket.emit('join_room', { userName, roomId, avatarId, userId });
  }
  
  const changeRoomConfig=({key,value,roomId}:{key : string;value : number,roomId : string})=>{
    socket.emit('change_config',{key,value,roomId})
  }

  return { createRoom, joinRoom ,changeRoomConfig};
};