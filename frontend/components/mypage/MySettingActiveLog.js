import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormOutlined, CommentOutlined, HeartFilled, UserAddOutlined, UserDeleteOutlined, HeartOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { LOAD_ACTIVE_LOG_REQUEST } from '../../reducers/activeLog_JH';

const LogList = styled.ul`
    list-style: none;
    padding: 0;
    max-width: 700px;
    margin: 0 auto;
`;

const LogItem = styled.li`
    background-color: #fefefe;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    min-height: 96px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const ActionText = styled.span`
    margin-left: 12px;
    font-weight: 600;
    font-size: 16px;
    color: #1890ff;
`;

const DateText = styled.span`
    margin-left: auto;
    color: #999;
    font-size: 14px;
    font-weight: 400;
`;

// 날짜 포맷팅
const formatDate = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  // 올해면 연도 생략
  if (year === now.getFullYear()) {
    return `${month}.${day} ${hours}:${minutes}`;
  }
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 아이콘 및 색상 분기 함수
const getLogIcon = (action, target_type_id) => {
const iconStyle = { fontSize: 32, marginRight: 16 };
  // CREATE 색상
  if (action === 'CREATE') {
    switch (target_type_id) {
      case 1: return <FormOutlined style={{ ...iconStyle, color: '#52c41a', marginRight: 12 }} />; 
      case 2: return <CommentOutlined style={{ ...iconStyle, color: '#52c41a', marginRight: 12 }} />; 
      case 3: return <UserAddOutlined style={{ ...iconStyle, color: '#1890ff', marginRight: 12 }} />;
      case 4: return <CommentOutlined style={{ ...iconStyle, color: '#fa8c16', marginRight: 12 }} />; 
      case 5: return <HeartFilled style={{ ...iconStyle, color: '#eb2f96', marginRight: 12 }} />; 
      default: return null;
    }
  }
  // UPDATE 색상 (CREATE와 동일)
  if (action === 'UPDATE') {
    switch (target_type_id) {
      case 1: return <FormOutlined style={{ ...iconStyle, color: '#52c41a', marginRight: 12 }} />;
      case 2: return <CommentOutlined style={{ ...iconStyle, color: '#52c41a', marginRight: 12 }} />;
      case 4: return <CommentOutlined style={{ ...iconStyle, color: '#fa8c16', marginRight: 12 }} />;
      default: return null;
    }
  }
  // DELETE 색상
  if (action === 'DELETE') {
    switch (target_type_id) {
      case 1: return <FormOutlined style={{ ...iconStyle, color: '#ff4d4f', marginRight: 12 }} />;
      case 2: return <CommentOutlined style={{ ...iconStyle, color: '#ff4d4f', marginRight: 12 }} />; 
      case 3: return <UserDeleteOutlined style={{ ...iconStyle, color: '#bfbfbf', marginRight: 12 }} />;
      case 4: return <CommentOutlined style={{ ...iconStyle, color: '#ff4d4f', marginRight: 12 }} />; 
      case 5: return <HeartOutlined style={{ ...iconStyle, color: '#bfbfbf', marginRight: 12 }} />;
      default: return null;
    }
  }
  return null;
};

// 타겟 타입 분기
const targetTypeMap = {
  1: '게시물을',
  2: '댓글을',
  3: '사용자를',
  4: '답글을',
  5: '좋아요를',
};

// 로그 출력 문구 조합
const getActionMessage = (action, target_type_id) => {
  // CREATE
  if (action === 'CREATE') {
    if ([1, 2, 4].includes(target_type_id)) return `${targetTypeMap[target_type_id]} 작성했습니다`;
    if (target_type_id === 3) return `${targetTypeMap[3]} 팔로우했습니다`;
    if (target_type_id === 5) return `${targetTypeMap[5]} 남겼습니다`;
  }
  // UPDATE
  if (action === 'UPDATE') {
    if ([1, 2, 4].includes(target_type_id)) return `${targetTypeMap[target_type_id]} 수정했습니다`;
  }
  // DELETE
  if (action === 'DELETE') {
    if ([1, 2, 4].includes(target_type_id)) return `${targetTypeMap[target_type_id]} 삭제했습니다`;
    if (target_type_id === 3) return `${targetTypeMap[3]} 언팔로우했습니다`;
    if (target_type_id === 5) return `${targetTypeMap[5]} 철회했습니다`;
  }
  // 기본값
  return `${targetTypeMap[target_type_id] || ''} ${action}`;
};

const MySettingActiveLog = ({ userId }) => {

    const dispatch = useDispatch();
    const { activeLogs, loadActiveLogLoading } = useSelector(state => state.activeLog_JH || {});

    useEffect(() => { if (userId) {
            dispatch({
                type: LOAD_ACTIVE_LOG_REQUEST,
                data: userId,
            });
        } }, [dispatch, userId]);

    const logs = Array.isArray(activeLogs) ? activeLogs : [];

    return (
        <>
            <div style={{ marginTop: '3%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 0 }}>
                    내 최근 활동
                </h2>
            </div>
            <hr style={{ borderTop: '1px solid #ddd', margin: '24px 0' }} />

            {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', fontSize: '18px' }}>최근 활동 내역이 없습니다.</p>
            ) : (
                <LogList>
                    {logs.map((log) => (
                        <LogItem key={log.id}>
                            {getLogIcon(log.action, log.target_type_id)}
                            <ActionText>
                                {getActionMessage(log.action, log.target_type_id)}
                            </ActionText>
                            <DateText>{formatDate(log.createdAt)}</DateText>
                        </LogItem>
                    ))}
                </LogList>
            )}
        </>
    );
};

export default MySettingActiveLog;