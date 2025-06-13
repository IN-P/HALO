import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useDebounce from '../hooks/useDebounce'; 

//
const MentionTextArea = ({ value, onChange}) => {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentionList, setShowMentionList] = useState(false);

  const debouncedMentionQuery = useDebounce(mentionQuery, 300);
  const API_URL = 'http://localhost:3065'; 
  const textareaRef = useRef(null);

  useEffect(() => {
    if (debouncedMentionQuery) {
      fetchMentionUsers(debouncedMentionQuery);
    } else {
      setMentionResults([]);
    }
  }, [debouncedMentionQuery]);

  const fetchMentionUsers = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/mention/users?q=${encodeURIComponent(query)}&limit=5`, { withCredentials: true });
      setMentionResults(response.data);
    } catch (error) {
      console.error('mention user fetch error:', error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e); 


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
 
    const textarea = textareaRef.current;
    const { selectionStart } = textarea;


    const textBefore = value.slice(0, selectionStart).replace(/@([^\s@]*)$/, `@${user.nickname} `);
    const textAfter = value.slice(selectionStart);

    const newText = textBefore + textAfter;
    onChange({ target: { value: newText } }); 

    setMentionQuery('');
    setMentionResults([]);
    setShowMentionList(false);

   
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder="게시글 내용을 입력하세요"
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
              style={{ padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <img
                src={user.profile_img ? `${API_URL}${user.profile_img}` : `${API_URL}/img/profile/default.jpg`}
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