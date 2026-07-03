// hooks/useRoomHandler.ts
import { Socket } from 'socket.io-client';
import { useCallback } from 'react';

export const useRoomHandler = (socket: Socket) => {
  
  const createRoom = useCallback((userName: string, totalRounds: number, avatarId: number, userId: string) => {
    if (!socket.connected) socket.connect();
    socket.emit('create_room', { userName, totalRounds, avatarId, userId });
  }, [socket]);

  const joinRoom = useCallback((userName: string, roomId: string, avatarId: number, userId: string) => {
    if (!socket.connected) socket.connect();
    socket.emit('join_room', { userName, roomId, avatarId, userId });
  }, [socket]);

  return { createRoom, joinRoom };
};