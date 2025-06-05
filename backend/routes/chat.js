// routes/chat.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // Sequelize Op 사용을 위해 필요

// 필요한 모델들 불러오기 (컨트롤러 없이 라우트에서 직접 사용)
const { ChatRoom, User, ChatMessage, ChatRoomExit } = require('../models');
const { isLoggedIn } = require('./middlewares'); // 로그인 미들웨어


//1. 채팅방 관련 라우트
//1.1 새로운 채팅방 생성 또는 기존 채팅방 조회 (POST /)

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const user1_id = req.user.id;
    const user2_id = req.body.targetUserId;

    if (user1_id === user2_id) {
      return res.status(400).send('본인과 채팅방을 생성할 수 없어.');
    }

    let chatRoom = await ChatRoom.findOne({
      where: {
        [Op.or]: [
          { user1_id: user1_id, user2_id: user2_id },
          { user1_id: user2_id, user2_id: user1_id },
        ],
      },
    });

    if (chatRoom) {
      console.log(`[POST /] 기존 채팅방 조회 완료: ID ${chatRoom.id}`);
      return res.status(200).json(chatRoom);
    }

    const sortedIds = [user1_id, user2_id].sort((a, b) => a - b);

    chatRoom = await ChatRoom.create({
    user1_id: sortedIds[0],
    user2_id: sortedIds[1],
    });

    // 채팅방 생성 시 ChatRoomExit도 같이 생성 (초기값: 둘 다 활성)
    await ChatRoomExit.create({
      chat_rooms_id: chatRoom.id,
      user1_id_active: true,
      user2_id_active: true,
    });
    console.log(`[POST /] 새로운 채팅방 생성 및 ChatRoomExit 생성 완료: ID ${chatRoom.id}`);

    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('❌ [POST /] 채팅방 생성/조회 에러:', error);
    next(error);
  }
});

