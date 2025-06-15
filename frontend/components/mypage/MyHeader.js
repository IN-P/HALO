import React, { useState } from "react";
import {
  SettingFilled,
  ShareAltOutlined,
  CrownFilled,
  EllipsisOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import ProfileShare from "./ProfileShare"; // ✅ default import
import ReportButton from "../ReportButton";//율비
import ReportModal from "../ReportModal"; //율비

const MyHeader = ({ data, onClickSetting, isMyProfile, reload }) => {
  const [showShare, setShowShare] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);//율비

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${data?.nickname}`
    : "";
  //율비
  const handleReportClick = () => {
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
  };
  // 드롭다운 메뉴 구성
const menu = (
  <Menu
    onClick={(e) => {
      if (e.key === "report") {
        e.domEvent.stopPropagation(); 
        setShowReportModal(true);     
      }
    }}
  >
    <Menu.Item key="report">
      신고하기
    </Menu.Item>
  </Menu>
);

  return (
    <div style={{ textAlign: "right", position: "relative" }}>
      &nbsp;&nbsp;
      <ShareAltOutlined
        style={{ fontSize: "32px", color: "#4A98FF", cursor: "pointer" }}
        onClick={() => setShowShare((prev) => !prev)}
      />
      &nbsp;&nbsp;
      {isMyProfile ? (
        <SettingFilled
          style={{ fontSize: "32px", color: "#363636", cursor: "pointer" }}
          onClick={onClickSetting}
        />
      ) : (
      <Dropdown overlay={menu} trigger={['click']}>
        <EllipsisOutlined
          style={{ fontSize: "32px", color: "#999", cursor: "pointer" }}
        />
      </Dropdown>
      )}

      {showShare && (
        <ProfileShare
          profileUrl={profileUrl}
          onClose={() => setShowShare(false)}
        />
      )}
      {!isMyProfile && (
        <ReportModal
          visible={showReportModal}
          onClose={handleCloseReport}
          postId={data?.id}           // 사용자 id로 넘기기
          targetType={"3"}            // 예: 사용자 신고는 3번
        />
      )}
    </div>
  );
};

export default MyHeader;
