import React from "react";
import { SettingFilled, ShareAltOutlined, CrownFilled, } from "@ant-design/icons";
import { useRouter } from "next/router";

const MyHeader = ({ data }) => {
  const router = useRouter();

  const handleSettingClick = () => {
    if (router.pathname === "/profile/[nickname]") {
      // 프로필 페이지 → 세팅 페이지로 이동
      router.push("/myset");
    } else if (router.pathname === "/myset") {
      // 세팅 페이지 → 프로필 페이지로 이동
      if (data?.nickname) {
        router.push(`/profile/${data.nickname}`);
      } else {
        alert("닉네임 정보가 없습니다.");
      }
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