router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[GET /] 채팅방 목록 조회 요청: userId=${userId}`);

    const chatRooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'User2',
          attributes: ['id', 'nickname'],
        },
        {
          model: ChatRoomExit,
          required: false // LEFT JOIN
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    console.log(`[GET /] 총 ${chatRooms.length}개의 채팅방 조회 완료.`);

    // ChatRoomExit 필터링
    const filteredChatRooms = chatRooms.filter(room => {
        if (!room.ChatRoomExits || room.ChatRoomExits.length === 0) {
            console.log(`[GET /] 채팅방 ${room.id} ChatRoomExits 정보 없음. 활성화로 간주.`);
            return true;
        }
        
        // ChatRoomExits는 배열로 반환될 수 있지만, 여기선 항상 하나만 있다고 가정
        const exitInfo = room.ChatRoomExits[0];

        if (room.user1_id === userId) {
            console.log(`[GET /] 채팅방 ${room.id} (user1): ${exitInfo.user1_id_active ? '활성' : '비활성'}`);
            return exitInfo.user1_id_active;
        } else { // room.user2_id === userId
            console.log(`[GET /] 채팅방 ${room.id} (user2): ${exitInfo.user2_id_active ? '활성' : '비활성'}`);
            return exitInfo.user2_id_active;
        }
    });
    console.log(`[GET /] 필터링 후 ${filteredChatRooms.length}개의 채팅방 반환.`);

    res.status(200).json(filteredChatRooms);
  } catch (error) {
    console.error('❌ [GET /] 채팅방 목록 조회 에러:', error);
    next(error);
  }
});

router.patch('/:chatRoomId/exit', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;
    console.log(`[PATCH /:chatRoomId/exit] 채팅방 나가기 요청: roomId=${chatRoomId}, userId=${userId}`);

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      console.log(`[PATCH /:chatRoomId/exit] 채팅방 없음: ID ${chatRoomId}`);
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {
      // ChatRoomExit 레코드가 없으면 새로 생성 (기본값은 active:true)
      chatRoomExit = await ChatRoomExit.create({ chat_rooms_id: chatRoomId });
      console.log(`[PATCH /:chatRoomId/exit] ChatRoomExit 레코드 생성: chat_rooms_id=${chatRoomId}`);
    }

    if (chatRoom.user1_id === userId) {
      chatRoomExit.user1_id_active = false;
      console.log(`[PATCH /:chatRoomId/exit] user1_id_active를 false로 설정`);
    } else if (chatRoom.user2_id === userId) {
      chatRoomExit.user2_id_active = false;
      console.log(`[PATCH /:chatRoomId/exit] user2_id_active를 false로 설정`);
    } else {
      console.log(`[PATCH /:chatRoomId/exit] 권한 없음: userId=${userId}는 해당 채팅방에 참여하고 있지 않음.`);
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    await chatRoomExit.save();
    console.log(`[PATCH /:chatRoomId/exit] ChatRoomExit 상태 저장 완료.`);

    res.status(200).json({ message: '채팅방을 나갔어.', chatRoomExit });
  } catch (error) {
    console.error('❌ [PATCH /:chatRoomId/exit] 채팅방 나가기 에러:', error);
    next(error);
  }
});

router.patch('/:chatRoomId/rejoin', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;
    console.log(`[PATCH /:chatRoomId/rejoin] 채팅방 다시 참여 요청: roomId=${chatRoomId}, userId=${userId}`);

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      console.log(`[PATCH /:chatRoomId/rejoin] 채팅방 없음: ID ${chatRoomId}`);
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {
      console.log(`[PATCH /:chatRoomId/rejoin] ChatRoomExit 레코드 없음. 이미 활성화된 것으로 간주.`);
      return res.status(200).send('이미 활성화된 채팅방이야.');
    }

    if (chatRoom.user1_id === userId) {
      chatRoomExit.user1_id_active = true;
      console.log(`[PATCH /:chatRoomId/rejoin] user1_id_active를 true로 설정`);
    } else if (chatRoom.user2_id === userId) {
      chatRoomExit.user2_id_active = true;
      console.log(`[PATCH /:chatRoomId/rejoin] user2_id_active를 true로 설정`);
    } else {
      console.log(`[PATCH /:chatRoomId/rejoin] 권한 없음: userId=${userId}는 해당 채팅방에 참여하고 있지 않음.`);
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    await chatRoomExit.save();
    console.log(`[PATCH /:chatRoomId/rejoin] ChatRoomExit 상태 저장 완료.`);

    res.status(200).json({ message: '채팅방에 다시 참여했어.', chatRoomExit });
  } catch (error) {
    console.error('❌ [PATCH /:chatRoomId/rejoin] 채팅방 다시 참여 에러:', error);
    next(error);
  }
});

router.post('/message', isLoggedIn, async (req, res, next) => {
  try {
    // 클라이언트에서 roomId를 `body`에 `roomsId` 필드로 보낸다고 가정합니다.
    // 만약 클라이언트에서 `param`으로 'chat-1-2' 같은 `roomId`를 보낸다면,
    // 이 라우트에서 파라미터 파싱 로직을 추가해야 하지만, 현재는 body로 받는 것을 목표로 합니다.
    const { roomsId, content } = req.body; // 🟢 roomsId를 body에서 받음
    const senderId = req.user.id;

    console.log(`[POST /message] 메시지 전송 요청: roomId=<span class="math-inline">\{roomsId\}, senderId\=</span>{senderId}, content='${content}'`);

    if (!roomsId || !content) {
      console.log('[POST /message] 필수 정보 누락: roomsId 또는 content');
      return res.status(400).send('채팅방 ID와 내용을 모두 입력해야 해.');
    }

    const chatRoom = await ChatRoom.findOne({ where: { id: roomsId } }); // roomsId는 숫자 ID여야 함
    if (!chatRoom) {
      console.log(`[POST /message] 채팅방 없음: ID ${roomsId}`);
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    // 사용자가 해당 채팅방에 속해 있는지 확인
    if (chatRoom.user1_id !== senderId && chatRoom.user2_id !== senderId) {
      console.log(`[POST /message] 권한 없음: senderId=${senderId}는 해당 채팅방에 참여하고 있지 않음.`);
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }

    const roomId = `chat-${[chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b).join('-')}`;

    // 1. 메시지 저장
    const newMessage = await ChatMessage.create({
      sender_id: senderId,
      rooms_id: roomsId, // rooms_id (DB 컬럼명)
      content,
    });
    console.log(`[POST /message] 메시지 DB 저장 완료: ID ${newMessage.id}`);


    // 2. 저장된 메시지에 발신자(User) 정보를 포함하여 다시 조회
    // 이 부분이 ChatRoom.js에서 sender.nickname과 sender.profile_img를 사용하는 데 필요한 User 정보를 포함합니다.
    const messageWithSender = await ChatMessage.findByPk(newMessage.id, {
      include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }] // 🟢 User 정보 포함
    });
    console.log(`[POST /message] DB에서 저장된 메시지 (유저 정보 포함) 조회 완료.`);


    // 3. Socket.IO를 통해 해당 채팅방의 모든 클라이언트에게 메시지 전송
    // 이 부분이 실시간 채팅을 가능하게 하는 핵심입니다.
    if (req.app.get('io')) {
  const io = req.app.get('io');
  const messagePayload = messageWithSender.toJSON();

  // 채팅 메시지 전송
  io.to(roomId).emit('receive_message', messagePayload);

  // ✅ 새로운 채팅방이 만들어졌음을 상대방에게 알림
  const receiverId = (chatRoom.user1_id === senderId) ? chatRoom.user2_id : chatRoom.user1_id;

  // socket.join 시 room 이름을 'user-2' 식으로 설정했을 경우
  io.to(`user-${receiverId}`).emit('new_chat_room_created', {
    roomId: `chat-${[chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b).join('-')}`,
  });
}

    // 4. 요청을 보낸 클라이언트에게 응답 (프론트엔드에서 이 응답을 받으면 됨)
    // 보통 메시지 전송 성공 여부를 알리기 위해 응답합니다.
    res.status(201).json(messageWithSender.toJSON());
    console.log(`[POST /message] 메시지 저장 및 응답 완료: ${newMessage.id}`);

  } catch (error) {
    console.error('❌ [POST /message] 메시지 전송 중 에러 발생:', error);
    next(error);
  }
});

router.get('/message/:roomId', isLoggedIn, async (req, res, next) => {
  try {
    // ⚠️ 클라이언트에서 roomId를 'chat-1-2' 형태로 보내고 있다면, 여기서 숫자로 파싱해야 함.
    // 현재 코드는 parseInt(req.params.roomId, 10)으로 되어 있어 'chat-1-2'가 들어오면 NaN이 됨.
    // 이 부분이 500 에러의 원인일 가능성이 매우 높음!
    const paramRoomId = req.params.roomId; // 'chat-1-2' 같은 문자열 그대로 받음
    let roomIdAsNumber; // 숫자로 변환된 roomId

    // roomId 파싱 (예: 'chat-1-2' -> user1Id: 1, user2Id: 2 -> 실제 DB chatRoomId)
    if (paramRoomId.startsWith('chat-')) {
        const parts = paramRoomId.split('-');
        if (parts.length === 3 && !isNaN(parseInt(parts[1])) && !isNaN(parseInt(parts[2]))) {
            const user1Id = parseInt(parts[1],10);
            const user2Id = parseInt(parts[2],10);

            if (user1Id === user2Id) {
                console.log(`[GET /message/:roomId] 유효하지 않은 roomId (자기 자신과의 채팅): ${paramRoomId}`);
                return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.'); // 400 Bad Request 반환
            }
            
            const sortedUser1Id = Math.min(user1Id, user2Id);
            const sortedUser2Id = Math.max(user1Id, user2Id);

            // DB에서 실제 채팅방 ID를 찾음
            const chatRoomInDb = await ChatRoom.findOne({
                where: {
                    user1_id: sortedUser1Id,
                    user2_id: sortedUser2Id,
                },
                attributes: ['id'] // id만 가져옴
            });

            if (chatRoomInDb) {
                roomIdAsNumber = chatRoomInDb.id;
                console.log(`[GET /message/:roomId] 클라이언트 roomId '${paramRoomId}' -> DB roomId ${roomIdAsNumber} 변환 완료.`); // 0번 로그
            } else {
                console.log(`[GET /message/:roomId] 클라이언트 roomId '${paramRoomId}'에 해당하는 DB 채팅방 없음.`); // 0-1번 로그
                return res.status(404).send('채팅방이 존재하지 않아.');
            }
        } else {
            console.log(`[GET /message/:roomId] 유효하지 않은 roomId 형식: ${paramRoomId}`); // 0-2번 로그
            return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.');
        }
    } else {
        // 기존처럼 숫자 ID가 바로 오는 경우 처리 (만약을 대비)
        roomIdAsNumber = parseInt(paramRoomId, 10);
        if (isNaN(roomIdAsNumber)) {
             console.log(`[GET /message/:roomId] 유효하지 않은 숫자 roomId: ${paramRoomId}`); // 0-3번 로그
             return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.');
        }
        console.log(`[GET /message/:roomId] 숫자 roomId 직접 사용: ${roomIdAsNumber}`); // 0-4번 로그
    }

    if (isNaN(roomIdAsNumber) || roomIdAsNumber === null) {
         console.log(`[GET /message/:roomId] 최종 roomIdAsNumber가 유효하지 않음: ${roomIdAsNumber}`);
         return res.status(400).send('채팅방 ID를 확인할 수 없어.');
     }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    console.log(`[GET /message/:roomId] 요청 수신: DB roomId=${roomIdAsNumber}, userId=${userId}`); // 1번 로그

    // 여기서는 이제 roomIdAsNumber를 사용
    const chatRoom = await ChatRoom.findOne({ where: { id: roomIdAsNumber } }); // 1번 라인 (기존 roomId 대신 roomIdAsNumber 사용)
    if (!chatRoom) {
      console.log(`[GET /message/:roomId] 채팅방 없음: ID ${roomIdAsNumber}`); // 2번 로그
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    if (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId) {
      console.log(`[GET /message/:roomId] 권한 없음: userId=${userId}는 해당 채팅방에 참여하고 있지 않음.`); // 3번 로그
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }

    console.log(`[GET /message/:roomId] 메시지 조회 시작: rooms_id=${roomIdAsNumber}`); // 4번 로그

    const messages = await ChatMessage.findAll({
      where: {
        rooms_id: roomIdAsNumber, // roomId 대신 roomIdAsNumber 사용
        is_deleted: false,
      },
      include: [{ model: User, attributes: ['id', 'nickname','profile_img'] }],
      order: [['created_at', 'ASC']],
      limit,
      offset,
    });

    console.log(`[GET /message/:roomId] 메시지 ${messages.length}개 조회 완료. 읽음 처리 시작.`); // 5번 로그

    // 메시지를 읽음 처리 (상대방이 보낸 메시지 중 내가 읽지 않은 것)
    await ChatMessage.update(
      { is_read: true },
      {
        where: {
          rooms_id: roomIdAsNumber, // roomId 대신 roomIdAsNumber 사용
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    console.log(`[GET /message/:roomId] 읽음 처리 완료. 응답 전송.`); // 6번 로그

    res.status(200).json(messages);

  } catch (error) {
    console.error('❌ [GET /api/chat/message/:roomId] 에러 발생:', error); // 7번 로그 (전체 스택 트레이스)
    next(error);
  }
});

router.patch('/message/:messageId/delete', isLoggedIn, async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const userId = req.user.id;
    console.log(`[PATCH /message/:messageId/delete] 메시지 삭제 요청: messageId=${messageId}, userId=${userId}`);

    const message = await ChatMessage.findOne({ where: { id: messageId } });
    if (!message) {
      console.log(`[PATCH /message/:messageId/delete] 메시지 없음: ID ${messageId}`);
      return res.status(404).send('메시지가 존재하지 않아.');
    }

    if (message.sender_id !== userId) {
      console.log(`[PATCH /message/:messageId/delete] 권한 없음: senderId=${userId}는 해당 메시지를 보낸 사람이 아님.`);
      return res.status(403).send('메시지를 삭제할 권한이 없어.');
    }

    await ChatMessage.update(
      { is_deleted: true },
      { where: { id: messageId } }
    );
    console.log(`[PATCH /message/:messageId/delete] 메시지 삭제 처리 완료: ID ${messageId}`);

    res.status(200).json({ MessageId: messageId, is_deleted: true });
  } catch (error) {
    console.error('❌ [PATCH /message/:messageId/delete] 메시지 삭제 에러:', error);
    next(error);
  }
});

router.get('/unread', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`[GET /unread] 전체 읽지 않은 메시지 카운트 요청: userId=${userId}`);

    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId }
        ]
      }
    });

    const result = await Promise.all(rooms.map(async (room) => {
      const opponentId = room.user1_id === userId ? room.user2_id : room.user1_id;

      const unreadCount = await ChatMessage.count({
        where: {
          rooms_id: room.id,
          sender_id: opponentId,
          is_read: false
        }
      });

      const sortedUserIds = [room.user1_id, room.user2_id].sort((a, b) => a - b);
      const roomIdForClient = `chat-${sortedUserIds[0]}-${sortedUserIds[1]}`;

      console.log(`[GET /unread] 채팅방 ${room.id} (클라이언트용 ID: ${roomIdForClient}) 읽지 않은 메시지: ${unreadCount}개`);

      return {
        roomId: roomIdForClient,
        opponentId,
        unreadCount
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [GET /unread] 전체 읽지 않은 메시지 카운트 에러:', error);
    next(error);
  }
});

router.get('/message/:roomId/unread', isLoggedIn, async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const userId = req.user.id;
    console.log(`[GET /message/:roomId/unread] 특정 채팅방 읽지 않은 메시지 카운트 요청: roomId=${roomId}, userId=${userId}`);

    const chatRoom = await ChatRoom.findOne({ where: { id: roomId } });
    if (!chatRoom || (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId)) {
      console.log(`[GET /message/:roomId/unread] 권한 없음 또는 채팅방 없음.`);
      return res.status(403).send('해당 채팅방의 읽지 않은 메시지를 조회할 권한이 없어.');
    }

    const unreadCount = await ChatMessage.count({
      where: {
        rooms_id: roomId,
        is_read: false,
        sender_id: { [Op.ne]: userId },
      },
    });
    console.log(`[GET /message/:roomId/unread] 채팅방 ${roomId} 읽지 않은 메시지: ${unreadCount}개`);
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('❌ [GET /message/:roomId/unread] 특정 채팅방 읽지 않은 메시지 카운트 에러:', error);
    next(error);
  }
});

router.get('/my-rooms', isLoggedIn, async (req, res) => {
  const me = req.user.id;
  console.log(`[GET /my-rooms] 내 채팅방 목록 조회 요청: userId=${me}`);

  try {
    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: me },
          { user2_id: me }
        ]
      }
    });
    console.log(`[GET /my-rooms] DB에서 ${rooms.length}개의 채팅방 기본 정보 조회.`);

    const result = await Promise.all(rooms.map(async (room) => {
      const isUser1 = room.user1_id === me;
      const partnerId = isUser1 ? room.user2_id : room.user1_id;

      const partner = await User.findOne({
        where: { id: partnerId },
        attributes: ['id', 'nickname', 'profile_img']
      });
      console.log(`[GET /my-rooms] 채팅방 ${room.id} 파트너 정보 조회 완료: ${partner ? partner.nickname : '없음'}`);


      const lastMsg = await ChatMessage.findOne({
        where: { rooms_id: room.id },
        order: [['created_at', 'DESC']],
      });
      console.log(`[GET /my-rooms] 채팅방 ${room.id} 마지막 메시지 조회 완료.`);

      const unreadCount = await ChatMessage.count({
        where: {
          rooms_id: room.id,
          sender_id: { [Op.ne]: me },
          is_read: false
        }
      });
      console.log(`[GET /my-rooms] 채팅방 ${room.id} 읽지 않은 메시지 카운트 완료: ${unreadCount}개`);

      return {
        roomId: `chat-${[room.user1_id, room.user2_id].sort().join('-')}`,
        otherUser: {
          id: partner.id,
          nickname: partner.nickname,
          profileImage: partner.profile_img,
        },
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.created_at : null,
        unreadCount
      };
    }));
    console.log(`[GET /my-rooms] 최종 채팅방 목록 ${result.length}개 반환.`);

    res.json(result);
  } catch (err) {
    console.error('❌ /my-rooms 에러:', err);
    res.status(500).send('서버 오류');
  }
});


module.exports = router;