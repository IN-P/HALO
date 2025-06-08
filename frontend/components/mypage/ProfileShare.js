// components/mypage/ProfileShare.js
import React from "react";
import styled from "styled-components";
import {
  CloseOutlined,
  LinkOutlined,
  FacebookFilled,
  TwitterOutlined,
  MessageOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Divider, message } from "antd";

const ShareWrapper = styled.div`
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

const ShareHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 12px;
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const LinkText = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
`;

const IconRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 12px;

  & > span {
    cursor: pointer;
    font-size: 24px;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.15);
    }
  }
`;

const ProfileShare = ({ profileUrl, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    message.success("프로필 링크가 복사되었습니다!");
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <ShareWrapper>
        <ShareHeader>
            공유하기
            <CloseOutlined onClick={onClose} style={{ cursor: "pointer" }} />
        </ShareHeader>

        <ShareLink onClick={handleCopy} title={profileUrl}>
            <LinkOutlined />
            <LinkText>{profileUrl}</LinkText>
        </ShareLink>

        <Divider style={{ margin: "16px 0" }} />

        <IconRow>
            <span
            onClick={() =>
                openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`)
            }
            title="Facebook"
            >
            <FacebookFilled style={{ color: "#3b5998" }} />
            </span>

            <span
            onClick={() =>
                openInNewTab(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`)
            }
            title="Twitter / X"
            >
            <TwitterOutlined style={{ color: "#1DA1F2" }} />
            </span>

            <span
            onClick={() =>
                message.info("카카오톡 공유")
            }
            title="KakaoTalk"
            >
            <MessageOutlined style={{ color: "#FAE100" }} />
            </span>

            <span onClick={handleCopy} title="링크 복사">
            <CopyOutlined style={{ color: "#4A4A4A" }} />
            </span>
        </IconRow>
        </ShareWrapper>
    );
};

export default ProfileShare;
