import { io, Socket } from 'socket.io-client';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
console.log("Backend url is : ",SOCKET_URL)
declare global {
  var globalSocket: Socket | undefined;
}
export const socket: Socket = 
 globalThis.globalSocket || 
  io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
  });
if (process.env.NODE_ENV !== 'production') {
  globalThis.globalSocket = socket;
}