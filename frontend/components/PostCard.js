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
import FollowButton from '../components/FollowButton';
import ReportModal from './ReportModal';
import ReportButton from './ReportButton'; // 윫


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
  const [showReportModal, setShowReportModal] = useState(false); // 윫
  // ===== 리그램/원본 분기처리 =====
  const isRegram = !!post.regram_id;
  const origin = post.Regram;
  const isPureRegram = isRegram && (!post.content || post.content.trim() === '');
  // 버튼/카운트 등은 항상 "원본글" 기준으로
  const basePost = isPureRegram && origin ? origin : post;
  // 단, 댓글/수정/삭제는 내 글 기준(post.id)
  const isMine = post.User?.id === user?.id;

  // 각종 상태
  const liked = basePost.Likers?.some((u) => u.id === user?.id);
  const bookmarked = basePost.Bookmarkers?.some((u) => u.id === user?.id);

  // 이미지 표시도 분기
  const images = isPureRegram && origin ? origin.Images : post.Images;
  const [currentImages, setCurrentImages] = useState(images || []);
  useEffect(() => { setCurrentImages(images || []); }, [images]);
  const prevImage = () => setImageIndex(i => (i > 0 ? i - 1 : currentImages.length - 1));
  const nextImage = () => setImageIndex(i => (i < currentImages.length - 1 ? i + 1 : 0));

  // 시간 계산 (활동 안 넣었으면 createdAt 사용)
  const baseDate = post.User?.last_active ? new Date(post.User.last_active) : new Date(post.createdAt);
  const minutesAgo = Math.floor((Date.now() - baseDate.getTime()) / 60000);

  // 메뉴바 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)
        && !document.getElementById('report-modal')?.contains(e.target) //윫
      ) {
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
  const onRegram = () => { dispatch({ type: REGRAM_REQUEST, data: { postId: basePost.id, content: '', isPublic: true }, }); };

  // 본문 내용 렌더링 함수
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
      {/* 왼쪽 이미지 영역 */}
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
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 20 }}>{post.User?.nickname}</div>
            <div style={{ fontSize: 14, color: '#888' }}>
              {minutesAgo < 1 ? '방금 전' : `${minutesAgo}분 전`}
            </div>
          </div>{/* 율 수정 */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button style={menuBtnStyle} onClick={() => setShowMenu((v) => !v)}>
                <FaEllipsisH />
              </button>
              {showMenu && (
                <div style={menuDropdownStyle}>
                  {isMine ? (
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
                  ) : (
                    <button
                      style={menuItemStyle}
                      onClick={() => {
                        setShowReportModal(true); // 신고 버튼 클릭 시 모달 상태 따로 띄움
                        setShowMenu(false); // 메뉴 닫기
                      }}
                    >
                      신고하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>


        </div>

        {/* 본문/미리보기 - 리그램 분기 */}
        {isRegram && isPureRegram && origin ? (
          // 리그램(내 코멘트X): 원본글만
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#888', marginBottom: 5 }}>
              {origin.User?.nickname}님의 게시글
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.6 }}>
              {renderContent(origin.content)}
            </div>
          </div>
        ) : isRegram && origin ? (
          // 리그램(코멘트 있음): 내 코멘트 + 원본 미리보기 박스
          <>
            <div style={{
              fontSize: 17, lineHeight: 1.6, marginBottom: 12,
              minHeight: 60, maxHeight: 130, overflowY: 'auto'
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
              color: '#444'
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
            fontSize: 17, lineHeight: 1.6, marginBottom: 12,
            minHeight: 60, maxHeight: 130, overflowY: 'auto'
          }}>
            {renderContent(post.content)}
          </div>
        )}

        {/* 좋아요/댓글/리그램/북마크 (항상 원본 기준) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 26, marginBottom: 8 }}>
          <button
            style={iconBtnStyle}
            onClick={() => liked
              ? dispatch({ type: UNLIKE_POST_REQUEST, data: basePost.id })
              : dispatch({ type: LIKE_POST_REQUEST, data: basePost.id })}
          >
            {liked ? <FaHeart color="red" /> : <FaRegHeart />}
          </button>
          <button style={iconBtnStyle} onClick={() => setShowComments(v => !v)}>
            <FaRegComment />
          </button>
          <button style={iconBtnStyle} onClick={onRegram}>
            <FaRetweet color={isRegram ? "#00aaff" : undefined} />
          </button>
          <span style={{ fontSize: 16, color: "#0088ff" }}>
            {basePost.Regrams?.length || 0}회 재게시
          </span>
          <button
            style={iconBtnStyle}
            onClick={() => bookmarked
              ? dispatch({ type: UNBOOKMARK_POST_REQUEST, data: basePost.id })
              : dispatch({ type: BOOKMARK_POST_REQUEST, data: basePost.id })}
          >
            {bookmarked ? <FaBookmark color="#007bff" /> : <FaRegBookmark />}
          </button>
        </div>

        {/* 좋아요/댓글 수 (원본 기준) */}
        <div style={{ fontSize: 15, color: '#666', marginBottom: 8 }}>
          {basePost.Likers?.length || 0} likes • {basePost.Comments?.length || 0} comments
        </div>

        {/* 댓글 (내 글 기준) */}
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

        {/* 신고 모달 추가!! */}
        {showReportModal && (
          <ReportModal
            visible={showReportModal}
            postId={post.id}
            onClose={() => setShowReportModal(false)}
          />
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
