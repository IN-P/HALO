import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const SuccessView = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG); // 유저 정보 가져오기

  const handleGoToProfile = () => {
    if (user?.nickname) {
      router.push(`/profile/${encodeURIComponent(user.nickname)}`);
    } else {
      alert('로그인 정보가 없어 마이페이지로 이동할 수 없습니다.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9f9f9',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#00C896', fontSize: '2rem' }}>✅ 포인트 충전 완료!</h1>
      <p style={{ marginTop: 10, fontSize: '1rem' }}>
        결제가 성공적으로 완료되었습니다.<br />
        충전된 포인트는 마이페이지에서 확인할 수 있습니다.
      </p>

      <div style={{ marginTop: 30 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            marginRight: 10,
            padding: '10px 20px',
            backgroundColor: '#00C896',
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
          onClick={handleGoToProfile}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          마이페이지로 이동
        </button>
      </div>
    </div>
  );
};

export default SuccessView;
