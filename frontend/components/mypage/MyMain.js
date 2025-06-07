import React, { useEffect, useState } from "react";
import { BulbFilled } from "@ant-design/icons";
import { Card } from "antd";

import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import BlockButton from "../../components/BlockButton"; // 차단 버튼
import FollowButton from "../../components/FollowButton"; // 팔로우 버튼

const MyMain = ({ data, isMyProfile, onRefetch }) => { // 율비: onRefetch props 추가
  const dispatch = useDispatch();
  const router = useRouter();
  const { nickname } = router.query;

  const [refetchTrigger, setRefetchTrigger] = useState(0); // 율비: 상태 트리거 로컬 유지

  useEffect(() => {
    if (nickname) {
      dispatch({
        type: "LOAD_USER_INFO_REQUEST",
        data: nickname,
      });
    }
  }, [nickname, refetchTrigger]); // 율비: 트리거로 리렌더 유도

  return (
    <div>
      <div style={{ paddingBottom: "10px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold" }}>
          {data?.nickname}&nbsp;
        </span>
        {!isMyProfile && (
          <span>
            {!data?.isBlocked && ( // 율비: 차단된 상태가 아니면 팔로우 버튼 보여줌
              <FollowButton
                toUserId={data?.id}
                onRefetch={() => {
                  setRefetchTrigger((v) => v + 1); // 율비: 로컬 갱신
                  onRefetch?.(); // 율비: 부모에게도 갱신 요청
                }}
              />
            )}{" "}
            &nbsp;
            <BlockButton
              toUserId={data?.id}
              isBlocked={data?.isBlocked}
              onRefetch={() => {
                setRefetchTrigger((v) => v + 1); // 율비
                onRefetch?.(); // 율비
              }}
            />
          </span>

        )}
        <span style={{ fontSize: "16px", color: "#9F9F9F" }}>
          &nbsp;{data?.role || ""}
        </span>
      </div>
      <div>
        <BulbFilled style={{ color: "orange", fontSize: "20px" }} />{" "}
        {data?.Achievements}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "120px",
        }}
      >
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>게시글</p>
          <p>{data && Array.isArray(data.Posts) ? data.Posts.length : 0}</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로워</p>
          <p>{data?.Followers ?? 0}</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로잉</p>
          <p>{data?.Followings ?? 0}</p>
        </Card>
      </div>
      <div style={{ maxWidth: "400px" }}>
        <p style={{ wordBreak: "break-word" }}>{data?.UserInfo?.introduce}</p>
      </div>
    </div>
  );
};

export default MyMain;
