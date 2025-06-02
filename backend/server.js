// backend/server.js
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app'); // app.js에서 express app을 가져옴
const { ChatRoom, ChatMessage, ChatRoomExit, Sequelize, sequelize } = require('./models'); // sequelize도 임포트

// .env 파일 로드는 스크립트 시작 부분에서 실행하는 것이 일반적
dotenv.config();

const server = http.createServer(app);

// ✅ socket.io 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // 클라이언트 주소
    methods: ['GET', 'POST']
  }
});

// ✅ DB 연결 및 동기화 (앱 실행 전에 수행)
// 이 부분은 app.js에 있을 수도 있지만, server.js에서 관리한다면 여기에 둡니다.
// 주의: 배포 시 force: true 제거
sequelize.sync()
  .then(() => console.log('✅ DB 연결 및 동기화 완료'))
  .catch(err => {
    console.error('❌ DB 연결 실패:', err);
    process.exit(1);
  });

io.on('connection', (socket) => {
  console.log('🟢 유저 접속:', socket.id);

  socket.on('join_room', async (roomId, userId) => {
  socket.join(roomId);
  console.log(`🔗 ${socket.id} joined room ${roomId}`);

  try {
    const parts = roomId.split('-');
    const user1Id = parseInt(parts[1]);
    const user2Id = parseInt(parts[2]);
    const sortedUser1Id = Math.min(user1Id, user2Id);
    const sortedUser2Id = Math.max(user1Id, user2Id);

    const chatRoom = await ChatRoom.findOne({
      where: {
        user1_id: sortedUser1Id,
        user2_id: sortedUser2Id
      }
    });

    if (!chatRoom) {
      console.log(`🚫 채팅방 없음: ${roomId}`);
      return;
    }

    // ✅ 안읽은 메시지 읽음 처리
    const updatedCount = await ChatMessage.update(
      { is_read: true },
      {
        where: {
          rooms_id: chatRoom.id,
          sender_id: { [Sequelize.Op.ne]: userId },
          is_read: false
        }
      }
    );
    console.log(`✅ 유저 ${userId} 안읽은 메시지 읽음 처리 완료 (${updatedCount[0]}건)`);

  } catch (err) {
    console.error('❌ join_room 중 에러 발생:', err);
  }
});

socket.on('send_message', async (data) => {
  const { roomId, senderId, content } = data;

  try {
    const parts = roomId.split('-');
    const user1Id = parseInt(parts[1]);
    const user2Id = parseInt(parts[2]);
    const sortedUser1Id = Math.min(user1Id, user2Id);
    const sortedUser2Id = Math.max(user1Id, user2Id);

    let chatRoomInstance = await ChatRoom.findOne({
      where: {
        [Sequelize.Op.or]: [
          { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
          { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
        ]
      }
    });

    // ✅ 채팅방이 없으면 생성 (exit 정보도 포함)
    if (!chatRoomInstance) {
      chatRoomInstance = await ChatRoom.create({
        user1_id: sortedUser1Id,
        user2_id: sortedUser2Id
      });
      console.log(`🆕 채팅방 생성: ID ${chatRoomInstance.id}`);

      // ✅ ChatRoomExit도 같이 생성
      await ChatRoomExit.create({
        chat_rooms_id: chatRoomInstance.id,
        user1_id_active: true,
        user2_id_active: true
      });
      console.log(`✅ ChatRoomExit 생성됨 for room ${chatRoomInstance.id}`);
    } else {
      // ✅ 만약 채팅방은 있는데 exit가 없다면 → 예외 처리용 자동 생성 (한 번만)
      const exitInfo = await ChatRoomExit.findOne({
        where: { chat_rooms_id: chatRoomInstance.id }
      });
      if (!exitInfo) {
        await ChatRoomExit.create({
          chat_rooms_id: chatRoomInstance.id,
          user1_id_active: true,
          user2_id_active: true
        });
        console.log(`🔄 누락된 ChatRoomExit 복구됨 (room ${chatRoomInstance.id})`);
      }
    }

    // ✅ 메시지 저장
    await ChatMessage.create({
      rooms_id: chatRoomInstance.id,
      sender_id: senderId,
      content: content,
      is_read: false
    });

    console.log('💬 메시지 저장 완료:', { roomId, senderId, content });

    // ✅ 클라이언트에게 메시지 전송
    io.to(roomId).emit('receive_message', data);

  } catch (err) {
    console.error('❌ 메시지 전송 실패:', err);
  }
});

  socket.on('exit_room', async ({ roomId, userId }) => {
    console.log(`[EXIT_ROOM] 클라이언트로부터 exit_room 이벤트 수신: roomId="${roomId}", userId=${userId}`); // 디버깅용 로그 추가
    try {
      const parts = roomId.split('-');
      const user1Id = parseInt(parts[1]);
      const user2Id = parseInt(parts[2]);
      const sortedUser1Id = Math.min(user1Id, user2Id);
      const sortedUser2Id = Math.max(user1Id, user2Id);

      console.log(`[EXIT_ROOM] 파싱된 ID (정렬됨): sortedUser1Id=${sortedUser1Id}, sortedUser2Id=${sortedUser2Id}`); // 디버깅용 로그 추가

      const chatRoom = await ChatRoom.findOne({
        where: {
          // ✅ send_message와 동일하게 Sequelize.Op.or 적용
          [Sequelize.Op.or]: [
            { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
            { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
          ]
        }
      });

      if (!chatRoom) {
        console.log(`[EXIT_ROOM] 🚫 chat_rooms 테이블에서 채팅방을 찾을 수 없음: user1_id=${sortedUser1Id}, user2_id=${sortedUser2Id}`);
        socket.emit('exit_room_failed', { message: '채팅방을 찾을 수 없습니다.' });
        return;
      }

      console.log(`[EXIT_ROOM] ✅ 채팅방 찾음. chatRoom.id: ${chatRoom.id}`); // 디버깅용 로그 추가

      const exitInfo = await ChatRoomExit.findOne({
        where: { chat_rooms_id: chatRoom.id }
      });

      if (!exitInfo) {
        console.log('🚫 exit 테이블 정보 없음');
        // 이 경우는 채팅방은 있지만, 해당 채팅방에 대한 ChatRoomExit 레코드가 없는 경우입니다.
        // send_message에서 채팅방 생성 시 ChatRoomExit도 같이 생성되는지 확인해야 합니다.
        socket.emit('exit_room_failed', { message: '채팅방 정보를 찾을 수 없습니다.' });
        return;
      }

      console.log(`[EXIT_ROOM] ✅ ChatRoomExit 정보 찾음.`); // 디버깅용 로그 추가

      // 나가는 유저에 따라 업데이트할 필드 결정
      const fieldToUpdate = (userId === sortedUser1Id)
        ? 'user1_id_active'
        : (userId === sortedUser2Id)
          ? 'user2_id_active' // ✅ ChatRoomExit 모델의 필드명 'user2_active'를 그대로 사용
          : null;

      if (!fieldToUpdate) {
        console.log('🚫 해당 유저는 이 채팅방에 속하지 않음');
        socket.emit('exit_room_failed', { message: '채팅방 참여자가 아닙니다.' });
        return;
      }

      // ChatRoomExit 상태 업데이트
      await exitInfo.update({ [fieldToUpdate]: false });

      console.log(`🚪 유저 ${userId}가 채팅방 ${chatRoom.id}에서 나감`);
      // ✅ 성공적으로 나갔음을 클라이언트에 알림
      socket.emit('exit_room_success', { roomId, userId });

      // 필요한 경우, 다른 방 참여자에게 나갔다는 사실을 알릴 수 있음
      // io.to(roomId).emit('user_exited', { userId });
    } catch (err) {
      console.error('[EXIT_ROOM] ❌ exit_room 처리 중 에러:', err);
      // ✅ 클라이언트에 실패 알림
      socket.emit('exit_room_failed', { message: '채팅방 나가기 중 서버 오류가 발생했습니다.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 유저 연결 해제:', socket.id);
  });
});

const PORT = process.env.PORT || 3065;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중! http://localhost:${PORT}`);
});