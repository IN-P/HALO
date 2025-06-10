import React from 'react';

const IMAGE_SIZE = { width: 540, height: 640 };
const arrowBtnStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.4)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 48,
  height: 48,
  fontSize: 28,
  cursor: 'pointer',
  zIndex: 1,
};

function PostImageSection({ currentImages, imageIndex, setShowDetailModal, prevImage, nextImage }) {
  return (
    <div style={{ ...IMAGE_SIZE, position: 'relative', background: '#eee', flexShrink: 0 }}>
      {currentImages.length > 0 ? (
        <img
          src={`http://localhost:3065/uploads/post/${currentImages[imageIndex]?.src}`}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#eee', cursor: 'pointer' }}
          onClick={() => setShowDetailModal(true)}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#f3f3f3' }} />
      )}
      {currentImages.length > 1 && (
        <>
          <button onClick={prevImage} style={{ ...arrowBtnStyle, left: 16 }}>←</button>
          <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 16, left: 'auto' }}>→</button>
        </>
      )}
    </div>
  );
}

export default PostImageSection;
