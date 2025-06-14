import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaRetweet, FaShareAlt } from 'react-icons/fa';
import CommentDetail from './CommentDetail';
import ReportModal from './ReportModal';
import MapModal from './MapModal';

const IMAGE_SIZE = { width: 756, height: 896 };

const PostDetailModal = ({
  post, basePost, origin, user,
  imageIndex, setImageIndex,
  show, onClose,
  liked, onLike, onUnlike,
  bookmarked, onBookmark, onUnbookmark,
  likeCount, regramCount, bookmarkCount, commentCount,
  onRegram, regramIconColor, regramDisabled, regramTooltip,
  showReportModal, setShowReportModal,
  handleCopyLink,
}) => {
  const images = basePost.Images || [];
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const nextImage = () => setImageIndex(i => (i < images.length - 1 ? i + 1 : 0));

  const [showMapModal, setShowMapModal] = useState(false);

  const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
  const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);

  const writtenAt = post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }) : '';

  const isRegram = !!post.regram_id;
  const RegramInfo = isRegram && origin && origin.User && (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
      fontSize: 15,
      color: '#444'
    }}>
      <img
        src={origin.User.profile_img ? `http://localhost:3065${origin.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'}
        alt="프로필"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          objectFit: 'cover',
          marginRight: 7,
          border: '1.5px solid #bbb',
          cursor: 'pointer'
        }}
        onClick={() => window.location.href = `/profile/${origin.User.id}`}
      />
      <span
        style={{
          fontWeight: 700,
          marginRight: 5,
          cursor: 'pointer',
          color: '#0055ff'
        }}
        onClick={() => window.location.href = `/profile/${origin.User.id}`}
      >
        {origin.User.nickname}
      </span>
      님의 게시글을 리그램했습니다
    </div>
  );

  return !show ? null : (
    <div style={modalStyle} onClick={onClose}>
      <div style={detailBoxStyle} onClick={e => e.stopPropagation()}>
        {/* 왼쪽: 이미지 */}
        <div style={{
          width: IMAGE_SIZE.width,
          height: IMAGE_SIZE.height,
          position: 'relative',
          background: '#eee',
          flexShrink: 0,
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
        {/* 오른쪽: 정보+댓글 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: 480,
          minWidth: 440,
          maxWidth: 520,
          height: IMAGE_SIZE.height,
          background: '#fff',
          boxSizing: 'border-box',
          padding: '36px 40px 20px 40px',
          overflow: 'hidden',
        }}>
          {isRegram && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#0088ff',
              fontWeight: 600,
              fontSize: 15,
              marginBottom: 4,
              gap: 5
            }}>
              <FaRetweet />재게시했습니다
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, minHeight: 54 }}>
            <img
              src={post.User?.profile_img ? `http://localhost:3065${post.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'}
              alt="프로필" onClick={() => window.location.href = `/profile/${post.User.id}`}
              style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #bbb' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 20 }}>{post.User?.nickname}</div>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
                마지막 접속&nbsp;
                {post.User?.last_active
                  ? (minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`)
                  : '-'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#bbb', margin: '2px 0 6px 0' }}>
            작성일&nbsp;
            {writtenAt}
          </div>
          {post.location && (
            <div style={{
              fontSize: 15, color: '#1558d6', marginBottom: 10,
              cursor: 'pointer', fontWeight: 500, textDecoration: 'underline'
            }}
              onClick={() => setShowMapModal(true)}>
              {post.location}
            </div>
          )}
          {RegramInfo}
          <div style={{
            fontSize: 17, lineHeight: 1.6, marginBottom: 10,
            minHeight: 36, maxHeight: 70, overflowY: 'auto', wordBreak: 'break-all',
          }}>
            {post.content}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, fontSize: 27, margin: '10px 0 6px 0',
            borderTop: '1.5px solid #f2f2f2', paddingTop: 8, flexWrap: 'nowrap'
          }}>
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
            <button style={iconBtnStyle} onClick={handleCopyLink} title="공유 링크 복사">
              <FaShareAlt />
              <span style={{ fontSize: 16, marginLeft: 2, fontWeight: 500 }}>공유</span>
            </button>
          </div>
          {/* 댓글 상세 */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', background: '#fafbfc',
            borderRadius: 14, padding: '18px 10px 0 10px', marginTop: 8, position: 'relative'
          }}>
            <CommentDetail
              postId={post.id}
              currentUserId={user?.id}
            />
          </div>
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
        <MapModal
          visible={showMapModal}
          onClose={() => setShowMapModal(false)}
          location={post.location}
        />
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
  zIndex: 3000,
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
