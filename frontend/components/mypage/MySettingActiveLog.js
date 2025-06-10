import React, { useEffect, useState } from 'react';
import { FormOutlined, CommentOutlined, HeartFilled  } from '@ant-design/icons';
import styled from 'styled-components';

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
    min-height: 96px;  // ✅ 이미지 있을 때 기준 높이로 고정
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const ProfileImg = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 16px;
    object-fit: cover;
    border: 1.5px solid #1890ff;
`;

const TargetName = styled.a`
    font-weight: 600;
    font-size: 18px;
    color: #222;
    text-decoration: none;
    cursor: pointer;

    &:hover {
        text-decoration: none;
        color: #1890ff;
    }
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

const formatDate = (isoString) => {
  const date = new Date(isoString);
  // 시:분:초 없이 시:분까지만 포맷팅
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const actionTypeMap = {
    FOLLOW: '팔로우했습니다',
    UNFOLLOW: '팔로우를 취소했습니다',
    BLOCK: '차단했습니다',
    UNBLOCK: '차단을 해제했습니다',
    CREATE: '작성했습니다',
    LIKE: '좋아요를 남겼습니다',
};
const targetTypeMap = {
    1: '게시물을',
    2: '댓글을',
    3: '사용자를',
};

const getActionMessage = (log) => {
    const key = `${log.action}_${log.target_type_id}`;

    // 예외 케이스 먼저 처리
    const exceptionMap = {
        'LIKE_1': '게시물에 좋아요를 남겼습니다',
        'LIKE_2': '댓글에 좋아요를 남겼습니다',
        // 필요 시 더 추가 가능
    };

    if (exceptionMap[key]) return exceptionMap[key];

    // 기본 조합 방식
    const targetText = targetTypeMap[log.target_type_id] || '대상에게';
    const actionText = actionTypeMap[log.action] || log.action;
    return `${targetText} ${actionText}`;
};


const MySettingActiveLog = ({ data }) => {
    const logs = data?.ActiveLogs || [];

    const [targetInfoMap, setTargetInfoMap] = useState({});

    useEffect(() => {
        logs.forEach(async (log) => {
            const key = `${log.target_type_id}_${log.target_id}`;
            if (!targetInfoMap[key]) {
                try {
                    const res = await fetch(`http://localhost:3065/log/${log.target_type_id}/${log.target_id}`, {
                        credentials: 'include',
                    });
                    if (res.ok) {
                        const json = await res.json();
                        setTargetInfoMap(prev => ({ ...prev, [key]: json }));
                    } else {
                        setTargetInfoMap(prev => ({ ...prev, [key]: null }));
                    }
                } catch (error) {
                    setTargetInfoMap(prev => ({ ...prev, [key]: null }));
                }
            }
        });
    }, [logs]);

    const truncate = (text, max = 30) =>
        text.length > max ? `${text.slice(0, max)}...` : text;

        const getTargetLink = (log, target) => {
        if (!target) return '#';

        switch (log.target_type_id) {
            case 1: // POST
            return `http://localhost:3000/post/${target.id}`;
            case 2: // COMMENT
            return `http://localhost:3000/comment/${target.id}`;
            case 3: // USER
            return `http://localhost:3000/profile/${target.nickname}`;
            default:
            return '#';
        }
        };

        const getTargetDisplayName = (target) => {
        if (!target) return '불러오는 중...';
        return target.nickname || truncate(target.content || '', 30) || '알 수 없음';
        };

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
            {logs.map((log) => {
                const key = `${log.target_type_id}_${log.target_id}`;
                const target = targetInfoMap[key];

                // 기본값 세팅
                let targetName = '불러오는 중...';
                let profileImg = null;
                let targetLink = null;

                if (target) {
                    if (log.target_type_id === 3) { // USER
                        targetName = target.nickname || '알 수 없음';
                        profileImg = target.profile_img;
                        targetLink = `http://localhost:3000/profile/${target.nickname}`;
                    } else if (log.target_type_id === 1) { // POST
                        targetName = target.content || '알 수 없는 게시글';
                        profileImg = null;
                        targetLink = null;
                    } else {
                        targetName = '알 수 없음';
                        profileImg = null;
                        targetLink = null;
                    }
                }

                return (
                    <LogItem key={log.id}>
                    {log.action === 'LIKE' ? (
                        <HeartFilled style={{ fontSize: 20, color: '#eb2f96', marginRight: 12 }} />
                    ) : log.target_type_id === 1 ? (
                        <FormOutlined style={{ fontSize: 20, color: '#1890ff', marginRight: 12 }} />
                    ) : log.target_type_id === 2 ? (
                        <CommentOutlined style={{ fontSize: 20, color: '#52c41a', marginRight: 12 }} />
                    ) : null}

                    {target && target.profile_img && (
                        <ProfileImg 
                        src={target.profile_img} 
                        alt={`${target.nickname || '프로필'}`} 
                        />
                    )}

                    <TargetName
                        href={getTargetLink(log, target)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {getTargetDisplayName(target)}
                    </TargetName>

                    <ActionText>{getActionMessage(log)}</ActionText>
                    <DateText>{formatDate(log.createdAt)}</DateText>
                    </LogItem>
                );
            })}
            </LogList>
        )}
        </>
    );
};

export default MySettingActiveLog;
