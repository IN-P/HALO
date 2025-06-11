import React from "react";
import { Image } from "antd";
import styled from "styled-components";
import { HeartFilled } from "@ant-design/icons";

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

const NoDataMessage = styled.div`
width: 100%;
text-align: center;
margin-top: 40px;
font-size: 16px;
color: #888;
`;

const StyledImage = styled(Image)`
  width: 100% !important;
  height: 300px !important;
  object-fit: cover;
  border-radius: 10px;
`;

const HeartIcon = styled(HeartFilled)`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: #ff4081;
  text-shadow: 0 0 6px rgba(0,0,0,0.3);
  pointer-events: none;
`;

const MyLiked = ({ data }) => {
  const getPostById = (id) => data?.Liked?.find(post => post.id === id);

  if (!data || !data.Liked || data.Liked.length === 0) {
    return <NoDataMessage>좋아요한 게시물이 없습니다</NoDataMessage>;
  }

  const visiblePosts = data.Liked.filter(post => {
    const basePost = post.Regram || post;
    return !basePost.private_post;
  });

  if (visiblePosts.length === 0) {
    return <NoDataMessage>표시할 수 있는 게시물이 없습니다</NoDataMessage>;
  }

  return (
    <GridWrapper>
      {visiblePosts.map((post, idx) => {
        const basePost = post.Regram || post;
        const imageSrc = basePost.Images?.[0]?.src;
        const content = basePost.content;

        return (
          <PostCard key={post.id || idx}>
            <StyledImage
              src={
                imageSrc
                  ? `http://localhost:3065/uploads/post/${imageSrc}`
                  : "https://placehold.co/300x250"
              }
              preview={false}
              alt={content || "liked post image"}
            />
            <HeartIcon />
          </PostCard>
        );
      })}
    </GridWrapper>
  );
};


export default MyLiked;
