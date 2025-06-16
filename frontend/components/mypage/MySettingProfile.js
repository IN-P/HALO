import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import MyAvatar from "./MyAvatar";
import MySettingEditForm from "./MySettingEditForm";
import { SyncOutlined, CloseOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { message } from "antd";
import axios from "axios";

const ProfileAvatar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5% 0;
`;

const Controls = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 20px;
  align-items: center;
`;

const EditProfile = styled.label`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #1890ff;
  }
`;

const RemoveButton = styled.button`
  font-size: 16px;
  font-weight: bold;
  color: #888;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #ff4d4f;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const MySettingProfile = ({ data, reload, reloadLogInUser }) => {

  const router = useRouter();
  const fileInput = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_img", file);

    try {
      // 1. 이미지 업로드
      const uploadRes = await axios.post(
        "http://localhost:3065/user/uploadProfileImage",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (uploadRes.status !== 200 || !uploadRes.data.path) {
        throw new Error("이미지 업로드 실패");
      }

      const uploadedPath = uploadRes.data.path;

      // PATCH 요청 생략!
      setPreview(uploadedPath + "?t=" + Date.now()); // 캐시 방지
      message.success("프로필 사진이 성공적으로 변경되었습니다.");
      reload();
      reloadLogInUser();
    } catch (err) {
      console.error("이미지 업로드 오류:", err);
      message.error("이미지 변경 중 오류가 발생했습니다.");
    } finally {
      e.target.value = null;
    }
  };




  const handleRemoveProfile = async () => {
    try {
      const defaultImgPath = "/uploads/profile/default.jpg";
      await axios.patch(
        "http://localhost:3065/user",
        { profile_img: defaultImgPath },
        { withCredentials: true }
      );
      setPreview(defaultImgPath);
      message.success("프로필 사진이 성공적으로 변경되었습니다.");
      reload();
      reloadLogInUser();
    } catch (err) {
      console.error("프로필 이미지 기본값 변경 오류:", err);
    }
  };

  return (
    <>
      <ProfileAvatar>
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
              src={`http://localhost:3065${preview || data.profile_img}?t=${Date.now()}`}
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
        <Controls>
          <EditProfile htmlFor="profileUpload">
            <SyncOutlined /> 변경
          </EditProfile>
          <RemoveButton onClick={handleRemoveProfile} title="기본 이미지로 변경">
            <CloseOutlined /> 제거
          </RemoveButton>
        </Controls>
        <HiddenInput
          id="profileUpload"
          type="file"
          accept="image/*"
          ref={fileInput}
          onChange={handleFileChange}
        />
      </ProfileAvatar>
      <div>
        <MySettingEditForm data={data} reload={reload} reloadLogInUser={reloadLogInUser} />
      </div>
    </>
  );
};

export default MySettingProfile;
