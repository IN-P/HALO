import { io } from 'socket.io-client';

const socket = io('http://localhost:3065', {
  withCredentials: true, // ✅ 이거 꼭 필요해!
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('🌐 Socket Connected! ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('💔 Socket Disconnected. Reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Socket Connection Error:', error);
});

export default socket;
