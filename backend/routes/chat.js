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
      return res.status(200).json(chatRoom);
    }

    chatRoom = await ChatRoom.create({
      user1_id,
      user2_id,
    });

    // 채팅방 생성 시 ChatRoomExit도 같이 생성 (초기값: 둘 다 활성)
    await ChatRoomExit.create({
      chat_rooms_id: chatRoom.id,
      user1_id_active: true,
      user2_id_active: true,
    });

    res.status(201).json(chatRoom);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;

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

    // ChatRoomExit 필터링
    const filteredChatRooms = chatRooms.filter(room => {
        if (!room.ChatRoomExits || room.ChatRoomExits.length === 0) return true;
        
        const exitInfo = room.ChatRoomExits[0];

        if (room.user1_id === userId) {
            return exitInfo.user1_id_active;
        } else { // room.user2_id === userId
            return exitInfo.user2_id_active;
        }
    });

    res.status(200).json(filteredChatRooms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:chatRoomId/exit', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {
      chatRoomExit = await ChatRoomExit.create({ chat_rooms_id: chatRoomId });
    }

    if (chatRoom.user1_id === userId) {
      chatRoomExit.user1_id_active = false;
    } else if (chatRoom.user2_id === userId) {
      chatRoomExit.user2_id_active = false;
    } else {
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    await chatRoomExit.save();

    res.status(200).json({ message: '채팅방을 나갔어.', chatRoomExit });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:chatRoomId/rejoin', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {
      return res.status(200).send('이미 활성화된 채팅방이야.');
    }

    if (chatRoom.user1_id === userId) {
      chatRoomExit.user1_id_active = true;
    } else if (chatRoom.user2_id === userId) {
      chatRoomExit.user2_id_active = true;
    } else {
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    await chatRoomExit.save();

    res.status(200).json({ message: '채팅방에 다시 참여했어.', chatRoomExit });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/message/:roomId', isLoggedIn, async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const sender_id = req.user.id;
    const { content } = req.body;

    const chatRoom = await ChatRoom.findOne({ where: { id: roomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    if (chatRoom.user1_id !== sender_id && chatRoom.user2_id !== sender_id) {
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }

    const message = await ChatMessage.create({
      sender_id,
      rooms_id: roomId,
      content,
      is_read: false,
      is_deleted: false,
    });

    const fullMessage = await ChatMessage.findOne({
      where: { id: message.id },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/message/:roomId', isLoggedIn, async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const chatRoom = await ChatRoom.findOne({ where: { id: roomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    if (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId) {
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }

    const messages = await ChatMessage.findAll({
      where: {
        rooms_id: roomId,
        is_deleted: false,
      },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });

    // 메시지를 읽음 처리 (상대방이 보낸 메시지 중 내가 읽지 않은 것)
    await ChatMessage.update(
      { is_read: true },
      {
        where: {
          rooms_id: roomId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/message/:messageId/delete', isLoggedIn, async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const userId = req.user.id;

    const message = await ChatMessage.findOne({ where: { id: messageId } });
    if (!message) {
      return res.status(404).send('메시지가 존재하지 않아.');
    }

    if (message.sender_id !== userId) {
      return res.status(403).send('메시지를 삭제할 권한이 없어.');
    }

    await ChatMessage.update(
      { is_deleted: true },
      { where: { id: messageId } }
    );

    res.status(200).json({ MessageId: messageId, is_deleted: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/unread', isLoggedIn, async (req, res, next) => { // 여기에 isLoggedIn 미들웨어 추가
  try {
    const userId = req.user.id; // isLoggedIn 미들웨어 덕분에 req.user.id 사용 가능

    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId }
        ]
      }
    });

    const result = [];

    for (const room of rooms) {
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

      result.push({
        roomId: roomIdForClient,
        opponentId,
        unreadCount
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/message/:roomId/unread', isLoggedIn, async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const userId = req.user.id; // 로그인된 유저 ID

    const chatRoom = await ChatRoom.findOne({ where: { id: roomId } });
    if (!chatRoom || (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId)) {
      return res.status(403).send('해당 채팅방의 읽지 않은 메시지를 조회할 권한이 없어.');
    }

    const unreadCount = await ChatMessage.count({
      where: {
        rooms_id: roomId,
        is_read: false,
        sender_id: { [Op.ne]: userId }, // 내가 보낸 메시지 제외
      },
    });
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/my-rooms', isLoggedIn, async (req, res) => {
  const me = req.user.id;

  try {
    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: me },
          { user2_id: me }
        ]
      }
    });

    const result = await Promise.all(rooms.map(async (room) => {
      const partnerId = room.user1_id === me ? room.user2_id : room.user1_id;
      const partner = await User.findOne({
        where: { id: partnerId },
        attributes: ['id', 'nickname', 'profile_img']
      });

      const lastMsg = await ChatMessage.findOne({
        where: { rooms_id: room.id },
        order: [['created_at', 'DESC']],
      });

      const unreadCount = await ChatMessage.count({
        where: {
          rooms_id: room.id,
          sender_id: { [Op.ne]: me },
          is_read: false
        }
      });

      return {
        roomId: `chat-${[room.user1_id, room.user2_id].sort().join('-')}`,
        partner,
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.created_at : null,
        unreadCount
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ /my-rooms 에러:', err);
    res.status(500).send('서버 오류');
  }
});


module.exports = router;