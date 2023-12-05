import { io } from 'socket.io-client';

export const socket = io({
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 15,
    pingInterval: 60000,
    pingTimeout: 120000
});