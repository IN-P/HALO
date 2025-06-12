import React from "react";
import { Image } from "antd";
import styled from "styled-components";
import { RetweetOutlined } from "@ant-design/icons";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  width: 800px;
  margin: 20px auto 0;
`;

const PostCard = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.12);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
    cursor: pointer;
  }
`;

const StyledImage = styled(Image)`
  width: 100% !important;
  height: 300px !important;
  object-fit: cover;
  border-radius: 10px;
`;

const RegramIcon = styled(RetweetOutlined)`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 32px;
  color: #32e732;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
`;

const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: #888;
`;

const MessageWrapper = styled.div`
  width: 800px;
  margin: 40px auto 0;
  text-align: center;
  color: #999;
`;

const MyPost = ({ data, isBlocked, isBlockedByTarget }) => {
  if (isBlockedByTarget) {
    return <MessageWrapper><p> </p></MessageWrapper>;
  }

  if (isBlocked) {
    return <MessageWrapper><p>차단한 사용자의 게시글은 표시되지 않습니다.</p></MessageWrapper>;
  }

  if (!data?.Posts?.private_post === true && data?.Posts.length === 0) {
    return <NoDataMessage><p>작성한 게시물이 없습니다</p></NoDataMessage>;
  }

  return (
    <GridWrapper>
      {data?.Posts
        .filter(post => !post.private_post)
        .map((post, idx) => (
          <PostCard key={post.id || idx}>
            <StyledImage
              as="img"
              src={
                post.Images?.[0]?.src
                  ? `http://localhost:3065/uploads/post/${post.Images[0].src}`
                  : "https://placehold.co/300x250"
              }
              alt={post.content || "post image"}
            />
            {post.regram_id !== null && <RegramIcon />}
          </PostCard>
        ))}
    </GridWrapper>
  );
};

export default MyPost;
