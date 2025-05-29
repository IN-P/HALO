import { io } from 'socket.io-client';
const socket = io('http://localhost:4000'); // 백엔드 주소
export default socket;