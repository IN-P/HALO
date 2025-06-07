import React from 'react';
import { Button } from 'antd';

const MySettingBlock= ({ data }) => {
    return (
    <>
        <div style={{ marginTop: '3%' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            여기서 차단된 유저를 확인할 수 있습니다
        </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc' }} />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '95%' }}>
            {data?.Blockeds && data.Blockeds.length > 0 ? (
            data.Blockeds.map(block => (
                <div
                    key={block.id}
                    style={{
                    backgroundColor: 'gray',
                    padding: '1% 2%',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    }}
                >
                <div style={{ flex: '1' }}>
                    <img
                    src={block.Blocked.profile_img || ""}
                    alt="프로필 이미지"
                    style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#eee',
                    }}
                />
                </div>

                <span style={{ flex: '3', textAlign: 'left', fontWeight: 'bold' }}>
                    {block.Blocked.nickname}
                </span>

                <span style={{ flex: '2', textAlign: 'right', marginRight: '1%' }}>
                    <Button>해제</Button>
                </span>
            </div>
            ))
        ) : (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
            차단한 유저가 없습니다.
            </div>
        )}
        </div>
    </div>
    </>
  );
};

export default MySettingBlock;