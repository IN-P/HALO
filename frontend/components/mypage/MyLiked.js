import React from "react";
import { Image } from "antd";
import styled from "styled-components";
import { HeartOutlined } from "@ant-design/icons";  // 변경: HeartOutlined 아이콘 import

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

const HeartIcon = styled(HeartOutlined)`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: #ff4081;
  text-shadow: 0 0 6px rgba(0,0,0,0.3);
  pointer-events: none;
`;

const PostContent = styled.div`
  padding: 8px 12px;
  background-color: #fff;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: #888;
`;

const MyLiked = ({ data }) => {
  const getPostById = (id) => data?.Posts?.find(post => post.id === id);

  if (!data || !data.Liked || data.Liked.length === 0) {
    return <NoDataMessage>좋아요한 게시물이 없습니다</NoDataMessage>;
  }

  return (
    <GridWrapper>
      {data?.Liked?.map((likedPost, idx) => {
        const post = getPostById(likedPost.id);

        if (!post) return null;

        return (
          <PostCard key={post.id || idx}>
            <StyledImage
              src={
                post.Images?.[0]?.src
                  ? `http://localhost:3065/uploads/post/${post.Images[0].src}`
                  : "https://image.utoimage.com/preview/cp872722/2022/12/202212008462_500.jpg"
              }
              preview={false}
              alt={post.content || "liked post image"}
            />
            <HeartIcon />
            <PostContent>{post.content}</PostContent>
          </PostCard>
        );
      })}
    </GridWrapper>
  );
};

export default MyLiked;
