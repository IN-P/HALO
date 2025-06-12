import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import MySettingSidebar from "./MySettingSidebar";
import { CloseOutlined } from "@ant-design/icons";
import MySettingBlock from "./MySettingBlock";
import MySettingAchievement from "./MySettingAchievement";
import MySettingBadges from "./MySettingBadges";
import MySettingActiveLog from "./MySettingActiveLog";
import MySettingProfile from "./MySettingProfile";
import MySettingPassword from "./MySettingPassword";
import MySettingFollowers from "./MySettingFollowers";
import MySettingFollowings from "./MySettingFollowings";
import MySettingBalance from "./MySettingBalance";

const MySettingMain = ({ data, onClose, reload, reloadLogInUser }) => {

  // user 정보 추출 및 id 저장
  const { user } = useSelector((state) => state.user_YG);
  const userId = user?.id;

  const [selectedTab, setSelectedTab] = useState("profile");

  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    const removeMembership = document.getElementById("membership");
    const removeShare = document.getElementById("share");

    if (removePadding) removePadding.style.padding = "0";
    if (removeMembership) removeMembership.style.display = "none";
    if (removeShare) removeShare.style.display = "none";
  }, []);

  return (
    <div>
      <Row style={{ height: "100vh", overflow: "hidden" }}>
        <Col
          span={6}
          style={{
            height: "100vh",
            backgroundColor: "#fafafa",
            borderRight: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            paddingTop: 20,
          }}
        >
          <MySettingSidebar
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />
        </Col>

        <Col
          span={18}
          style={{ height: "100vh", overflowY: "auto", backgroundColor: "#fff", padding: 24 }}
        >
          <div style={{ display: "flex", justifyContent: "end", marginBottom: 20 }}>
            <span
              style={{ fontSize: "20px", cursor: "pointer", marginLeft: "12px" }}
              onClick={onClose}
            >
              <CloseOutlined onClick={reload} />
            </span>
          </div>

          {selectedTab === "profile" && <MySettingProfile data={data} reload={reload} reloadLogInUser={reloadLogInUser} />}
          {selectedTab === "balance" && <MySettingBalance user={user} data={data} />}
          {selectedTab === "password" && <MySettingPassword data={data} />}
          {selectedTab === "block" && <MySettingBlock data={data} reload={reload} />}
          {selectedTab === "achievement" && <MySettingAchievement data={data} />}
          {selectedTab === "badge" && <MySettingBadges data={data} />}
          {selectedTab === "activeLog" && <MySettingActiveLog userId={userId} />}
          {selectedTab === "followers" && <MySettingFollowers data={data} />}
          {selectedTab === "followings" && <MySettingFollowings data={data} />}
        </Col>
      </Row>
    </div>
  );
};

export default MySettingMain;
