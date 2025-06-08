import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, REMOVE_POST_REQUEST, REPORT_POST_REQUEST,
} from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import { REGRAM_REQUEST } from '../reducers/regram_IN';
import Comment from './Comment';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaEllipsisH, FaRetweet } from 'react-icons/fa';
import { useRouter } from 'next/router';
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

  // ★ basePost: 항상 "원본글" 기준
  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const basePost = isRegram && origin ? origin : post; // 이거만 쓰면 됨!
  const isMine = post.User?.id === user?.id;

  // 내가 리그램한 글인가? (리그램이고, 원본 작성자가 로그인 유저)
  const isMyRegram = isRegram && origin && origin.User?.id === user?.id;

  // 좋아요/북마크/리그램만 basePost 기준!
  const liked = basePost.Likers?.some((u) => u.id === user?.id);
  const bookmarked = basePost.Bookmarkers?.some((u) => u.id === user?.id);
  const likeCount = basePost.Likers?.length || 0;
  const regramCount = basePost.Regrams?.length || 0;
  const bookmarkCount = basePost.Bookmarkers?.length || 0;

  // 댓글 카운트는 반드시 post.Comments (리그램이든 뭐든 자기 자신 id의 Comments)
  const commentCount = post.Comments?.length || 0;

  // 이미지 (리그램+코멘트 없는 순수 리그램은 원본 이미지, 나머지는 post 이미지)
  const isPureRegram = isRegram && (!post.content || post.content.trim() === '');
  const images = isPureRegram && origin ? origin.Images : post.Images;
  const [currentImages, setCurrentImages] = useState(images || []);
  useEffect(() => { setCurrentImages(images || []); }, [images]);
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : currentImages.length - 1));
  const nextImage = () => setImageIndex(i => (i < currentImages.length - 1 ? i + 1 : 0));

  // 시간
  const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
  const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);

  // 메뉴바 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 수정/삭제/신고/리그램
  const onEdit = () => { router.push(`/edit/${post.id}`); setShowMenu(false); };
  const onDelete = () => { if (window.confirm('정말 삭제하시겠습니까?')) dispatch({ type: REMOVE_POST_REQUEST, data: post.id }); };
  const onReport = () => { if (window.confirm('정말 신고하시겠습니까?')) dispatch({ type: REPORT_POST_REQUEST, data: post.id }); };

  // 리그램 아이콘 색상 및 활성화/비활성화, 얼럿 텍스트 설정
  let regramIconColor = '#000'; // 기본 검정
  let regramDisabled = false;   // 클릭 가능 여부
  let regramTooltip = '리그램하기';

  if (isMine || isMyRegram) {
    // 내 글 혹은 내가 리그램한 글은 회색, 클릭 금지
    regramIconColor = '#aaa';
    regramDisabled = true;
    regramTooltip = '리그램할 수 없습니다.';
  } else if (isRegram && origin && origin.User?.id !== user?.id) {
    // 남이 쓴 글을 리그램한 글은 초록색, 클릭 금지
    regramIconColor = '#32e732';
    regramDisabled = true;
    regramTooltip = '이미 리그램한 글입니다.';
  }

  const onRegram = () => {
    if (regramDisabled) return; // 비활성화 상태면 무반응
    if (window.confirm('리그램하시겠습니까?')) {
      dispatch({ type: REGRAM_REQUEST, data: { postId: basePost.id, content: '', isPublic: true } });
    }
  };

  // 좋아요/북마크 클릭 핸들러
  const onLike = () => dispatch({ type: LIKE_POST_REQUEST, data: basePost.id });
  const onUnlike = () => dispatch({ type: UNLIKE_POST_REQUEST, data: basePost.id });
  const onBookmark = () => dispatch({ type: BOOKMARK_POST_REQUEST, data: basePost.id });
  const onUnbookmark = () => dispatch({ type: UNBOOKMARK_POST_REQUEST, data: basePost.id });

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

  return (
    <div style={cardStyle}>
      {/* 왼쪽 이미지 */}
      <div style={{ ...IMAGE_SIZE, position: 'relative', background: '#eee', flexShrink: 0 }}>
        {currentImages.length > 0 ? (
          <img
            src={`http://localhost:3065/uploads/post/${currentImages[imageIndex]?.src}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#eee', cursor: 'pointer' }}
            onClick={() => setShowImageModal(true)}
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
        {showImageModal && currentImages[imageIndex] && (
          <div style={modalStyle} onClick={() => setShowImageModal(false)}>
            <img
              src={`http://localhost:3065/uploads/post/${currentImages[imageIndex]?.src}`}
              alt=""
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12 }}
            />
          </div>
        )}
      </div>

      {/* 오른쪽: 본문+댓글 전체 */}
      <div style={{
        flex: 1,
        height: IMAGE_SIZE.height,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        minWidth: 390,
        boxSizing: 'border-box',
        padding: '20px 24px',
        overflowX: 'hidden',
      }}>
        {/* 상단: 리그램 표시 */}
        {isRegram && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
            color: '#0088ff',
            fontWeight: 600,
            fontSize: 15,
          }}>
            <FaRetweet style={{ marginRight: 5 }} />
            재게시했습니다
          </div>
        )}

        {/* 작성자+상단 메뉴 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, minHeight: 54 }}>
          <img
            src={post.User?.profile_img ? `http://localhost:3065${post.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'}
            alt="프로필"
            style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #bbb' }}
            onClick={() => router.push(`/profile/${post.User?.nickname}`)} // 아바타 클릭시 프로필 이동
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 20 }}>{post.User?.nickname}</div>
            <div style={{ fontSize: 14, color: '#888' }}>
              {minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* 리그램된 글이면 메뉴(수정) 숨김 */}
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
                    {/* 리그램이면 "삭제"만, 아니면 수정/삭제 */}
                    {!isRegram && <button style={menuItemStyle} onClick={onEdit}>수정</button>}
                    <button style={{ ...menuItemStyle, color: 'red' }} onClick={() => { onDelete(); setShowMenu(false); }}>삭제</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 본문/미리보기 - 리그램 분기 */}
        {isRegram && isPureRegram && origin ? (
          // 리그램(내 코멘트X): 원본글만
          <div style={{
            marginBottom: 12,
            maxHeight: 130,
            minHeight: 60,
            overflowY: 'auto',
            overflowX: 'hidden',
            wordBreak: 'break-all',
            fontSize: 17,
            lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 600, color: '#888', marginBottom: 5 }}>
              {origin.User?.nickname}님의 게시글
            </div>
            <div>
              {renderContent(origin.content)}
            </div>
          </div>
        ) : isRegram && origin ? (
          // 리그램(코멘트 있음): 내 코멘트 + 원본 미리보기 박스
          <>
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
            <div style={{
              border: '1px solid #eee',
              background: '#f8f8fa',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              fontSize: 15,
              color: '#444',
              overflowX: 'hidden',
              wordBreak: 'break-all',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {origin.User?.nickname}님의 게시글
              </div>
              <div>
                {renderContent(origin.content)}
              </div>
              {origin.Images && origin.Images.length > 0 && (
                <img src={`http://localhost:3065/uploads/post/${origin.Images[0].src}`}
                  style={{ width: 180, borderRadius: 8, marginTop: 10 }} alt="리그램 원본 이미지" />
              )}
            </div>
          </>
        ) : (
          // 일반글
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
        )}

        {/* 아이콘/카운트 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, marginBottom: 8 }}>
          {/* 1. 댓글 */}
          <button style={iconBtnStyle} onClick={() => setShowComments(v => !v)}>
            <FaRegComment />
            <span style={countStyle}>{commentCount}</span>
          </button>
          {/* 2. 좋아요 */}
          <button style={iconBtnStyle} onClick={liked ? onUnlike : onLike}>
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
            <span style={countStyle}>{likeCount}</span>
          </button>
          {/* 3. 리그램 */}
          <button
            style={iconBtnStyle}
            onClick={onRegram}
            disabled={regramDisabled}
            title={regramTooltip}
          >
            <FaRetweet color={regramIconColor} />
            <span style={countStyle}>{regramCount}</span>
          </button>
          {/* 4. 북마크 */}
          <button style={iconBtnStyle} onClick={bookmarked ? onUnbookmark : onBookmark}>
            {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
            <span style={countStyle}>{bookmarkCount}</span>
          </button>
        </div>

        {/* 댓글 */}
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
