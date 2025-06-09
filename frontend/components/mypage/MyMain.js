import React, { useEffect, useState } from "react";
import { BulbFilled, SafetyOutlined } from "@ant-design/icons";
import { Button, Tooltip, Card } from "antd";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import useToggle from "../../hooks/useToggle";
import BlockButton from "../../components/BlockButton";
import FollowButton from "../../components/FollowButton";

import FollowingsModal from '../../components/FollowingsModal';
import FollowersModal from '../../components/FollowersModal';


const MyMain = ({ data, isMyProfile, loginUser, onRefetch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { nickname } = router.query;

  // toggle 등 custom hook
  const [checked, toggleChecked, setChecked] = useToggle(true);
  const [disabled, toggleDisabled] = useToggle(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (nickname) {
      dispatch({
        type: "LOAD_USER_INFO_REQUEST",
        data: nickname,
      });
    }
  }, [nickname, refetchTrigger]);

  const onChange = (e) => {
    setChecked(e.target.checked);
  };

  const label = `${checked ? 'Checked' : 'Unchecked'}-${disabled ? 'Disabled' : 'Enabled'}`;
  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  return (
    <div style={{ width: '25%' }}>
      <div style={{ paddingBottom: "10px", display: 'flex', alignItems: 'center', marginTop: '5%' }}>
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "70%"
          }}
          title={data?.nickname}
        >
          {data?.nickname}
        </span>
        <span
          style={{
            fontSize: "16px",
            color: "#9F9F9F",
            marginLeft: "10px",
            whiteSpace: "nowrap"
          }}
        >
          {data?.role || ""}
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
            <BlockButton
              toUserId={data?.id}
              isBlocked={data?.isBlocked}
              onRefetch={() => {
                setRefetchTrigger((v) => v + 1);
                onRefetch?.();
              }}
            />
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
      />
      <FollowingsModal
        open={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
      />

    </div>


  );
};

export default MyMain;
