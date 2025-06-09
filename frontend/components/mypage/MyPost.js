import React from "react";
import { Image } from "antd";
import styled from "styled-components";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px; /* 간격 좀 더 넓게 */
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

const MyPost = ({ data }) => {
  return (
    <GridWrapper>
      {data?.Posts?.map((post, idx) => (
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
