import React, { useEffect} from "react";
import { BulbFilled } from "@ant-design/icons";
import { Card } from "antd";

import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

const MyMain = ({ data }) => {
  return (
    <div>
      <div style={{ paddingBottom: "10px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold" }}>
          {data?.nickname}
        </span>
        <span style={{ fontSIze: "16px", color: "#9F9F9F" }}>
          &nbsp;{data?.role||""}
        </span>
      </div>
      <div>
        <BulbFilled style={{ color: "orange", fontSize: "20px" }} /> {data?.Achievements}
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
          <p>{data && Array.isArray(data.Posts) ? data.Posts.length : 0}</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로워</p>
          <p>{data?.Followers ?? 0}</p>
        </Card>
        <Card
          style={{
            width: "80px",
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          <p>팔로잉</p>
          <p>{data?.Followings ?? 0}</p>
        </Card>
      </div>
      <div style={{ maxWidth: "400px" }}>
        <p style={{ wordBreak: "break-word" }}>
          {data?.UserInfo.introduce}
        </p>
      </div>
    </div>
  );
};
export default MyMain;
