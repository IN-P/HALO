// 1. 액션 타입 정의
export const SET_ME = 'SET_ME';
export const SET_SELECTED_USER = 'SET_SELECTED_USER';
export const ADD_LOG = 'ADD_LOG';
export const CLEAR_LOG = 'CLEAR_LOG';
export const TOGGLE_SEARCH_MODAL = 'TOGGLE_SEARCH_MODAL';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SET_MESSAGE = 'SET_MESSAGE';
export const SET_NEW_MSG_ALERT = 'SET_NEW_MSG_ALERT';

export const SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST';
export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS';
export const SEND_MESSAGE_FAILURE = 'SEND_MESSAGE_FAILURE';

export const JOIN_ROOM_REQUEST = 'JOIN_ROOM_REQUEST';
export const JOIN_ROOM_SUCCESS = 'JOIN_ROOM_SUCCESS';
export const JOIN_ROOM_FAILURE = 'JOIN_ROOM_FAILURE';

export const EXIT_ROOM_REQUEST = 'EXIT_ROOM_REQUEST';
export const EXIT_ROOM_SUCCESS = 'EXIT_ROOM_SUCCESS';
export const EXIT_ROOM_FAILURE = 'EXIT_ROOM_FAILURE';

export const SET_CHAT_ROOMS = 'SET_CHAT_ROOMS';

export const UPDATE_CHAT_ROOM_LAST_MESSAGE = 'UPDATE_CHAT_ROOM_LAST_MESSAGE';

// 2. 액션 생성자
export const setMe = (payload) => ({ type: SET_ME, payload });
export const setSelectedUser = (payload) => ({ type: SET_SELECTED_USER, payload });
export const addLog = (payload) => ({ type: ADD_LOG, payload });
export const clearLog = () => ({ type: CLEAR_LOG });
export const toggleSearchModal = (payload) => ({
    type: TOGGLE_SEARCH_MODAL,
    payload: payload !== undefined ? payload : null,
});
export const setSearchTerm = (payload) => ({ type: SET_SEARCH_TERM, payload });
export const setMessage = (payload) => ({ type: SET_MESSAGE, payload });
export const setShowNewMsgAlert = (payload) => ({ type: SET_NEW_MSG_ALERT, payload });

export const sendMessage = (payload) => ({ type: SEND_MESSAGE_REQUEST, payload });
export const joinRoom = (payload) => ({ type: JOIN_ROOM_REQUEST, payload });
export const exitRoom = (payload) => ({ type: EXIT_ROOM_REQUEST, payload });

export const setChatRooms = (payload) => ({ type: SET_CHAT_ROOMS, payload });

export const updateChatRoomLastMessage = (payload) => ({
  type: UPDATE_CHAT_ROOM_LAST_MESSAGE,
  payload, // { roomId, lastMessage, lastTime, unreadCountDelta }
});

// 3. 초기 상태
const initialState = {
    me: null, // 'me'는 현재 로그인한 사용자의 ID로 가정
    selectedUser: null,
    log: [],
    showNewMsgAlert: false,
    showSearchModal: false,
    searchTerm: '',
    message: '',
    chatRooms: [], // 이 배열에 각 채팅방 정보가 { roomId, otherUser: { id, nickname, profileImage }, lastMessage, lastTime, unreadCount } 형태로 들어있을 거야
};

// 4. 리듀서
const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CHAT_ROOMS:
            return { ...state, chatRooms: action.payload };

        case SET_ME:
            return { ...state, me: action.payload };
        case SET_SELECTED_USER:
            return { ...state, selectedUser: action.payload };
        case ADD_LOG:
            return { ...state, log: [...state.log, action.payload] };
        case CLEAR_LOG:
            return { ...state, log: [] };
        case TOGGLE_SEARCH_MODAL:
            return {
                ...state,
                showSearchModal:
                    action.payload !== null ? action.payload : !state.showSearchModal,
            };
        case SET_SEARCH_TERM:
            return { ...state, searchTerm: action.payload };
        case SET_MESSAGE:
            return { ...state, message: action.payload };
        case SET_NEW_MSG_ALERT:
            return { ...state, showNewMsgAlert: action.payload };

        case SEND_MESSAGE_SUCCESS:
            // SAGA에서 메시지 전송 성공 시 이 액션을 디스패치할 때
            // action.data에 실제 메시지 객체가 들어있을 경우 log에 추가
            return { ...state, log: [...state.log, action.data] };
        case SEND_MESSAGE_FAILURE:
            console.error('메시지 전송 실패:', action.error);
            return state;

        case JOIN_ROOM_SUCCESS:
            return state; // JOIN_ROOM_SUCCESS 시에는 chatRooms에 추가하는 로직이 필요할 수도 있음 (새 채팅 시작 시)
        
        case EXIT_ROOM_SUCCESS:
            // action.data는 { roomId, userId } 형태일 것이므로, 해당 roomId를 가진 채팅방을 chatRooms에서 제거
            return {
                ...state,
                chatRooms: state.chatRooms.filter(room => room.roomId !== action.data.roomId),
                selectedUser: null, // 나가면 선택된 채팅방 없애기
                log: [], // 나가면 채팅 기록 초기화
            };
        // ⭐ 여기까지 수정!

        case UPDATE_CHAT_ROOM_LAST_MESSAGE:
  return {
    ...state,
    chatRooms: state.chatRooms.map((room) => {
      if (room.roomId === action.payload.roomId) {
        return {
          ...room,
          lastMessage: action.payload.lastMessage,
          lastTime: action.payload.lastTime,
          unreadCount: Math.max(0, room.unreadCount + (action.payload.unreadCountDelta || 0)),
        };
      }
      return room;
    }),
  };
case 'UPDATE_READ_STATUS':
    console.log('[REDUCER] UPDATE_READ_STATUS', action.payload);
  const readMessageIdsSet = new Set(action.payload.readMessageIds.map(Number));

  return {
    ...state,
    log: state.log.map((msg) =>
      readMessageIdsSet.has(Number(msg.id))
        ? { ...msg, is_read: true }
        : msg
    ),
    chatRooms: state.chatRooms.map((room) => {
      if (room.roomId === action.payload.roomId) {
        return {
          ...room,
          unreadCount: Math.max(0, room.unreadCount - readMessageIdsSet.size),
        };
      }
      return room;
    }),
  };
            
        case JOIN_ROOM_FAILURE:
        case EXIT_ROOM_FAILURE:
            console.error('룸 관련 실패:', action.error);
            return state;

        default:
            return state;
    }
};

export default chatReducer;