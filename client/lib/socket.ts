// frontend: lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = "http://localhost:5000";

// 1. Correctly extend the global interface for TypeScript
declare global {
  var globalSocket: Socket | undefined;
}

// 2. Explicitly read from globalThis to completely avoid the ReferenceError
export const socket: Socket = 
  globalThis.globalSocket || 
  io(SOCKET_URL, {
    autoConnect: false, // Prevents early initialization leaks before React is ready
    transports: ['websocket'],
    reconnection: true,
  });

// 3. Persist the instance across dev hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.globalSocket = socket;
}