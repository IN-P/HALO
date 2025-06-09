import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, REMOVE_POST_REQUEST, REPORT_POST_REQUEST,
} from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import { REGRAM_REQUEST } from '../reducers/regram_IN';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaEllipsisH, FaRetweet } from 'react-icons/fa';
import { useRouter } from 'next/router';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton';
import PostDetailModal from './PostDetailModal';

const IMAGE_SIZE = { width: 540, height: 640 };

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);

  const [imageIndex, setImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef(null);

  // 리그램/원본 판단
  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const isMine = post.User?.id === user?.id;

  // 좋아요/북마크/리그램 (원본 기준)
  const basePost = isRegram && origin ? origin : post;
  const liked = basePost.Likers?.some((u) => u.id === user?.id);
  const bookmarked = basePost.Bookmarkers?.some((u) => u.id === user?.id);
  const likeCount = basePost.Likers?.length || 0;
  const regramCount = basePost.Regrams?.length || 0;
  const bookmarkCount = basePost.Bookmarkers?.length || 0;

  // 댓글/미리보기 (항상 post.Comments)
  const commentList = Array.isArray(post.Comments) ? post.Comments : [];
  const commentCount = commentList.length;
  const previewComments = commentList.slice(0, 2);
  const showMoreComments = commentCount > 2;

  // 이미지
  const isPureRegram = isRegram && (!post.content || post.content.trim() === '');
  const images = isPureRegram && origin ? origin.Images : post.Images;
  const [currentImages, setCurrentImages] = useState(images || []);
  useEffect(() => { setCurrentImages(images || []); }, [images]);
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : currentImages.length - 1));
  const nextImage = () => setImageIndex(i => (i < currentImages.length - 1 ? i + 1 : 0));

  // 메뉴바 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)
        && !document.getElementById('report-modal')?.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 리그램 아이콘 상태
  const isOriginMine = origin?.User?.id === user?.id;
  const isMyOriginRegrammed = isRegram && isOriginMine && post.User?.id !== user?.id;
  const isMyRegram = isRegram && post.User?.id === user?.id && !isOriginMine;
  const iRegrammedThis = !isRegram && post.Regrams?.some(rg => rg.User?.id === user?.id);
  const isOthersRegram = isRegram && !isOriginMine && post.User?.id !== user?.id;

  let regramIconColor = '#000';
  let regramDisabled = false;
  let regramTooltip = '리그램하기';
  if (isMine && !isRegram) {
    regramIconColor = '#aaa';
    regramDisabled = true;
    regramTooltip = '내 게시글은 리그램할 수 없습니다.';
  } else if (isMyOriginRegrammed) {
    regramIconColor = '#32e732';
    regramDisabled = true;
    regramTooltip = '내 글이 리그램된 글입니다.';
  } else if (isMyRegram) {
    regramIconColor = '#32e732';
    regramDisabled = true;
    regramTooltip = '이미 리그램한 글입니다.';
  } else if (iRegrammedThis) {
    regramIconColor = '#32e732';
    regramDisabled = true;
    regramTooltip = '이미 리그램한 글입니다.';
  } else if (isOthersRegram) {
    regramIconColor = '#32e732';
    regramDisabled = true;
    regramTooltip = '남이 리그램한 글입니다.';
  }

  // 이벤트
  const onEdit = () => { router.push(`/edit/${post.id}`); setShowMenu(false); };
  const onDelete = () => { if (window.confirm('정말 삭제하시겠습니까?')) dispatch({ type: REMOVE_POST_REQUEST, data: post.id }); };
  const onRegram = () => {
    if (regramDisabled) return;
    if (window.confirm('리그램하시겠습니까?')) {
      dispatch({ type: REGRAM_REQUEST, data: { postId: basePost.id, content: '', isPublic: true } });
    }
  };
  const onLike = () => dispatch({ type: LIKE_POST_REQUEST, data: basePost.id });
  const onUnlike = () => dispatch({ type: UNLIKE_POST_REQUEST, data: basePost.id });
  const onBookmark = () => dispatch({ type: BOOKMARK_POST_REQUEST, data: basePost.id });
  const onUnbookmark = () => dispatch({ type: UNBOOKMARK_POST_REQUEST, data: basePost.id });

  // 본문 해시태그 렌더링
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

      {/* 오른쪽: 본문+댓글 미리보기 */}
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
            onClick={() => router.push(`/profile/${post.User?.nickname}`)}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 20 }}>{post.User?.nickname}</div>
            <div style={{ fontSize: 14, color: '#888' }}>
              {/* 시간 */}
              {(() => {
                const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
                const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);
                return minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`;
              })()}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button style={menuBtnStyle} onClick={() => setShowMenu((v) => !v)}>
                <FaEllipsisH />
              </button>
              {showMenu && (
                <div style={menuDropdownStyle}>
                  {isMine ? (
                    isRegram ? (
                      // 내가 쓴 리그램글: 삭제만
                      <button
                        style={{ ...menuItemStyle, color: 'red' }}
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                      >
                        삭제
                      </button>
                    ) : (
                      // 내가 쓴 원본글: 수정/삭제
                      <>
                        <button style={menuItemStyle} onClick={onEdit}>수정</button>
                        <button
                          style={{ ...menuItemStyle, color: 'red' }}
                          onClick={() => {
                            onDelete();
                            setShowMenu(false);
                          }}
                        >
                          삭제
                        </button>
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
          </div>
        </div>

        {/* 본문/리그램 분기 */}
        {isRegram && isPureRegram && origin ? (
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

        {/* ----------- 아이콘/카운트 + 구분선 ----------- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, margin: '12px 0 0 0', borderTop: '1.5px solid #f2f2f2', paddingTop: 10 }}>
          <button style={iconBtnStyle} onClick={() => setShowDetailModal(true)}>
            <FaRegComment />
            <span style={countStyle}>{commentCount}</span>
          </button>
          <button style={iconBtnStyle} onClick={liked ? onUnlike : onLike}>
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
            <span style={countStyle}>{likeCount}</span>
          </button>
          <button
            style={iconBtnStyle}
            onClick={onRegram}
            disabled={regramDisabled}
            title={regramTooltip}
          >
            <FaRetweet color={regramIconColor} />
            <span style={countStyle}>{regramCount}</span>
          </button>
          <button style={iconBtnStyle} onClick={bookmarked ? onUnbookmark : onBookmark}>
            {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
            <span style={countStyle}>{bookmarkCount}</span>
          </button>
        </div>

        {/* ----------- 댓글 미리보기 디자인 개선 ----------- */}
        <div style={{
          margin: '8px 0 0 0',
          background: '#fafbfc',
          borderRadius: 10,
          minHeight: 40,
          padding: '10px 14px 8px 14px',
          border: '1px solid #f2f2f2',
          fontSize: 15,
          color: '#333',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {commentCount === 0 && (
            <div style={{ color: '#b0b0b0', margin: '6px 2px', fontStyle: 'italic', fontSize: 15 }}>
              아직 댓글이 없습니다 🙃
            </div>
          )}
          {previewComments.map((c, idx) =>
            c && c.User ? (
              <div key={c.id} style={{
                marginBottom: 4,
                padding: '2px 0 2px 0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 7,
                fontSize: 15,
                lineHeight: 1.6,
                borderRadius: 8,
                background: idx % 2 === 0 ? '#fff' : '#f4f9ff',
                boxShadow: '0 0.5px 1.5px rgba(100,140,210,0.04)',
                wordBreak: 'break-word'
              }}>
                <b style={{ marginRight: 7, color: '#1976d2', minWidth: 62 }}>{c.User.nickname}</b>
                <span style={{
                  color: '#222',
                  flex: 1,
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {c.content.length > 120 ? c.content.slice(0, 120) + '...' : c.content}
                </span>
              </div>
            ) : null
          )}
          {showMoreComments && (
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#2995f4',
                padding: 0,
                cursor: 'pointer',
                fontSize: 15,
                margin: '4px 0 2px 0',
                fontWeight: 500,
                display: 'block',
                textAlign: 'left'
              }}
              onClick={() => setShowDetailModal(true)}
            >
              댓글 {commentCount}개 모두 보기
            </button>
          )}
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
      {/* 상세 모달 */}
      <PostDetailModal
        post={post}
        basePost={basePost}
        origin={origin}
        user={user}
        imageIndex={imageIndex}
        setImageIndex={setImageIndex}
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        liked={liked}
        onLike={onLike}
        onUnlike={onUnlike}
        bookmarked={bookmarked}
        onBookmark={onBookmark}
        onUnbookmark={onUnbookmark}
        likeCount={likeCount}
        regramCount={regramCount}
        bookmarkCount={bookmarkCount}
        commentCount={commentCount}
        onRegram={onRegram}
        regramIconColor={regramIconColor}
        regramDisabled={regramDisabled}
        regramTooltip={regramTooltip}
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
      />
    </div>
  );
};

// ----- 스타일 정의 -----
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
