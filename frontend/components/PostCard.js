import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LIKE_POST_REQUEST, UNLIKE_POST_REQUEST } from '../reducers/post_IN';
import { BOOKMARK_POST_REQUEST, UNBOOKMARK_POST_REQUEST } from '../reducers/bookmark_IN';
import { FaHeart, FaRegHeart, FaRegComment, FaBookmark, FaRegBookmark, FaRetweet, FaShareAlt } from 'react-icons/fa';
import PostMenu from './PostMenu';
import PostDetailModal from './PostDetailModal';
import ReportModal from './ReportModal';
import MapModal from './MapModal';
import { getTotalCommentCount } from '../utils/comment';
import CommentPreview from './CommentPreview';

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
  const commentState = useSelector((state) => state.comment_IN.comments[post.id] || []);
  const mentionUserMap = useSelector((state) => state.mentionUser_JW?.mentionUserMap || {});

  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const basePost = isRegram && origin ? origin : post;
  const feedProfile = post.User;
  const feedNickname = post.User?.nickname;
  const feedProfileImg = post.User?.profile_img;
  const privatePost = isRegram && origin ? origin.private_post : post.private_post;
  const location = isRegram && origin ? origin.location : post.location;
  const latitude = isRegram && origin ? origin.latitude : post.latitude;
  const longitude = isRegram && origin ? origin.longitude : post.longitude;
  const userInfo = isRegram && origin ? origin.User : post.User;
  const isAccountPrivate = isRegram && origin ? origin.User?.is_private : post.User?.is_private;

  const [imageIndex, setImageIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const menuRef = useRef(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 1300);
  };

  const isMine = post.User?.id === user?.id;
  let myRegramPost = null;
  if (!isRegram && post.Regrams) {
    myRegramPost = post.Regrams.find(rg => rg.User?.id === user?.id);
  }
  if (isRegram && post.User?.id === user?.id) {
    myRegramPost = post;
  }
  const myRegram = !!myRegramPost;

  let regramIconColor = '#000';
  let regramDisabled = false;
  let regramTooltip = '리그램하기';
  if (isRegram && origin && origin.private_post && origin.user_id !== user?.id) {
    regramDisabled = true;
    regramTooltip = '비공개(나만보기) 원본글입니다.';
  } else if (myRegram) {
    regramIconColor = '#32e732';
    regramTooltip = '이미 리그램한 글입니다.';
  }
  if (isRegram && !origin) return null;

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
    if (myRegramPost) {
      if (window.confirm('리그램을 취소하시겠습니까?')) {
        dispatch({ type: 'REGRAM_IN/UNREGRAM_REQUEST', data: { regramPostId: myRegramPost.id } });
      }
    } else {
      if (window.confirm('리그램하시겠습니까?')) {
        dispatch({ type: 'REGRAM_IN/REGRAM_REQUEST', data: { postId: basePost.id, content: basePost.content, isPublic: true } });
      }
    }
  };

  const onLike = () => dispatch({ type: LIKE_POST_REQUEST, data: basePost.id });
  const onUnlike = () => dispatch({ type: UNLIKE_POST_REQUEST, data: basePost.id });
  const onBookmark = () => dispatch({ type: BOOKMARK_POST_REQUEST, data: basePost.id });
  const onUnbookmark = () => dispatch({ type: UNBOOKMARK_POST_REQUEST, data: basePost.id });

  const onShowDetailModal = () => setShowDetailModal(true);

  const RegramInfo = isRegram && origin && origin.User && (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, fontSize: 15, color: '#444' }}>
      <img src={origin.User.profile_img ? `http://localhost:3065${origin.User.profile_img}` : 'http://localhost:3065/img/profile/default.jpg'} alt="프로필"
        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 7, border: '1.5px solid #bbb', cursor: 'pointer' }}
        onClick={() => window.location.href = `/profile/${origin.User.id}`} />
      <span style={{ fontWeight: 700, marginRight: 5, cursor: 'pointer', color: '#0055ff' }} onClick={() => window.location.href = `/profile/${origin.User.id}`}>{origin.User.nickname}</span>
      님의 게시글을 리그램했습니다
    </div>
  );

  const mentionMap = (post.Mentions || []).reduce((acc, m) => {
    acc[m.nickname?.toLowerCase()] = m.user_id;
    return acc;
  }, {});

  const renderContent = (content, userMap = {}) =>
    content?.split(/(#[^\s#]+|@[^\s@]+)/g).filter(Boolean).map((part, i) => {
      if (part.startsWith('#')) {
        return <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff', textDecoration: 'none' }}>{part}</a>;
      } else if (part.startsWith('@')) {
        const nickname = part.slice(1).toLowerCase();
        const userId = userMap[nickname] || mentionUserMap[nickname];
        return userId ? <a key={i} href={`/profile/${userId}`} style={{ color: '#28a745' }}>{part}</a> : <span key={i} style={{ color: '#28a745' }}>{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });

  return (
    <div style={{ display: 'flex', background: '#fff', borderRadius: 20, boxShadow: '0 3px 16px rgba(0,0,0,0.12)', margin: '32px 0', overflow: 'hidden', position: 'relative', width: IMAGE_SIZE.width + 480 }}>
      <div style={{ width: IMAGE_SIZE.width, height: IMAGE_SIZE.height, position: 'relative', background: '#eee', flexShrink: 0 }}>
        {currentImages.length > 0 ? (
          <img src={`http://localhost:3065/uploads/post/${currentImages[imageIndex]?.src}`} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#eee', cursor: 'pointer' }}
            onClick={onShowDetailModal} />
        ) : (<div style={{ width: '100%', height: '100%', background: '#f3f3f3' }} />)}
        {currentImages.length > 1 && (
          <>
            <button onClick={prevImage} style={{ ...arrowBtnStyle, left: 16 }}>←</button>
            <button onClick={nextImage} style={{ ...arrowBtnStyle, right: 16, left: 'auto' }}>→</button>
          </>
        )}
      </div>

      <div style={{ flex: 1, height: IMAGE_SIZE.height, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 390, boxSizing: 'border-box', padding: '20px 24px', overflowX: 'hidden' }}>
        {isRegram && (<div style={{ display: 'flex', alignItems: 'center', color: '#0088ff', fontWeight: 600, fontSize: 15, marginBottom: 4, gap: 5 }}><FaRetweet />재게시했습니다</div>)}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <img src={feedProfileImg ? `http://localhost:3065${feedProfileImg}` : 'http://localhost:3065/img/profile/default.jpg'} alt="프로필"
            style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #bbb' }}
            onClick={() => window.location.href = `/profile/${feedProfile?.id}`} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
              {feedNickname}
              {privatePost && (<span style={{ background: '#ffe3e3', color: '#e50000', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 10 }}>나만보기</span>)}
              {isAccountPrivate === 1 && (<span style={{ background: '#eee', color: '#1558d6', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 10 }}>비공개</span>)}
            </div>
            <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>마지막 접속 {getRelativeTime(feedProfile?.last_active)}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <PostMenu showMenu={showMenu} setShowMenu={setShowMenu} menuRef={menuRef} isMine={isMine} isRegram={isRegram} postId={post.id} setShowReportModal={setShowReportModal} />
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#bbb', margin: '2px 0 6px 0' }}>작성일 {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</div>
        {location && (<div style={{ fontSize: 15, color: '#1558d6', marginBottom: 10, cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }} onClick={() => setShowMapModal(true)}>{location}</div>)}
        {RegramInfo}
        <div style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 12, minHeight: 60, maxHeight: 130, overflowY: 'auto', wordBreak: 'break-word' }}>
          {renderContent(post.content, mentionMap)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, margin: '12px 0 0 0', borderTop: '1.5px solid #f2f2f2', paddingTop: 10 }}>
          <button style={iconBtnStyle} onClick={onShowDetailModal}><FaRegComment /><span style={countStyle}>{getTotalCommentCount(commentState)}</span></button>
          <button style={iconBtnStyle} onClick={liked ? onUnlike : onLike}>{liked ? <FaHeart color="red" /> : <FaRegHeart />}<span style={countStyle}>{likeCount}</span></button>
          <button style={iconBtnStyle} onClick={onRegram} disabled={regramDisabled} title={regramTooltip}><FaRetweet color={regramIconColor} /><span style={countStyle}>{regramCount}</span></button>
          <button style={iconBtnStyle} onClick={bookmarked ? onUnbookmark : onBookmark}>{bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}<span style={countStyle}>{bookmarkCount}</span></button>
          <button style={iconBtnStyle} onClick={handleCopyLink} title="공유 링크 복사"><FaShareAlt /><span style={{ fontSize: 16, marginLeft: 2, fontWeight: 500 }}>공유</span></button>
        </div>
        <div style={{ margin: '20px 0 0 0', flex: 1, minHeight: 0 }}>
          <CommentPreview postId={post.id} onShowDetailModal={onShowDetailModal} />
        </div>
        {showReportModal && <ReportModal visible={showReportModal} postId={post.id} onClose={() => setShowReportModal(false)} targetType={1} />}
      </div>
      <PostDetailModal post={post} basePost={basePost} origin={origin} user={user} imageIndex={imageIndex} setImageIndex={setImageIndex} show={showDetailModal} onClose={() => setShowDetailModal(false)} liked={liked} onLike={onLike} onUnlike={onUnlike} bookmarked={bookmarked} onBookmark={onBookmark} onUnbookmark={onUnbookmark} likeCount={likeCount} regramCount={regramCount} bookmarkCount={bookmarkCount} commentCount={getTotalCommentCount(commentState)} onRegram={onRegram} regramIconColor={regramIconColor} regramDisabled={regramDisabled} regramTooltip={regramTooltip} showReportModal={showReportModal} setShowReportModal={setShowReportModal} />
      {showCopyToast && (<div style={{ position: 'fixed', bottom: 48, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '12px 26px', borderRadius: 10, fontSize: 16, zIndex: 3000, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>링크가 복사되었습니다!</div>)}
      <MapModal visible={showMapModal} onClose={() => setShowMapModal(false)} location={location} latitude={latitude} longitude={longitude} />
    </div>
  );
};

const arrowBtnStyle = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: 28, cursor: 'pointer', zIndex: 1 };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: '#444', outline: 'none', display: 'flex', alignItems: 'center', gap: 4 };
const countStyle = { fontSize: 16, marginLeft: 4, color: '#444', minWidth: 18, textAlign: 'right', fontWeight: 600 };

export default PostCard;
