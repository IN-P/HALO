import React from 'react';
import { Button,message } from 'antd';
import axios from 'axios';
const MySettingBlock = ({ data, onRefetch  }) => {
      const onUnblock = async (userId) => {
    try {
      await axios.delete(`/block/${userId}`);
      message.success('차단이 해제되었습니다.');
      if (onRefetch) onRefetch(); // 목록 새로고침
    } catch (error) {
      message.error('차단 해제 중 오류가 발생했습니다.');
    }
  };
    return (
        <>
        <div style={{ marginTop: '3%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 0 }}>
            차단 목록
            </h2>
        </div>

        <hr style={{ borderTop: '1px solid #ddd', margin: '24px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '95%', maxWidth: 600 }}>
            {data?.Blockeds && data.Blockeds.length > 0 ? (
                data.Blockeds.map(block => (
                <div
                    key={block.id}
                    style={{
                    backgroundColor: '#f9f9f9',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                >
                    <img src={block.Blocked.profile_img || "/default-profile.png"} alt="프로필 이미지"
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', backgroundColor: '#e0e0e0', marginRight: 20, flexShrink: 0, }}
                    />

                    <span style={{ flexGrow: 1, fontWeight: '600', fontSize: '18px', color: '#333', }} >
                        {block.Blocked.nickname}
                    </span>

                    <Button type="primary" danger style={{ minWidth: 80 }} onClick={() => onUnblock(block.Blocked.id)} >
                        해제
                    </Button>
                </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', marginTop: 20, color: '#999', fontSize: '16px' }}>
                차단한 유저가 없습니다.
                </div>
            )}
            </div>
        </div>
        </>
    );
};

export default MySettingBlock;
