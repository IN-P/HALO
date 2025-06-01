import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList'; // 이 컴포넌트가 존재한다고 가정합니다.
import socket from '../socket'; // socket.io 클라이언트 인스턴스가 여기서 임포트된다고 가정합니다.

const ChatPage = () => {
  const [me, setMe] = useState(1); // 현재 사용자 ID (예: 덴지)
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 채팅 상대
  const [message, setMessage] = useState(''); // 입력 메시지
  const [log, setLog] = useState([]); // 채팅 로그 (메시지 목록)
  const [showNewMsgAlert, setShowNewMsgAlert] = useState(false); // 새 메시지 알림 표시 여부
  const [showSearchModal, setShowSearchModal] = useState(false); // 채팅 상대 검색 모달 표시 여부
  const [searchTerm, setSearchTerm] = useState(''); // 검색어

  const chatBoxRef = useRef(); // 채팅 메시지 스크롤 관리를 위한 ref

  // 더미 사용자 데이터 (실제 프로젝트에서는 API를 통해 가져와야 합니다)
  const userMap = {
    1: { id: 1, nickname: '덴지', profileImage: '/images/덴지.png' },
    2: { id: 2, nickname: '마키마', profileImage: '/images/마키마.png' },
    3: { id: 3, nickname: '파워', profileImage: '/images/파워.png' },
    4: { id: 4, nickname: '아키', profileImage: '/images/아키.png' },
  };

  // 채팅 박스가 스크롤 최하단에 있는지 확인
  const isAtBottom = () => {
    const box = chatBoxRef.current;
    if (!box) return true; // ref가 없으면 항상 최하단으로 간주
    return box.scrollHeight - box.scrollTop - box.clientHeight < 100; // 하단 100px 이내
  };

  // 스크롤 이벤트 핸들러: 최하단이면 새 메시지 알림 숨김
  const handleScroll = () => {
    if (isAtBottom()) setShowNewMsgAlert(false);
  };

  // 새 메시지 수신 핸들러
  const handleReceive = useCallback((data) => {
    setLog((prev) => [...prev, data]);
  }, []);

  // ✅ '나가기' 성공 시 처리
  const handleExitSuccess = useCallback(() => {
    alert('채팅방을 나갔습니다.');
    setSelectedUser(null); // 선택된 유저 초기화
    setLog([]); // 채팅 로그 초기화
    setShowSearchModal(false); // 혹시 모를 상황에 대비해 검색 모달도 닫기
    console.log('✅ 클라이언트: 채팅방 나가기 성공 및 UI 초기화');
  }, []);

  // ✅ '나가기' 실패 시 처리
  const handleExitFailed = useCallback((data) => {
    alert(`채팅방 나가기 실패: ${data.message || '알 수 없는 오류'}`);
    console.error('❌ 클라이언트: 채팅방 나가기 실패:', data);
  }, []);

  // `me` (현재 사용자)가 변경될 때 또는 초기 렌더링 시 실행
  // `selectedUser`가 아직 없는 경우, 기본 상대를 설정하고 로그를 초기화합니다.
  useEffect(() => {
    if (!selectedUser) {
      // 이 부분은 초기 렌더링 시에만 작동하도록 하거나,
      // 실제 로그인 유저의 채팅 목록을 가져오는 로직으로 대체해야 합니다.
      // 현재는 테스트를 위해 me가 1이면 2를, 2면 1을 기본 상대로 설정합니다.
      const initialOtherUser = me === 1 ? userMap[2] : userMap[1];
      setSelectedUser(initialOtherUser);
    }
    setLog([]); // 유저 전환 시 메시지 로그 초기화 (이전 유저의 채팅 기록을 지움)
  }, [me]); // selectedUser는 의존성 배열에서 제외하여 무한 루프를 방지합니다.

  // 현재 나와 선택된 사용자 간의 채팅방 ID 생성
  // 항상 작은 ID가 먼저 오도록 정렬하여 일관된 roomId를 만듭니다.
  const roomId = selectedUser ? `chat-${[me, selectedUser.id].sort((a, b) => a - b).join('-')}` : null;

  // roomId가 유효할 때 소켓 연결 및 이벤트 리스너 설정
  useEffect(() => {
    if (!roomId) return;

    console.log(`🔌 소켓: Joining room ${roomId}`);
    socket.emit('join_room', roomId);

    // 메시지 수신 리스너
    socket.on('receive_message', handleReceive);
    // ✅ 나가기 성공/실패 리스너 등록
    socket.on('exit_room_success', handleExitSuccess);
    socket.on('exit_room_failed', handleExitFailed);

    // 컴포넌트 언마운트 또는 roomId 변경 시 리스너 해제
    return () => {
      console.log(`🔌 소켓: Leaving room ${roomId} and cleaning up listeners`);
      // socket.emit('leave_room', roomId); // 필요하다면 leave_room 이벤트도 추가
      socket.off('receive_message', handleReceive);
      // ✅ 나가기 리스너 해제
      socket.off('exit_room_success', handleExitSuccess);
      socket.off('exit_room_failed', handleExitFailed);
    };
  }, [roomId, handleReceive, handleExitSuccess, handleExitFailed]); // 콜백 함수들을 의존성 배열에 포함

  // 새 메시지 수신 시 스크롤 및 알림 처리
  useEffect(() => {
    if (!chatBoxRef.current || log.length === 0) return;
    const lastMsg = log[log.length - 1];
    const wasAtBottom = isAtBottom(); // 새 메시지 받기 전 스크롤 위치 기억

    // 내가 보낸 메시지이거나, 이미 최하단에 스크롤되어 있었다면 스크롤을 최하단으로 이동
    if (lastMsg.senderId === me || wasAtBottom) {
      requestAnimationFrame(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      });
      setShowNewMsgAlert(false); // 새 메시지 알림 숨김
    } else {
      // 상대방이 보낸 메시지이고, 내가 최하단에 있지 않았다면 새 메시지 알림 표시
      setShowNewMsgAlert(true);
    }
  }, [log, me]); // log 또는 me가 변경될 때마다 실행

  // 메시지 전송
  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return; // 메시지 내용이 비어있거나 선택된 유저가 없으면 전송 안 함

    const newMsg = {
      id: Date.now(), // 임시 ID
      roomId,
      senderId: me,
      content: message,
      time: new Date().toLocaleTimeString('ko-KR', { // 현재 시간 포맷
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    socket.emit('send_message', newMsg); // 서버로 메시지 전송
    setMessage(''); // 메시지 입력창 초기화
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', position: 'relative' }}>
        {/* ChatList 컴포넌트는 현재 빈 배열을 넘겨주고 있음. 실제 데이터로 채워야 함. */}
        <ChatList chatRooms={[]} onSelectUser={() => {}} />

        <div style={{ flex: 1 }}>
          {/* 테스트용 사용자 전환 버튼 */}
          <div style={{ margin: '16px 0 0 20px' }}>
            <button onClick={() => setMe(1)} style={{ marginRight: 8 }}>🙋 덴지로 보기</button>
            <button onClick={() => setMe(2)}>🧍 마키마로 보기</button>
          </div>

          {/* ✅ 채팅 상대 검색 모달 */}
          {showSearchModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: '#fff', padding: 20, borderRadius: 8,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', width: '80%', maxWidth: 400,
                textAlign: 'center', position: 'relative',
              }}>
                <button
                  onClick={() => setShowSearchModal(false)}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                  }}
                >
                  &times;
                </button>
                <h3>채팅 상대 검색</h3>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="닉네임을 입력하세요 (@닉네임도 가능)"
                  style={{ padding: '8px', width: '90%', marginBottom: 15 }}
                />
                <ul style={{ listStyle: 'none', padding: 0, maxHeight: 200, overflowY: 'auto' }}>
                  {Object.values(userMap)
                    .filter((user) => user.id !== me && // 자신은 검색 결과에서 제외
                      user.nickname.toLowerCase().includes(searchTerm.replace('@', '').toLowerCase())
                    )
                    .map((user) => (
                      <li key={user.id} style={{ marginBottom: 5 }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setLog([]); // 새 채팅 시작 시 기존 로그 초기화
                            setSearchTerm(''); // 검색어 초기화
                            setShowSearchModal(false); // 모달 닫기
                          }}
                          style={{
                            padding: '8px 12px', margin: 4, width: '90%', textAlign: 'left',
                            background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 4,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}
                        >
                          <img
                            src={user.profileImage}
                            alt="프로필"
                            style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 10 }}
                          />
                          {user.nickname}
                        </button>
                      </li>
                    ))}
                </ul>
                {Object.values(userMap)
                    .filter((user) => user.id !== me &&
                      user.nickname.toLowerCase().includes(searchTerm.replace('@', '').toLowerCase())
                    ).length === 0 && searchTerm.length > 0 && (
                      <p style={{ color: '#888', fontSize: 14 }}>검색 결과가 없습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 조건부 렌더링: 선택된 유저가 없으면 채팅 시작 안내, 있으면 채팅방 UI */}
          {!selectedUser ? (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
              <h2 style={{ cursor: 'pointer' }} onClick={() => setShowSearchModal(true)}>
                💬 채팅을 시작하세요
              </h2>
            </div>
          ) : (
            <div style={{ padding: 20, position: 'relative' }}>
              <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</span>
                <button
                  onClick={() => {
                    // ✅ 서버에 '나가기' 요청을 보내고, 응답을 받은 후 UI를 업데이트하도록 수정
                    socket.emit('exit_room', { roomId, userId: me });
                    // UI 업데이트는 서버의 exit_room_success 이벤트 핸들러에서 처리됩니다.
                  }}
                  style={{ marginLeft: 10, padding: '4px 10px', background: '#eee', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                >
                  나가기
                </button>
              </h2>

              {/* 채팅 메시지 목록 */}
              <div ref={chatBoxRef} onScroll={handleScroll} style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'scroll', marginBottom: 10 }}>
                {log.map((msg, idx) => {
                  const isMine = msg.senderId === me;
                  const sender = userMap[msg.senderId];
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-start', margin: '6px 0', flexDirection: 'row' }}>
                      {!isMine && (
                        <img src={sender.profileImage} alt="상대 프로필" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8, marginLeft: 4 }} />
                      )}
                      <div style={{ maxWidth: '70%' }}>
                        {!isMine && (
                          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 2 }}>{sender.nickname}</div>
                        )}
                        <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 12, background: isMine ? '#d1f0ff' : '#f2f2f2', color: '#000' }}>{msg.content}</div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2, textAlign: isMine ? 'right' : 'left' }}>{msg.time}</div>
                      </div>
                      {/* 내가 보낸 메시지일 경우 프로필 이미지는 따로 표시하지 않음 */}
                      {isMine && null}
                    </div>
                  );
                })}
              </div>

              {/* 새 메시지 알림 (스크롤이 최하단이 아닐 때) */}
              {showNewMsgAlert && (
                <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', zIndex: 10 }}
                  onClick={() => {
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    setShowNewMsgAlert(false);
                  }}
                >
                  🔽 새 메시지 도착
                </div>
              )}

              {/* 메시지 입력 필드 및 전송 버튼 */}
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="메시지를 입력하세요"
                style={{ width: '80%', padding: '8px' }}
              />
              <button onClick={sendMessage} style={{ padding: '8px 16px', marginLeft: 8 }}>전송</button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;