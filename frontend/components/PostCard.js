import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LIKE_POST_REQUEST,
  UNLIKE_POST_REQUEST,
  REMOVE_POST_REQUEST,
  REPORT_POST_REQUEST
} from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import Comment from './Comment';
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark, FaBookmark, FaEllipsisH } from 'react-icons/fa';
import { useRouter } from 'next/router';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);

  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  const liked = post.Likers?.some((u) => u.id === user?.id);
  const bookmarked = post.Bookmarkers?.some((u) => u.id === user?.id);
  const isMine = post.User?.id === user?.id;
  const minutesAgo = Math.floor((Date.now() - new Date(post.User?.last_active).getTime()) / 60000);

  // 이미지 슬라이드
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : post.Images.length - 1));
  const nextImage = () => setImageIndex(i => (i < post.Images.length - 1 ? i + 1 : 0));

  // 메뉴 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 수정 버튼: 페이지 이동
  const onEdit = () => {
    router.push(`/edit/${post.id}`);
    setShowMenu(false);
  };

  // 삭제 핸들러
  const onDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      dispatch({ type: REMOVE_POST_REQUEST, data: post.id });
    }
  };

  // 신고 핸들러
  const onReport = () => {
    if (window.confirm('정말 신고하시겠습니까?')) {
      dispatch({ type: REPORT_POST_REQUEST, data: post.id });
    }
  };

  return (
    <div style={cardStyle}>
      {/* 왼쪽: 이미지 슬라이더 */}
      <div style={{ width: 420, position: 'relative', background: '#eee' }}>
        <img
          src={`http://localhost:3065/uploads/post/${post.Images?.[imageIndex]?.src}`}
          alt=""
          style={{ width: '100%', height: 420, objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => setShowImageModal(true)}
        />
        {post.Images && post.Images.length > 1 && (
          <>
            <button onClick={prevImage} style={arrowBtnStyle}>←</button>
            <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 12, left: 'auto' }}>→</button>
          </>
        )}
        {showImageModal && (
          <div style={modalStyle} onClick={() => setShowImageModal(false)}>
            <img
              src={`http://localhost:3065/uploads/post/${post.Images?.[imageIndex]?.src}`}
              alt=""
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }}
            />
          </div>
        )}
      </div>
      {/* 오른쪽: 정보 + 액션 */}
      <div style={{ flex: 1, padding: 32, position: 'relative' }}>
        {/* 작성자 정보 + 메뉴 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img
            src={post.User?.profile_img
              ? `http://localhost:3065${post.User.profile_img}`
              : 'http://localhost:3065/img/profile/default.jpg'}
            alt="프로필"
            style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginRight: 14, border: '2px solid #bbb' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>{post.User?.nickname}</div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`}
            </div>
          </div>
          {/* 점점점 메뉴 */}
          <div style={{ marginLeft: 'auto', position: 'relative' }} ref={menuRef}>
            <button style={menuBtnStyle} onClick={() => setShowMenu((v) => !v)}>
              <FaEllipsisH />
            </button>
            {showMenu && (
              <div style={menuDropdownStyle}>
                {isMine ? (
                  <>
                    {/* 수정: 페이지 이동 */}
                    <button style={menuItemStyle} onClick={onEdit}>수정</button>
                    <button style={menuItemStyle} onClick={() => { onDelete(); setShowMenu(false); }}>삭제</button>
                  </>
                ) : (
                  <button style={menuItemStyle} onClick={() => { onReport(); setShowMenu(false); }}>신고</button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* 게시글 텍스트 */}
        <div style={{ fontSize: 16, marginBottom: 20 }}>
          {post.content}
        </div>
        {/* 버튼들 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 24 }}>
          {/* 좋아요 */}
          <button
            style={iconBtnStyle}
            onClick={() =>
              liked
                ? dispatch({ type: UNLIKE_POST_REQUEST, data: post.id })
                : dispatch({ type: LIKE_POST_REQUEST, data: post.id })
            }
          >
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>
          {/* 댓글 */}
          <button style={iconBtnStyle} onClick={() => setShowComments(v => !v)}>
            <FaRegComment />
          </button>
          {/* 채팅 */}
          <button style={iconBtnStyle}>
            <FaRegPaperPlane />
          </button>
          {/* 북마크 */}
          <button style={iconBtnStyle} onClick={() => {
            bookmarked
              ? dispatch({ type: UNBOOKMARK_POST_REQUEST, data: post.id })
              : dispatch({ type: BOOKMARK_POST_REQUEST, data: post.id });
          }}>
            {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
          </button>
        </div>
        {/* 좋아요/댓글 수 표시 */}
        <div style={{ margin: '14px 0 0 2px', fontSize: 14, color: '#888' }}>
          {post.Likers?.length || 0} likes • {post.Comments?.length || 0} comments
        </div>
        {/* 댓글 리스트/작성창 접기 */}
        {showComments && (
          <div style={{ marginTop: 20 }}>
            <Comment postId={post.id} currentUserId={user?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyle = {
  display: 'flex',
  background: '#fff',
  borderRadius: 18,
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  margin: '24px 0',
  padding: 0,
  overflow: 'hidden',
};

const arrowBtnStyle = {
  position: 'absolute',
  top: '50%',
  left: 12,
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 36,
  height: 36,
  fontSize: 24,
  cursor: 'pointer',
  zIndex: 1,
};
const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 24,
  color: '#444',
  outline: 'none',
};
const menuBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 30,
  color: '#888',
  padding: 0,
  outline: 'none',
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
const menuDropdownStyle = {
  position: 'absolute', right: 0, top: 36, background: '#fff', boxShadow: '0 2px 8px #0001',
  borderRadius: 8, zIndex: 10, minWidth: 120
};
const menuItemStyle = {
  display: 'block', width: '100%', padding: '10px 16px',
  border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer',
  fontSize: 16, color: '#444'
};

export default PostCard;
