import React, { useState } from "react";
import {
  SettingFilled,
  ShareAltOutlined,
  CrownFilled,
} from "@ant-design/icons";
import ProfileShare from "./ProfileShare"; // ✅ default import

const MyHeader = ({ data, onClickSetting, isMyProfile }) => {
  const [showShare, setShowShare] = useState(false);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${data?.nickname}`
    : "";

  return (
    <div style={{ textAlign: "right", position: "relative" }}>
      {isMyProfile && (
        <CrownFilled style={{ fontSize: "32px", color: "#FFD700" }} />
      )}
      &nbsp;&nbsp;
      <ShareAltOutlined
        style={{ fontSize: "32px", color: "#4A98FF", cursor: "pointer" }}
        onClick={() => setShowShare((prev) => !prev)}
      />
      &nbsp;&nbsp;
      {isMyProfile && (
        <SettingFilled
          style={{ fontSize: "32px", color: "#363636", cursor: "pointer" }}
          onClick={onClickSetting}
        />
      )}

      {showShare && (
        <ProfileShare
          profileUrl={profileUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default MyHeader;
