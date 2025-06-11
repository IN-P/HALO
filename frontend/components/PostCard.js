import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LIKE_POST_REQUEST, UNLIKE_POST_REQUEST } from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import { REGRAM_REQUEST } from '../reducers/regram_IN';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaRetweet } from 'react-icons/fa';
import PostMenu from './PostMenu';
import PostDetailModal from './PostDetailModal';
import ReportModal from './ReportModal';
import { getTotalCommentCount } from '../utils/comment';
import Comment from './Comment';

const IMAGE_SIZE = { width: 540, height: 640 };

function getRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}일 전`;
}

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user_YG);

  const [imageIndex, setImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef(null);

  // 원본글 기준 데이터(리그램이면 원본, 아니면 자기자신)
  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const basePost = isRegram && origin ? origin : post;

  // 내 글인지
  const isMine = post.User?.id === user?.id;

  // 내가 이미 리그램했는지(원본 기준, 내 리그램이 메인피드에 뜬 경우 + 내가 쓴 글을 내가 또 리그램X)
  const myRegram = (
    // 1. 원본글: 내 리그램이 있는지(내가 이미 리그램)
    !isRegram && post.Regrams?.some(rg => rg.User?.id === user?.id)
  ) || (
    // 2. 리그램글: 내가 쓴 리그램
    isRegram && post.User?.id === user?.id
  );

  // 리그램 버튼 상태/색상/툴팁
  let regramIconColor = '#000';
  let regramDisabled = false;
  let regramTooltip = '리그램하기';

  if (myRegram) {
    regramIconColor = '#32e732'; // 연두색
    regramDisabled = true;
    regramTooltip = '이미 리그램한 글입니다.';
  }

  // 원본글이 비공개 && 내가 주인이 아닐 때(=나만보기) 버튼 자체를 안 보일 수도 있음 (숨김처리)
  if (isRegram && origin && origin.private_post && origin.user_id !== user?.id) {
    // basePost가 비공개/나만보기 + 내가 주인 아니면 리그램버튼 비활성+숨김
    regramDisabled = true;
    regramTooltip = '비공개(나만보기) 원본글입니다.';
  }

  // 원본글 삭제됨(post.Regram 없음) = 이미 서버에서 안 내려오지만 혹시 몰라 프론트에서도 처리
  if (isRegram && !origin) return null;

  // 좋아요/북마크 상태
  const liked = basePost.Likers?.some((u) => u.id === user?.id);
  const bookmarked = basePost.Bookmarkers?.some((u) => u.id === user?.id);
  const likeCount = basePost.Likers?.length || 0;
  const regramCount = basePost.Regrams?.length || 0;
  const bookmarkCount = basePost.Bookmarkers?.length || 0;
  const images = basePost.Images || [];
  const [currentImages, setCurrentImages] = useState(images || []);
  useEffect(() => { setCurrentImages(images || []); }, [images]);

  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : currentImages.length - 1));
  const nextImage = () => setImageIndex(i => (i < currentImages.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)
        && !document.getElementById('report-modal')?.contains(e.target)
      ) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const onRegram = () => {
    if (regramDisabled) return;
    if (window.confirm('리그램하시겠습니까?')) {
      dispatch({ type: REGRAM_REQUEST, data: { postId: basePost.id, content: basePost.content, isPublic: true } });
    }
  };

  const onLike = () => dispatch({ type: LIKE_POST_REQUEST, data: basePost.id });
  const onUnlike = () => dispatch({ type: UNLIKE_POST_REQUEST, data: basePost.id });
  const onBookmark = () => dispatch({ type: BOOKMARK_POST_REQUEST, data: basePost.id });
  const onUnbookmark = () => dispatch({ type: UNBOOKMARK_POST_REQUEST, data: basePost.id });

  const renderContent = (content) =>
    content
      ? content.split(/(#[^\s#]+)/g).map((part, i) =>
        part.startsWith('#')
          ? <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff' }}>{part}</a>
          : part)
      : null;

  return (
    <div style={cardStyle}>
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

      <div style={{
        flex: 1, height: IMAGE_SIZE.height, display: 'flex', flexDirection: 'column',
        background: '#fff', minWidth: 390, boxSizing: 'border-box', padding: '20px 24px', overflowX: 'hidden'
      }}>
        {isRegram && (
          <div style={{
            display: 'flex', alignItems: 'center', marginBottom: 12,
            color: '#0088ff', fontWeight: 600, fontSize: 15,
          }}>
            <FaRetweet style={{ marginRight: 5 }} />재게시했습니다
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, minHeight: 54 }}>
          <img
            src={post.User?.profile_img ? `http://localhost:3065${post.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'}
            alt="프로필"
            style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #bbb' }}
            onClick={() => window.location.href = `/profile/${post.User?.nickname}`}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              {post.User?.nickname}
              {post.private_post && (
                <span style={{
                  display: 'inline-block',
                  background: '#ffe3e3',
                  color: '#e50000',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 10,
                  marginLeft: 6,
                }}>나만보기</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
              마지막 접속&nbsp;
              {getRelativeTime(post.User?.last_active)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <PostMenu
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              menuRef={menuRef}
              isMine={isMine}
              isRegram={isRegram}
              postId={post.id}
              setShowReportModal={setShowReportModal}
            />
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#bbb', margin: '2px 0 6px 0' }}>
          작성일&nbsp;
          {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }) : ''}
        </div>

        <div style={{
          fontSize: 17, lineHeight: 1.6, marginBottom: 12,
          minHeight: 60, maxHeight: 130, overflowY: 'auto', overflowX: 'hidden', wordBreak: 'break-all',
        }}>
          {renderContent(post.content)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, margin: '12px 0 0 0', borderTop: '1.5px solid #f2f2f2', paddingTop: 10 }}>
          <button style={iconBtnStyle} onClick={() => setShowDetailModal(true)}>
            <FaRegComment />
            <span style={countStyle}>{getTotalCommentCount(post.Comments || [])}</span>
          </button>
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
        <Comment
          postId={post.id}
          currentUserId={user?.id}
          preview={true}
          initialComments={post.Comments}
          previewCount={3}
          onShowDetailModal={() => setShowDetailModal(true)}
        />
        {showReportModal && (
          <ReportModal
            visible={showReportModal}
            postId={post.id}
            onClose={() => setShowReportModal(false)}
            targetType={1}
          />
        )}
      </div>
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
        commentCount={getTotalCommentCount(post.Comments || [])}
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

export default PostCard;
