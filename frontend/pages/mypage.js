import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import MyHeader from "../components/mypage/MyHeader";
import MyAvatar from "../components/mypage/MyAvatar";
import MyMain from "../components/mypage/MyMain";
import MyPost from "../components/mypage/MyPost";
import MySetting from "../components/mypage/MySetting";
import { InboxOutlined, NumberOutlined, TagOutlined } from "@ant-design/icons";


const mypage = () => {
  // c
  useEffect(() => {
  const removePadding = document.getElementById("mainContents");

  if (removePadding) { removePadding.style.padding = "0"; } }, []);

  // v
  return (
    <AppLayout>
      <div>
        <div style={{ display: "flex", justifyContent: "end", padding: "1% 1% 0 0" }}>
          <MyHeader />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MyAvatar />
          <div style={{ width: "30px" }} />
          <MyMain />
        </div>
        <hr />
        <div
          style={{ display: "flex", justifyContent: "center", gap: "100px" }}
        >
          <span>
            <InboxOutlined />
            &nbsp;게시물
          </span>
          <span>
            <TagOutlined />
            &nbsp;북마크
          </span>
          <span>
            <NumberOutlined />
            &nbsp;태그됨
          </span>
        </div>
        <MyPost />
      </div>
    </AppLayout>
  );
};

export default mypage;
