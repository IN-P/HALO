import React from "react";
import { Avatar } from "antd";
import { CameraOutlined } from "@ant-design/icons";

const MyAvatar = ({ data }) => {
  if (!data || !data.profile_img) {
    return (
      <div style={{
          width: 256,
          height: 256,
          borderRadius: "50%",
          border: "5px solid black",
          backgroundColor: "#eee",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 48,
          color: "#aaa",
        }} >
        <CameraOutlined />
      </div>
    );
  }

  return (
    <div
      style={{
        width: 256,
        height: 256,
        borderRadius: "50%",
        overflow: "hidden",
        border: "5px solid black",
      }}
    >
      <img
        src={data.profile_img}
        alt="profile"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
  );
};

export default MyAvatar;
