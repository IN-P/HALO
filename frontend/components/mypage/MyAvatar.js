import React from "react";
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
      width: 266,
      height: 266,
      padding: 5,
      borderRadius: "50%",
      background: "linear-gradient(45deg, #ff0000 0%, #ff69b4 50%, #800080 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: 256,
        height: 256,
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <img
        src={`http://localhost:3065${data.profile_img}`}
        alt="profile"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
  </div>
  );
};

export default MyAvatar;
