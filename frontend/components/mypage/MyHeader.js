import React from "react";
import {
  SettingFilled,
  ShareAltOutlined,
  CrownFilled,
} from "@ant-design/icons";

const MyHeader = () => {
  return (
    <div style={{ textAlign: "right" }}>
      <CrownFilled style={{ fontSize: "32px", color: "#FFD700" }} onClick />
      &nbsp; &nbsp;
      <ShareAltOutlined
        style={{ fontSize: "32px", color: "#4A98FF" }}
        onClick
      />
      &nbsp; &nbsp;
      <SettingFilled style={{ fontSize: "32px", color: "#363636" }} onClick />
    </div>
  );
};

export default MyHeader;
