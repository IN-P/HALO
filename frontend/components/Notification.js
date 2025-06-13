import React from 'react';
import styled from 'styled-components';
import {
  BellTwoTone,
  UsergroupAddOutlined,
  CommentOutlined,
  HeartOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

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
  max-height: 400px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  line-height: 1.4;
  color: #444;
  cursor: pointer;
  white-space: normal;

  &:hover {
    color: #1890ff;
  }
`;

const IconStyle = `
  font-size: 20px;
`;


const StyledBell = styled(BellTwoTone).attrs({
  twoToneColor: ['#faad14', '#ffd666'], // 두 가지 색상 지정
})`
  font-size: 24px;
`;

const StyledUsergroupAddOutlined = styled(UsergroupAddOutlined)`
  ${IconStyle}
  color: #52c41a;
`;

const StyledCommentOutlined = styled(MessageOutlined)`
  ${IconStyle}
  color: #1890ff	;
`;

const StyledReply = styled(CommentOutlined)`
  ${IconStyle}
  color: purple;
`

const StyledHeartOutlined = styled(HeartOutlined)`
  ${IconStyle}
  color: #eb2f96;
`;

const StyledMention = styled(CommentOutlined)`
  ${IconStyle}
  color: #595959;
`;

const StyledWarn = styled(ExclamationCircleOutlined)`
  ${IconStyle}
  color: #fa8c16 ;
`;

const StyledRestrict = styled(CloseCircleOutlined)`
  ${IconStyle}
  color: #d4380d;
`

const NotificationText = styled.div`
  flex: 1;
  white-space: normal;
`;

const ExtraText = styled.span`
  color: #666;
  margin-left: 6px;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
`;

const DeleteAllButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #1890ff;
  }
`;

// 아이콘 및 추가 메시지 반환
const getIconAndExtraText = (target_type_id) => {
  switch (target_type_id) {
    case 1:
      return { icon: <StyledUsergroupAddOutlined />, extra: ' 기본알림.' };
    case 2:
      return { icon: <StyledCommentOutlined />, extra: '댓글이 달렸습니다.' };
    case 3:
      return { icon: <StyledUsergroupAddOutlined />, extra: '님이 팔로우했습니다.' }; 
    case 4:
      return { icon: <StyledReply />, extra: '답장이 달렸습니다' };
    case 5:
      return { icon: <StyledHeartOutlined />, extra: '좋아요를 받았습니다.' };
    case 8:
      return { icon: <StyledMention />, extra: '님이 당신을 멘션했습니다'}
    case 9:
      return { icon: <StyledWarn />, extra: '게시물에 대해 관리자가 경고를 보냈습니다'}
    case 10:
      return { icon: <StyledRestrict />, extra: '정책을 위반하여 관리자가 삭제했습니다'}

    default:
      return { icon: <StyledBell />, extra: '' };
  }
};

const Notification = ({ notification, onDeleteNotification, onDeleteAllNotification }) => {
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

// notification이 배열이 아니면 빈 배열로 대체
  const sortedNotification = Array.isArray(notification)
    ? [...notification].sort((a, b) => {
        const important = [9, 10];
        const aIsImportant = important.includes(a.target_type_id);
        const bIsImportant = important.includes(b.target_type_id);

        if (aIsImportant && !bIsImportant) return -1;
        if (!aIsImportant && bIsImportant) return 1;

        // 중요도가 같으면 최신순 정렬
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    : [];

  return (
    <NotificationWrapper>
      <Header>
        <Title>
          <StyledBell /> 알림
        </Title>
        {Array.isArray(notification) && notification.length > 0 && (
          <DeleteAllButton onClick={onDeleteAllNotification}>모두 삭제</DeleteAllButton>
        )}
      </Header>
      <NotificationList>
        {!Array.isArray(notification) || notification.length === 0 ? (
          <NotificationItem>알림이 없습니다.</NotificationItem>
        ) : (
          sortedNotification.map(({ id, content, createdAt, target_type_id }) => {
            const { icon, extra } = getIconAndExtraText(target_type_id);
            return (
              <NotificationItem
                key={id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNotification(id);
                }}
                tabIndex={0}
                role="button"
              >
                {icon}
                <NotificationText>
                  {content}
                  {extra && <ExtraText>{extra}</ExtraText>}
                </NotificationText>
                <NotificationTime>{getTimeAgo(createdAt)}</NotificationTime>
              </NotificationItem>
            );
          })
        )}
      </NotificationList>
    </NotificationWrapper>
  );
};

export default Notification;
