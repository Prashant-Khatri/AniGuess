// hooks/useRoomHandler.ts
import { Socket } from 'socket.io-client';
import { useCallback } from 'react';

export const useRoomHandler = (socket: Socket) => {
  
  const createRoom = useCallback((userName: string, avatarId: number, userId: string) => {
    if (!socket.connected) socket.connect();
    socket.emit('create_room', { userName, avatarId, userId });
  }, [socket]);

  const joinRoom = useCallback((userName: string, roomId: string, avatarId: number, userId: string) => {
    if (!socket.connected) socket.connect();
    socket.emit('join_room', { userName, roomId, avatarId, userId });
  }, [socket]);
  
  const changeRoomConfig=({key,value,roomId}:{key : string;value : number,roomId : string})=>{
    console.log("Inside change room config emitter (frontend): ",key,value,roomId)
    socket.emit('change_config',{key,value,roomId})
  }

  return { createRoom, joinRoom ,changeRoomConfig};
};