import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, REMOVE_POST_REQUEST, REPORT_POST_REQUEST,
} from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import { RETWEET_REQUEST } from '../reducers/retweet_IN';
import Comment from './Comment';
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark, FaBookmark, FaEllipsisH, FaRetweet } from 'react-icons/fa';
import { useRouter } from 'next/router';
import FollowButton from '../components/FollowButton';
import ReportModal from './ReportModal';

const IMAGE_SIZE = { width: 540, height: 640 };

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);

  const [imageIndex, setImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const menuRef = useRef(null);

  const liked = post.Likers?.some((u) => u.id === user?.id);
  const bookmarked = post.Bookmarkers?.some((u) => u.id === user?.id);
  const isMine = post.User?.id === user?.id;
  const minutesAgo = Math.floor((Date.now() - new Date(post.User?.last_active).getTime()) / 60000);

  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : post.Images.length - 1));
  const nextImage = () => setImageIndex(i => (i < post.Images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const onEdit = () => {
    router.push(`/edit/${post.id}`);
    setShowMenu(false);
  };

  const onDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      dispatch({ type: REMOVE_POST_REQUEST, data: post.id });
    }
  };

  const onReport = () => {
    if (window.confirm('정말 신고하시겠습니까?')) {
      dispatch({ type: REPORT_POST_REQUEST, data: post.id });
    }
  };

  const onRetweet = () => {
    dispatch({ type: RETWEET_REQUEST, data: post.id });
  };

  return (
    <div style={cardStyle}>
      {/* 왼쪽 이미지 영역 */}
      <div style={{ ...IMAGE_SIZE, position: 'relative', background: '#eee', flexShrink: 0 }}>
        <img
          src={`http://localhost:3065/uploads/post/${post.Images?.[imageIndex]?.src}`}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#eee', cursor: 'pointer' }}
          onClick={() => setShowImageModal(true)}
        />
        {post.Images && post.Images.length > 1 && (
          <>
            <button onClick={prevImage} style={{ ...arrowBtnStyle, left: 16 }}>←</button>
            <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 16, left: 'auto' }}>→</button>
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

      {/* 오른쪽: 본문+댓글 전체 */}
      <div
        style={{
          flex: 1,
          height: IMAGE_SIZE.height,
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          minWidth: 390,
          boxSizing: 'border-box',
          padding: '20px 24px',
          overflowX: 'hidden',
        }}
      >
        {/* 작성자+상단 메뉴 */}
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
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {post.User?.id && user?.id !== post.User.id && (
              <FollowButton toUserId={Number(post.User.id)} />
            )}
            {!isMine ? (
              <button style={menuBtnStyle} onClick={() => setShowReportForm(prev => !prev)}>
                <FaEllipsisH />
              </button>
            ) : (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button style={menuBtnStyle} onClick={() => setShowMenu((v) => !v)}>
                  <FaEllipsisH />
                </button>
                {showMenu && (
                  <div style={menuDropdownStyle}>
                    <button style={menuItemStyle} onClick={onEdit}>수정</button>
                    <button style={{ ...menuItemStyle, color: 'red' }} onClick={() => { onDelete(); setShowMenu(false); }}>삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 리트윗된 게시글 미리보기 */}
        {post.Retweet && (
          <div style={{
            border: '1px solid #eee',
            background: '#f8f8fa',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            fontSize: 15,
            color: '#444'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              {post.Retweet.User?.nickname}님의 게시글
            </div>
            <div>
              {post.Retweet.content.split(/(#[^\s#]+)/g).map((part, i) =>
                part.startsWith('#') ? (
                  <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff' }}>
                    {part}
                  </a>
                ) : (
                  part
                )
              )}
            </div>
            {post.Retweet.Images && post.Retweet.Images.length > 0 && (
              <img src={`http://localhost:3065/uploads/post/${post.Retweet.Images[0].src}`}
                style={{ width: 180, borderRadius: 8, marginTop: 10 }} alt="리트윗 이미지" />
            )}
          </div>
        )}

        {/* 본문 내용 */}
        <div
          style={{
            flex: '0 0 130px',
            maxHeight: 130,
            overflowY: 'auto',
            marginBottom: 12,
            fontSize: 17,
            lineHeight: 1.6,
            paddingRight: 4,
            minHeight: 60,
          }}
        >
          {post.content.split(/(#[^\s#]+)/g).map((part, i) =>
            part.startsWith('#') ? (
              <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff' }}>
                {part}
              </a>
            ) : (
              part
            )
          )}
        </div>

        {/* 좋아요/댓글/아이콘 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, marginBottom: 8 }}>
          <button
            style={iconBtnStyle}
            onClick={() => liked
              ? dispatch({ type: UNLIKE_POST_REQUEST, data: post.id })
              : dispatch({ type: LIKE_POST_REQUEST, data: post.id })}
          >
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>
          <button style={iconBtnStyle} onClick={() => setShowComments(v => !v)}>
            <FaRegComment />
          </button>
          <button style={iconBtnStyle}>
            <FaRegPaperPlane />
          </button>
          <button style={iconBtnStyle} onClick={onRetweet}>
            <FaRetweet />
          </button>
          <button
            style={iconBtnStyle}
            onClick={() => bookmarked
              ? dispatch({ type: UNBOOKMARK_POST_REQUEST, data: post.id })
              : dispatch({ type: BOOKMARK_POST_REQUEST, data: post.id })}
          >
            {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
          </button>
        </div>

        {/* 좋아요/댓글 수 */}
        <div style={{ fontSize: 15, color: '#666', marginBottom: 8 }}>
          {post.Likers?.length || 0} likes • {post.Comments?.length || 0} comments
        </div>

        {/* 댓글 영역 (토글) */}
        {showComments && (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              background: '#fafbfc',
              borderRadius: 14,
              padding: '14px 10px 10px 10px',
            }}
          >
            <Comment postId={post.id} currentUserId={user?.id} />
          </div>
        )}

        {/* 신고 모달 */}
        {showReportForm && (
          <div style={{ marginTop: 24 }}>
            <ReportModal visible={showReportForm} postId={post.id} onClose={() => setShowReportForm(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

const cardStyle = {
  display: 'flex',
  background: '#fff',
  borderRadius: 20,
  boxShadow: '0 3px 16px rgba(0,0,0,0.12)',
  margin: '28px 0',
  padding: 0,
  overflow: 'hidden',
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
};

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 32,
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

export default PostCard;
