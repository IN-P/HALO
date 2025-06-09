import React from 'react';
import styled from 'styled-components';
import { BellOutlined } from '@ant-design/icons';

const NotificationWrapper = styled.div`
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotificationList = styled.ul`
  max-height: 280px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const NotificationItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #444;
`;

const NotificationIcon = styled(BellOutlined)`
  font-size: 20px;
  color: #1890ff;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
`;

const Notification = ({ notification }) => {
  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffMs = now - createdDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay === 1) return '어제';
    return `${diffDay}일 전`;
  };

  return (
    <NotificationWrapper>
      <Header>
        <Title>
          <BellOutlined /> 알림
        </Title>
      </Header>
      <NotificationList>
        {!notification || notification.length === 0 ? (
          <NotificationItem>알림이 없습니다.</NotificationItem>
        ) : (
          notification.map(({ id, content, createdAt }) => (
            <NotificationItem key={id}>
              <NotificationIcon />
              <NotificationText>{content}</NotificationText>
              <NotificationTime>{getTimeAgo(createdAt)}</NotificationTime>
            </NotificationItem>
          ))
        )}
      </NotificationList>
    </NotificationWrapper>
  );
};

export default Notification;
