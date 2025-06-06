import React, { useEffect } from "react";
import { Col, Row } from "antd";
import MySettingSidebar from "./MySettingSidebar";
import MyHeader from "./MyHeader";
import MyAvatar from "./MyAvatar";
import MySettingEditForm from "./MySettingEditForm";

const MySettingPopUp = ({ data }) => {
  useEffect(() => {
    const removePadding = document.getElementById("mainContents");
    const removeMembership = document.getElementById("membership");
    const removeShare = document.getElementById("share");

    if (removePadding) { removePadding.style.padding = "0"; }
    if (removeMembership) { removeMembership.style.display = "none"; }
    if (removeShare) { removeShare.style.display = "none"; }
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
          }}
        >
          <MySettingSidebar />
        </Col>
        <Col
          span={18}
          style={{
            height: "100vh",
            overflowY: "auto",
            backgroundColor: "#fff",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
              <MyHeader data={data} />
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "5% 0 5% 0" }}>
              <MyAvatar data={data} />
            </div>
            <div>
              {data?.nickname}
              <MySettingEditForm data={data} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MySettingPopUp;