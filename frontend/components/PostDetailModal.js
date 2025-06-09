import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaRetweet } from 'react-icons/fa';
import Comment from './Comment';
import ReportModal from './ReportModal';

const IMAGE_SIZE = { width: 540, height: 640 };

const PostDetailModal = ({
  post, basePost, origin, user,
  imageIndex, setImageIndex,
  show, onClose,
  liked, onLike, onUnlike,
  bookmarked, onBookmark, onUnbookmark,
  likeCount, regramCount, bookmarkCount, commentCount,
  onRegram, regramIconColor, regramDisabled, regramTooltip,
  showReportModal, setShowReportModal,
}) => {
  const images = basePost.Images || [];
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setImageIndex(i => (i < images.length - 1 ? i + 1 : 0));

  // 작성자/시간
  const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
  const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);

  // 본문 내용 렌더링
  const renderContent = (content) =>
    content
      ? content.split(/(#[^\s#]+)/g).map((part, i) =>
        part.startsWith('#') ? (
          <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff' }}>
            {part}
          </a>
        ) : (
          part
        )
      )
      : null;

  return !show ? null : (
    <div style={modalStyle} onClick={onClose}>
      <div style={detailBoxStyle} onClick={e => e.stopPropagation()}>
        {/* 왼쪽: 이미지 슬라이드 */}
        <div style={{
          ...IMAGE_SIZE, position: 'relative', background: '#eee', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {images.length > 0 ? (
            <img
              src={`http://localhost:3065/uploads/post/${images[imageIndex]?.src}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#eee' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#f3f3f3' }} />
          )}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} style={{ ...arrowBtnStyle, left: 16 }}>←</button>
              <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 16, left: 'auto' }}>→</button>
            </>
          )}
        </div>

        {/* 오른쪽: 상세 본문+아이콘+댓글 */}
        <div style={{
          flex: 1,
          minWidth: 390,
          height: IMAGE_SIZE.height,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          boxSizing: 'border-box',
          padding: '20px 24px',
          overflowX: 'hidden',
        }}>
          {/* 작성자/프로필 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, minHeight: 54 }}>
            <img
              src={post.User?.profile_img ? `http://localhost:3065${post.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'}
              alt="프로필"
              style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #bbb' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 20 }}>{post.User?.nickname}</div>
              <div style={{ fontSize: 14, color: '#888' }}>
                {minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`}
              </div>
            </div>
          </div>

          {/* 본문/리그램 */}
          <div style={{
            fontSize: 17,
            lineHeight: 1.6,
            marginBottom: 12,
            minHeight: 60,
            maxHeight: 130,
            overflowY: 'auto',
            overflowX: 'hidden',
            wordBreak: 'break-all',
          }}>
            {renderContent(post.content)}
          </div>

          {/* 아이콘/카운트 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, marginBottom: 8 }}>
            <div style={iconBtnStyle}>
              <FaRegComment />
              <span style={countStyle}>{commentCount}</span>
            </div>
            <button style={iconBtnStyle} onClick={liked ? onUnlike : onLike}>
              {liked ? <FaHeart color="red" /> : <FaRegHeart />}
              <span style={countStyle}>{likeCount}</span>
            </button>
            <button style={iconBtnStyle} onClick={onRegram} disabled={regramDisabled} title={regramTooltip}>
              <FaRetweet color={regramIconColor} />
              <span style={countStyle}>{regramCount}</span>
            </button>
            <button style={iconBtnStyle} onClick={bookmarked ? onUnbookmark : onBookmark}>
              {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
              <span style={countStyle}>{bookmarkCount}</span>
            </button>
          </div>
          {/* 댓글 전체 */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#fafbfc', borderRadius: 14, padding: '14px 10px 10px 10px' }}>
            <Comment postId={post.id} currentUserId={user?.id} />
          </div>
          {/* 신고 모달 */}
          {showReportModal && (
            <ReportModal
              visible={showReportModal}
              postId={post.id}
              onClose={() => setShowReportModal(false)}
              targetType={1}
            />
          )}
        </div>
        {/* 닫기 버튼 */}
        <button
          style={{
            position: 'absolute', top: 22, right: 32,
            fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa'
          }}
          onClick={onClose}
        >×</button>
      </div>
    </div>
  );
};

const detailBoxStyle = {
  display: 'flex',
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 3px 16px rgba(0,0,0,0.12)',
  overflow: 'hidden',
  position: 'relative',
  padding: 0,
};

const modalStyle = {
  position: 'fixed',
  zIndex: 9999,
  left: 0,
  top: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

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

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 26,
  color: '#444',
  outline: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};
const countStyle = {
  fontSize: 16,
  marginLeft: 4,
  color: '#444',
  minWidth: 18,
  textAlign: 'right',
  fontWeight: 600,
};

export default PostDetailModal;
