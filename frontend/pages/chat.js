import { useEffect, useState } from 'react';
import socket from '../socket';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const roomId = 'room1'; // 테스트용 채팅방 ID

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('receive_message', (data) => {
      setLog((prev) => [...prev, data.message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('send_message', {
      roomId,
      message,
    });
    setMessage('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🗨️ 채팅방</h2>
      <div style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'scroll' }}>
        {log.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
};

export default ChatPage;