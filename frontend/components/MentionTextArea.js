import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useDebounce from '../hooks/useDebounce'; // 너 기존에 있던 debounce 훅 쓰면 됨

const MentionTextArea = ({ value, onChange, onMentionSelect }) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);

  const debouncedMentionQuery = useDebounce(mentionQuery, 300);
const API_URL = 'http://localhost:3065';
  useEffect(() => {
    if (debouncedMentionQuery) {
      fetchMentionUsers(debouncedMentionQuery);
    } else {
      setMentionResults([]);
    }
  }, [debouncedMentionQuery]);

  const fetchMentionUsers = async (query) => {
    try {
      const response = await axios.get(`/mention/users?q=${encodeURIComponent(query)}&limit=5`, { withCredentials: true });
      setMentionResults(response.data);
    } catch (error) {
      console.error('mention user fetch error:', error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e); // 기존 PostForm의 setContent가 실행됨

    // @입력 감지
    const mentionMatch = newValue.slice(0, e.target.selectionStart).match(/@([^\s@]*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionList(true);
    } else {
      setMentionQuery('');
      setShowMentionList(false);
    }
  };

  const handleMentionClick = (user) => {
    // @닉네임 치환
    const textarea = textareaRef.current;
    const { selectionStart } = textarea;
    const textBefore = value.slice(0, selectionStart).replace(/@([^\s@]*)$/, `@${user.nickname} `);
    const textAfter = value.slice(selectionStart);

    const newText = textBefore + textAfter;
    onChange({ target: { value: newText } });

    if (onMentionSelect) {
      onMentionSelect(user);
    }

    setMentionQuery('');
    setMentionResults([]);
    setShowMentionList(false);
  };

  const textareaRef = useRef();

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder="게시글 내용을 입력하세요 (@닉네임 입력 가능)"
        rows={4}
        style={{ width: '100%', padding: 8 }}
      />

      {showMentionList && mentionResults.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: 'white',
            border: '1px solid #ccc',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 1000,
            margin: 0,
            padding: '5px',
            listStyle: 'none',
          }}
        >
          {mentionResults.map((user) => (
            <li
              key={user.id}
              onClick={() => handleMentionClick(user)}
              style={{ padding: '5px', cursor: 'pointer' }}
            >
              <img
  src={
    user.profile_img
      ? `http://localhost:3065${user.profile_img}` // 서버에서 /img로 줄 경우 prefix 붙여줘야 함
      : 'http://localhost:3065/img/profile/default.jpg' // 디폴트 이미지 경로
  }
  alt={user.nickname}
  style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '5px' }}
/>
              {user.nickname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionTextArea;
