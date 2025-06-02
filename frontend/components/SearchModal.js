// components/SearchModal.js
import React from 'react';
import useDebounceSearch from '../hooks/useDebounce';

const SearchModal = ({ onClose, onUserSelect, userMap }) => {
  const dataForSearch = userMap && typeof userMap === 'object' ? Object.values(userMap) : [];
  const { searchTerm, handleSearchChange, filteredData: searchedUsers } = useDebounceSearch(
    '', dataForSearch, 'nickname', 300
  );

  return (
    // 모달 컨테이너 (이 부분이 피그마 이미지의 팝업창 본체)
    // position: absolute를 사용하여 부모 요소에 대해 상대적으로 위치 지정
    <div style={{
      position: 'absolute', // 부모 요소 (pages/chat.js의 flex:1 div)에 대해 상대적
      top: 0, // 부모 요소의 상단에 붙임
      left: 0, // 부모 요소의 왼쪽에 붙임
      width: '100%', // 부모 요소의 전체 너비를 사용
      height: '100%', // 부모 요소의 전체 높이를 사용
      backgroundColor: 'white', // 배경색을 흰색으로 (피그마 이미지처럼)
      border: '1px solid #ccc', // 테두리 추가 (피그마 이미지처럼)
      borderRadius: '8px', // 둥근 모서리
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // 그림자 추가 (선택 사항)
      zIndex: 900, // 다른 요소들 위에 보이도록 (AppLayout의 z-index와 겹치지 않게 주의)
      display: 'flex',
      flexDirection: 'column', // 내용을 세로로 쌓음
      padding: '20px',
    }}>
      {/* 팝업창 상단 (제목 및 닫기 버튼) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>새로운 채팅 시작</h3> {/* 제목 */}
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555' }}
        >
          &times;
        </button>
      </div>

      {/* 검색 입력창 */}
      <input
        type="text"
        placeholder="닉네임을 검색하세요..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: 'calc(100% - 20px)', // 패딩 고려
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '15px'
        }}
      />

      {/* 검색 결과 목록 */}
      <div style={{ flex: 1, overflowY: 'auto' }}> {/* 목록 영역 스크롤 가능하게 */}
        {searchedUsers && searchedUsers.length > 0 ? (
          searchedUsers.map(user => (
            <div
              key={user.id}
              onClick={() => onUserSelect(user)}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: 'white', // 배경색 지정
                '&:hover': { backgroundColor: '#f0f0f0' } // 호버 효과 (인라인 스타일로는 직접 적용 어려움, CSS 파일 사용 권장)
              }}
            >
              <img src={user.profileImage} alt={user.nickname} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 15 }} />
              <span style={{ fontWeight: 'bold' }}>{user.nickname}</span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999' }}>
            {searchTerm ? '검색 결과가 없습니다.' : '다른 유저를 검색해보세요.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchModal;