// backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chatController = require('./controllers/chatController');

// ★★★ 1. dotenv 불러오기 및 config() 호출 ★★★
const dotenv = require('dotenv');
dotenv.config(); // .env 파일의 환경 변수를 로드합니다.

// Sequelize 모델 및 연결 객체 불러오기
// 이 라인에서 models/index.js가 실행되며 DB 연결을 시도합니다.
// DB 연결 정보는 config/config.js에서 가져오는데, 이때 process.env.DB_PASSPORT가 필요하므로
// dotenv.config()가 먼저 실행되어야 합니다.
const { ChatRoom, ChatMessage, User, Sequelize, sequelize } = require('./models'); 
// (User 모델이 없다면 require에서 제거하거나, User 모델 파일이 있는지 확인하세요)

const app = express();
const server = http.createServer(app);

// ★★★ 2. 데이터베이스 동기화 코드 추가 (서버 시작 전에 실행) ★★★
// 이 부분은 개발 단계에서만 사용하고, 프로덕션 배포 시에는 반드시 제거하거나 주석 처리해야 합니다!
// force: true는 기존 테이블을 삭제하고 다시 만듭니다. (주의: 기존 데이터 모두 삭제)
sequelize.sync({ force: true }) 
    .then(() => {
        console.log('✅ 데이터베이스 동기화 완료: 모든 테이블이 생성/재생성되었습니다.');
    })
    .catch(err => {
        console.error('❌ 데이터베이스 동기화 실패:', err);
        // 동기화 실패 시 서버를 종료하여 문제를 명확히 알립니다.
        process.exit(1); 
    });
// ★★★ 여기까지 추가 ★★★


const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // 프론트엔드 포트
        methods: ['GET', 'POST']
    }
});

// ✅ JSON 파싱 미들웨어
app.use(express.json());

// ✅ 테스트용 API 라우터
app.get('/api/chat/test', chatController.testController);

// ✅ 소켓 연결
io.on('connection', (socket) => {
    console.log('🟢 유저 접속:', socket.id);

    // 채팅방 입장
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`🔗 ${socket.id} joined room ${roomId}`);
    });

    // 메시지 전송 & DB 저장
    socket.on('send_message', async (data) => {
        const { roomId, senderId, content } = data;

        try {
            const parts = roomId.split('-');
            const user1Id = parseInt(parts[1]);
            const user2Id = parseInt(parts[2]);

            const sortedUser1Id = Math.min(user1Id, user2Id);
            const sortedUser2Id = Math.max(user1Id, user2Id);

            let chatRoomInstance;

            chatRoomInstance = await ChatRoom.findOne({
                where: {
                    [Sequelize.Op.or]: [
                        { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
                        { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
                    ]
                }
            });

            if (chatRoomInstance) {
                console.log(`기존 채팅방 발견: ID ${chatRoomInstance.id}`);
            } else {
                chatRoomInstance = await ChatRoom.create({
                    user1_id: sortedUser1Id,
                    user2_id: sortedUser2Id,
                });
                console.log(`새로운 채팅방 생성: ID ${chatRoomInstance.id}`);
            }

            // chat_messages 테이블에 메시지 저장
            await ChatMessage.create({
                rooms_id: chatRoomInstance.id,
                sender_id: senderId,
                content: content,
            });

            console.log('💬 메시지 저장 완료:', { roomsId: chatRoomInstance.id, senderId, content });

            // 다시 전체 방에 전송
            io.to(roomId).emit('receive_message', data);
        } catch (err) {
            console.error('❌ 메시지 저장 실패:', err);
        }
    });

    // 연결 해제
    socket.on('disconnect', () => {
        console.log('🔴 유저 연결 해제:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`✅ Socket.IO 서버 실행 중 (http://localhost:${PORT})`);
});