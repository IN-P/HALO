import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {LIKE_POST_REQUEST, UNLIKE_POST_REQUEST,} from '../reducers/post_IN';
import {BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST,} from '../reducers/bookmark_IN';
import { REGRAM_REQUEST } from '../reducers/regram_IN';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaRetweet } from 'react-icons/fa';
import PostMenu from './PostMenu';
import PostDetailModal from './PostDetailModal';
import ReportModal from './ReportModal';
import { getTotalCommentCount } from '../utils/comment';
import Comment from './Comment';

const IMAGE_SIZE = { width: 540, height: 640 };

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user_YG);

  const [imageIndex, setImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef(null);

  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const isMine = post.User?.id === user?.id;
  const basePost = isRegram && origin ? origin : post;
  const liked = basePost.Likers?.some((u) => u.id === user?.id);
  const bookmarked = basePost.Bookmarkers?.some((u) => u.id === user?.id);
  const likeCount = basePost.Likers?.length || 0;
  const regramCount = basePost.Regrams?.length || 0;
  const bookmarkCount = basePost.Bookmarkers?.length || 0;

  const isPureRegram = isRegram && (!post.content || post.content.trim() === '');
  const images = isPureRegram && origin ? origin.Images : post.Images;
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

  const isOriginMine = origin?.User?.id === user?.id;
  const isMyOriginRegrammed = isRegram && isOriginMine && post.User?.id !== user?.id;
  const isMyRegram = isRegram && post.User?.id === user?.id && !isOriginMine;
  const iRegrammedThis = !isRegram && post.Regrams?.some(rg => rg.User?.id === user?.id);
  const isOthersRegram = isRegram && !isOriginMine && post.User?.id !== user?.id;

  let regramIconColor = '#000', regramDisabled = false, regramTooltip = '리그램하기';
  if (isMine && !isRegram) {
    regramIconColor = '#aaa'; regramDisabled = true; regramTooltip = '내 게시글은 리그램할 수 없습니다.';
  } else if (isMyOriginRegrammed || isMyRegram || iRegrammedThis || isOthersRegram) {
    regramIconColor = '#32e732'; regramDisabled = true; regramTooltip = '이미 리그램된 글입니다.';
  }

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
            <div style={{ fontSize: 14, color: '#888' }}>
              {(() => {
                const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
                const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);
                return minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`;
              })()}
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
