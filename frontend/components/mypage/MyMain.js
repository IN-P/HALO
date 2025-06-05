import React from "react";
import { BulbFilled } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "antd";

const MyMain = () => {
  // c
  const { user } = useSelector((state) => state.user || {});

  const nickname = user?.nickname;
  //
  return (
    <div>
      <div style={{ paddingBottom: "10px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold" }}
        title={nickname}></span>
        <span style={{ fontSIze: "16px", color: "#9F9F9F" }}>
          &nbsp;최고 관리자
        </span>
      </div>
      <div>
        <BulbFilled style={{ color: "orange", fontSize: "20px" }} /> 15
      </div>
      <div style={{ display: "flex", justifyContent: "center", height: "120px" }}>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>게시글</p>
          <p>10</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로워</p>
          <p>10</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로잉</p>
          <p>10</p>
        </Card>
      </div>
      <div style={{ maxWidth: "400px" }}>
        <p style={{ wordBreak: "break-word" }}>
          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        </p>
      </div>
    </div>
  );
};
export default MyMain;
