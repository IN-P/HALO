import React, { useEffect, useState } from "react";
import { BulbFilled, SafetyOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import useToggle from "../../hooks/useToggle";
import BlockButton from "../../components/BlockButton";
import FollowButton from "../../components/FollowButton";

import FollowingsModal from '../../components/FollowingsModal';
import FollowersModal from '../../components/FollowersModal';
import { isLoggedIn } from "../../../backend/routes/middlewares";

const UserRoleNames = {
  1: "마스터관리자",
  2: "광고 관리자",
  3: "신고 관리자",
  4: "문의 관리자",
  5: "유저 관리자",
  6: "보안 관리자",
  7: "커스텀 관리자",
  8: "업적 관리자",
  9: "채팅 관리자",
  10: "포스트 관리자",
};

const MyMain = ({ data, isMyProfile, onRefetch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userId } = router.query;

  // toggle 등 custom hook
  const [checked, toggleChecked, setChecked] = useToggle(true);
  const [disabled, toggleDisabled] = useToggle(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  

  useEffect(() => {
    if (userId) {
      dispatch({
        type: "LOAD_USER_INFO_REQUEST",
        data: userId,
      });
    }
  }, [userId, refetchTrigger]);

  //윫추가
  const refetchUserInfo = () => {
    setRefetchTrigger(v => v + 1);
    onRefetch?.();
  };

  const onChange = (e) => {
    setChecked(e.target.checked);
  };

  const label = `${checked ? 'Checked' : 'Unchecked'}-${disabled ? 'Disabled' : 'Enabled'}`;
  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  //윫 추가
  if (data?.isBlockedByTarget) {
    return (
      <div style={{ width: '25%', padding: '20px', textAlign: 'center', color: '#888' }}>
        <p> </p>
      </div>
    );
  }

  if (data?.isBlocked) {
    return (
      <div style={{ width: '25%', padding: '20px', textAlign: 'center', color: '#888' }}>
        <p>차단한 사용자입니다. 차단을 해제하면 정보를 볼 수 있습니다.</p>
        <div style={{ marginTop: '12px' }}>
          <BlockButton
            toUserId={data?.id}
            isBlocked={data?.isBlocked}
            onRefetch={() => {
              setRefetchTrigger((v) => v + 1);
              onRefetch?.();
            }}
          />
        </div>
      </div>
    );
  }
  const nickname = data?.nickname;
  //
  const showBadge = data?.Badges.find(badge => badge.UserBadge && badge.UserBadge.isSelected === true) || null;

  return (
    <div style={{ width: '25%' }}>
      <div style={{ paddingBottom: "10px", display: 'flex', alignItems: 'center', marginTop: '5%' }}>
        { showBadge &&
        <Tooltip title={showBadge.name}><img style={{maxHeight: "40px", maxWidth: "40px", marginRight: "3%" }} src={`http://localhost:3065${showBadge.img}`} /></Tooltip>
        }
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "70%"
          }}
          title={nickname}
        >
          {nickname}
        </span>
        <span
          style={{
            fontSize: "16px",
            color: "#9F9F9F",
            marginLeft: "10px",
            whiteSpace: "nowrap"
          }}
        >
          {UserRoleNames[data?.role] || ""}
        </span>
        {!isMyProfile && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', verticalAlign: 'middle' }}>
            {!data?.isBlocked && (
              <FollowButton
                toUserId={data?.id}
                onRefetch={() => {
                  setRefetchTrigger((v) => v + 1);
                  onRefetch?.();
                }}
              />
            )}
            { isLoggedIn && (
            <BlockButton
              toUserId={data?.id}
              isBlocked={data?.isBlocked}
              onRefetch={() => {
                setRefetchTrigger((v) => v + 1);
                onRefetch?.();
              }}
            />
            )}
          </span>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginTop: '0.1%',
        marginBottom: '0.1%',
        fontSize: '22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title="달성한 업적">
            <BulbFilled style={{ color: "orange", cursor: 'pointer' }} />
          </Tooltip>
          <span style={{ fontWeight: '700', color: '#555', fontSize: '24px' }}>
            {Array.isArray(data?.Achievements) ? data.Achievements.length : (typeof data?.Achievements === "number" ? data.Achievements : 0)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip title="보유한 뱃지">
            <SafetyOutlined style={{ color: "red", cursor: 'pointer' }} />
          </Tooltip>
          <span style={{ fontWeight: '700', color: '#555', fontSize: '24px' }}>
            {Array.isArray(data?.Badges) ? data.Badges.length : (typeof data?.Badges === "number" ? data.Badges : 0)}
          </span>
        </div>
      </div>

      <div style={{
        display: "flex",
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '30px',
        paddingTop: '5%',
        fontSize: '16px',
        color: '#444'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {data && Array.isArray(data.Posts) ? data.Posts.length : 0}
          </div>
          <div>게시글</div>
        </div>
        {/* 팔로우 (팔로워) */}
        <div
          onClick={() => setIsFollowerModalOpen(true)}
          style={{ textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {Array.isArray(data?.Followers) ? data.Followers.length : 0}
          </div>
          <div>팔로워</div>
        </div>

        {/* 팔로잉 */}
        <div
          onClick={() => setIsFollowingModalOpen(true)}
          style={{ textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#1890ff' }}>
            {Array.isArray(data?.Followings) ? data.Followings.length : 0}
          </div>
          <div>팔로잉</div>
        </div>
      </div>

      <div style={{ maxWidth: "400px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginTop: "16px" }}>
        <p style={{
          wordBreak: "break-word",
          lineHeight: "1.6",
          fontSize: "16px",
          color: "#333",
          margin: 0
        }}>
          {data?.UserInfo?.introduce}
        </p>
      </div>
      {/* 윫-팔로잉 팔로워 모달추가 */}
      <FollowersModal
        open={isFollowerModalOpen}
        onClose={() => setIsFollowerModalOpen(false)}
        onUpdate={refetchUserInfo}
        data={data}
      />
      <FollowingsModal
        open={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        onUpdate={refetchUserInfo}
        data={data}
      />

    </div>


  );
};

export default MyMain;
