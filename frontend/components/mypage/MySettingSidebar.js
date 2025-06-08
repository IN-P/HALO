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
  color: ${({ selected }) => (selected ? "#1890ff" : "#555")};
  font-weight: ${({ selected }) => (selected ? "700" : "normal")};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #1890ff;
  }
`;

const MySettingSidebar = ({ selectedTab, onSelectTab }) => {
  return (
    <SidebarWrapper>
      <SectionTitle>계정정보</SectionTitle>
      <List>
        <ListItem
          selected={selectedTab === "profile"}
          onClick={() => onSelectTab("profile")}
        >
          프로필 편집
        </ListItem>
        <ListItem
          selected={selectedTab === "password"}
          onClick={() => onSelectTab("password")}
        >
          비밀번호 변경
        </ListItem>
        <ListItem
          selected={selectedTab === "badge"}
          onClick={() => onSelectTab("badge")}
        >
          뱃지
        </ListItem>
        <ListItem
          selected={selectedTab === "achievement"}
          onClick={() => onSelectTab("achievement")}
        >
          업적
        </ListItem>
      </List>

      <SectionTitle>회원관리</SectionTitle>
      <List>
        <ListItem
          selected={selectedTab === "block"}
          onClick={() => onSelectTab("block")}
        >
          차단 관리
        </ListItem>
        <ListItem
          selected={selectedTab === "activeLog"}
          onClick={() => onSelectTab("activeLog")}
        >
          최근 활동
        </ListItem>
        <ListItem
          selected={selectedTab === "followings"}
          onClick={() => onSelectTab("followings")}
        >
          팔로잉 목록
        </ListItem>
        <ListItem
          selected={selectedTab === "followers"}
          onClick={() => onSelectTab("followers")}
        >
          팔로워 목록
        </ListItem>
      </List>
    </SidebarWrapper>
  );
};

export default MySettingSidebar;
