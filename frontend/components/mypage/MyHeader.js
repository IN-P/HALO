import React from "react";
import { SettingFilled, ShareAltOutlined, CrownFilled, } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouter } from "next/router";

const MyHeader = () => {
  // c
 const router = useRouter();

  const handleSettingClick = () => {
    if (router.pathname === "/mypage") {
      router.push("/myset");
    } else {
      router.push("/mypage");
    }
  };
  
  // v
  return (
    <div style={{ textAlign: "right" }}>
      <CrownFilled style={{ fontSize: "32px", color: "#FFD700" }}  id='membership' />
      &nbsp; &nbsp;
      <ShareAltOutlined style={{ fontSize: "32px", color: "#4A98FF" }}  id='share' />
      &nbsp; &nbsp;
      <SettingFilled style={{ fontSize: "32px", color: "#363636" }} onClick={handleSettingClick} />
    </div>
  );
};

export default MyHeader;
