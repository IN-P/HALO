import React from 'react';
import { useRouter } from 'next/router';

const CancelView = () => {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9f9ff',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#8884d8', fontSize: '2rem' }}>⚠️ 결제 취소됨</h1>
      <p style={{ marginTop: 10, fontSize: '1rem', color: '#333' }}>
        결제를 취소하셨습니다.<br />
        언제든 다시 충전하실 수 있어요.
      </p>

      <div style={{ marginTop: 30 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            marginRight: 10,
            padding: '10px 20px',
            backgroundColor: '#aaa',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          홈으로 이동
        </button>
        <button
          onClick={() => router.push('/charge')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#8884d8',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
};

export default CancelView;
