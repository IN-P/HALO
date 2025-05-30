import React from "react";
import { Avatar } from "antd";
import { CameraOutlined } from "@ant-design/icons";

const MyAvatar = () => {
  return (
    <div>
      <Avatar
        size={256}
        icon={<CameraOutlined />}
        style={{
          color: "#B3B3B3",
          backgroundColor: "white",
          borderRadius: "50%", // 원형 보장
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "5px solid #BC91F8",
        }}
      />
    </div>
  );
};

export default MyAvatar;
