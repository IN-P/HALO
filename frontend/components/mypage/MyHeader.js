import React from "react";
import { SettingFilled, ShareAltOutlined, CrownFilled, } from "@ant-design/icons";

const MyHeader = ({ data, onClickSetting  }) => {
  
  // v
  return (
    <div style={{ textAlign: "right" }}>
      <CrownFilled style={{ fontSize: "32px", color: "#FFD700" }}  id='membership' />
      &nbsp; &nbsp;
      <ShareAltOutlined style={{ fontSize: "32px", color: "#4A98FF" }}  id='share' />
      &nbsp; &nbsp;
      <SettingFilled style={{ fontSize: "32px", color: "#363636", cursor: "pointer" }} onClick={onClickSetting} />
    </div>
  );
};

export default MyHeader;
