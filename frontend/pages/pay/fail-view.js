import React from 'react';
import { useRouter } from 'next/router';

const FailView = () => {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#fff4f4',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#ff4d4f', fontSize: '2rem' }}>❌ 결제 실패</h1>
      <p style={{ marginTop: 10, fontSize: '1rem', color: '#333' }}>
        결제가 정상적으로 완료되지 않았습니다.<br />
        다시 시도하거나, 문제가 지속될 경우 고객센터로 문의해주세요.
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
            backgroundColor: '#ff4d4f',
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

export default FailView;
