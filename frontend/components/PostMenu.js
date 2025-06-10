import React from 'react';
import ReportButton from './ReportButton';

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 32,
  color: '#888',
  padding: 0,
  outline: 'none',
};
const menuDropdownStyle = {
  position: 'absolute',
  right: 0,
  top: 36,
  background: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  borderRadius: 8,
  zIndex: 10,
  minWidth: 130,
};
const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 16,
  color: '#444',
};

function PostMenu({ showMenu, setShowMenu, menuRef, isMine, isRegram, onEdit, onDelete, setShowReportModal }) {
  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button style={menuBtnStyle} onClick={() => setShowMenu((v) => !v)}>
        ⋮
      </button>
      {showMenu && (
        <div style={menuDropdownStyle}>
          {isMine ? (
            isRegram ? (
              <button
                style={{ ...menuItemStyle, color: 'red' }}
                onClick={() => { onDelete(); setShowMenu(false); }}
              >삭제</button>
            ) : (
              <>
                <button style={menuItemStyle} onClick={onEdit}>수정</button>
                <button
                  style={{ ...menuItemStyle, color: 'red' }}
                  onClick={() => { onDelete(); setShowMenu(false); }}
                >삭제</button>
              </>
            )
          ) : (
            <ReportButton
              onClick={() => {
                setShowReportModal(true);
                setShowMenu(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PostMenu;
