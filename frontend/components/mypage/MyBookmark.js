import React from "react";
import { Image, Modal, Tooltip  } from "antd";
import styled from "styled-components";
import { TagFilled } from "@ant-design/icons";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  width: 800px;
  margin: 20px auto 0;
`;

const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
  color: #888;
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

const TagIcon = styled(TagFilled)`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  color: #52c41a;
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

const MyBookmark = ({ data }) => {
  const getPostById = (id) => data?.BookmarkedPosts?.find(post => post.id === id);

  if (!data?.BookmarkedPosts || data.BookmarkedPosts.length === 0) {
    return <NoDataMessage>북마크한 게시물이 없습니다</NoDataMessage>;
  }

  // 비공개 게시글 필터링
  const visiblePosts = data.BookmarkedPosts.filter(post => {
    const basePost = post.Regram || post;
    return !basePost.private_post;
  });

  if (visiblePosts.length === 0) {
    return <NoDataMessage>표시할 수 있는 게시물이 없습니다</NoDataMessage>;
  }

  return (
    <GridWrapper>
      {visiblePosts.map((post, idx) => {
        const imageSrc = post.Regram?.Images?.[0]?.src || post.Images?.[0]?.src;
        const content = post.Regram?.content || post.content;

        return (
          <PostCard key={post.id || idx}>
            <StyledImage
              as="img"
              src={
                imageSrc
                  ? `http://localhost:3065/uploads/post/${imageSrc}`
                  : "https://placehold.co/300x250"
              }
              preview={false}
              alt={content || "bookmarked post image"}
            />
            <TagIcon />
          </PostCard>
        );
      })}
    </GridWrapper>
  );
};


export default MyBookmark;
