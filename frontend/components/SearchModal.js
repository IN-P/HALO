import React, { useState, useEffect, useCallback } from 'react';
import useSearch from '../hooks/useSearch';

const SearchModal = ({ onClose, onUserSelect, userMap }) => {
  const API_URL = 'http://localhost:3065';

  const dataForSearch = userMap && typeof userMap === 'object' ? Object.values(userMap) : [];

  const [localTerm, setLocalTerm] = useState('');

  const { searchTerm, handleSearchChange, filteredData: searchedUsers } = useSearch(
    '', // 초기 검색어는 빈 문자열
    dataForSearch,
    'nickname'
  );

  return (
    <div style={{
      position: 'absolute',
      top: '400px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '400px',
      maxHeight: '60%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
    }}>
      {/* 팝업창 상단 (제목 및 닫기 버튼) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0 }}>새로운 채팅 시작</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#555'
          }}
        >
          &times;
        </button>
      </div>

      {/* 검색 입력창 */}
      <input
        type="text"
        placeholder="닉네임을 검색하세요."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: 'calc(100% - 20px)',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '15px'
        }}
      />

      {/* 검색 결과 목록 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {searchedUsers && searchedUsers.length > 0 ? (
          searchedUsers.map(user => (
            <div
              key={user.id}
              onClick={() => onUserSelect(user)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '16px',
                marginBottom: '8px',
                cursor: 'pointer',
                background: 'linear-gradient(to bottom, #a8ddf7, #d0e8ff)',
              }}
            >
              <img
                src={user.profileImage ? `${API_URL}${user.profileImage}` : '/default.png'}
                alt={user.nickname}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  marginRight: 15
                }}
              />
              <span style={{ fontWeight: 'bold' }}>{user.nickname}</span>
            </div>
          ))
        ) : (
           <p style={{ textAlign: 'center', color: '#999' }}>
             {searchTerm ? '검색 결과가 없습니다.' : '다른 유저를 검색해보세요.'}
           </p>
        )
        }
      </div>
    </div>
  );
};

export default SearchModal;
