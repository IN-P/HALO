const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chatController = require('./controllers/chatController');
const { ChatRoom, ChatMessage, User, Sequelize } = require('./models'); // models/index.js에서 내보낸 모델들 불러오기

const app = express();
const server = http.createServer(app);

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
    const { roomId, senderId, content } = data; // roomId는 'chat-user1_id-user2_id' 형태일 것으로 예상

    try {
        // user1_id와 user2_id 추출 (roomId가 'chat-1-2' 형태라고 가정)
        const parts = roomId.split('-');
        const user1Id = parseInt(parts[1]);
        const user2Id = parseInt(parts[2]); // parseInt(parseInt(parts[2])) 대신 parseInt(parts[2])

        // user1_id와 user2_id를 항상 작은 값을 user1_id로 정렬하여 중복 방지 (예: 1-2와 2-1은 같은 방)
        const sortedUser1Id = Math.min(user1Id, user2Id);
        const sortedUser2Id = Math.max(user1Id, user2Id);

        let chatRoomInstance; // Sequelize 모델 인스턴스를 저장할 변수

        // 1. chat_rooms 테이블에서 해당 방이 이미 존재하는지 확인 (Sequelize findOne 사용)
        chatRoomInstance = await ChatRoom.findOne({
            where: {
                [Sequelize.Op.or]: [ // Sequelize의 OR 연산자 사용
                    { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
                    { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
                ]
            }
        });

        if (chatRoomInstance) {
            // 방이 이미 존재하면 해당 방의 ID를 가져옴
            console.log(`기존 채팅방 발견: ID ${chatRoomInstance.id}`);
        } else {
            // 방이 존재하지 않으면 새로 생성
            chatRoomInstance = await ChatRoom.create({
                user1_id: sortedUser1Id,
                user2_id: sortedUser2Id,
                // createdAt, updatedAt은 ChatRoom 모델 정의에 timestamps: true로 설정했으므로
                // Sequelize가 자동으로 현재 시간으로 채워줍니다. 명시적으로 넣어도 무방합니다.
                // createdAt: new Date(),
                // updatedAt: new Date()
            });
            console.log(`새로운 채팅방 생성: ID ${chatRoomInstance.id}`);
        }

      // 2. chat_messages 테이블에 메시지 저장 시, chatRoomInstance.id 사용
      await ChatMessage.create({ // Sequelize 모델의 create 메서드 사용
        rooms_id: chatRoomInstance.id, // chatRoomInstance.id는 BIGINT 타입
        sender_id: senderId,
        content: content,
        // createdAt, updatedAt은 ChatMessage 모델 정의에 timestamps: true로 설정했으므로
        // Sequelize가 자동으로 현재 시간으로 채워줍니다.
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

server.listen(4000, () => {
  console.log('✅ Socket.IO 서버 실행 중 (http://localhost:4000)');
});