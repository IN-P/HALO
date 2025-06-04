import React, { useEffect } from "react";
import { Col, Row } from "antd";
import AppLayout from "../components/AppLayout";
import MySettingSidebar from "../components/mypage/MySettingSidebar";
import MyHeader from "../components/mypage/MyHeader";
import MyAvatar from "../components/mypage/MyAvatar";
import MySettingEditForm from "../components/mypage/MySettingEditForm";

const myset = () => {
  // c
  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    const removeMembership = document.getElementById("membership");
    const removeShare = document.getElementById("share");

    if (removePadding) { removePadding.style.padding = "0"; }
    if (removeMembership) { removeMembership.style.display="none";}
    if (removeShare) { removeShare.style.display="none";}
  }, []);

  // v
  return (
    <AppLayout>
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
              overflowY: "auto", // 사이드바도 스크롤 필요시
            }}
          >
            <MySettingSidebar />
          </Col>
          <Col
            span={18}
            style={{
              height: "100vh",
              overflowY: "auto", // 오른쪽 영역 스크롤
              backgroundColor: "#fff", // 배경색 명확히
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
                <MyHeader />
              </div>
              <div style={{ display: "flex", justifyContent: "center", padding: "5% 0 5% 0" }}>
                <MyAvatar />
              </div>
              <div>
                <MySettingEditForm />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}
export default myset;
