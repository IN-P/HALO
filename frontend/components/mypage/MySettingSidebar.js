import React from "react";
import styled from "styled-components";

const SidebarWrapper = styled.div`
  padding: 20px;
  background-color: #fafafa;
  position: fixed;
  height: 50%;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
`;

const ListItem = styled.li`
  font-size: 16px;
  padding: 5px 0;
  cursor: pointer;
  color: #555;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #1890ff;
  }
`;

const MySettingSidebar = () => {
  return (
      <SidebarWrapper>
        <SectionTitle>계정정보</SectionTitle>
        <List>
          <ListItem>프로필 편집</ListItem>
          <ListItem>뱃지</ListItem>
          <ListItem>업적</ListItem>
        </List>

        <SectionTitle>회원관리</SectionTitle>
        <List>
          <ListItem>차단 관리</ListItem>
          <ListItem>최근 활동</ListItem>
        </List>
      </SidebarWrapper>
  );
};

export default MySettingSidebar;
