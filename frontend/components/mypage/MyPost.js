import React from "react";
import { Image } from "antd";
import styled from "styled-components";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 800px;
  margin: 20px auto 0;
`;

const StyledImage = styled(Image)`
  width: 250px !important;
  height: 300px !important;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 15px rgba(0,0,0,0.2);
    z-index: 10;
  }
`;

const MessageWrapper = styled.div`
  width: 800px;
  margin: 40px auto 0;
  text-align: center;
  color: #999;
`;

const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: #888;
`;

const MyPost = ({ data, isBlocked, isBlockedByTarget }) => {
  if (isBlockedByTarget) {
    return <MessageWrapper><p> </p></MessageWrapper>; // 숨김 메시지
  }

  if (isBlocked) {
    return <MessageWrapper><p>차단한 사용자의 게시글은 표시되지 않습니다.</p></MessageWrapper>;
  }

  if (!data?.Posts || data.Posts.length === 0) {
    return <NoDataMessage><p>작성한 게시물이 없습니다</p></NoDataMessage>;
  }

  return (
    <GridWrapper>
      {data.Posts.map((post, idx) => (
        <StyledImage
          key={post.id || idx}
          src={`http://localhost:3065/uploads/post/${post.Images[0]?.src}`}
          preview={false}
          alt={post.content || "post image"}
        />
      ))}
    </GridWrapper>
  );
};

export default MyPost;
