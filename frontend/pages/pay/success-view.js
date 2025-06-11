// frontend/pages/pay/success-view.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import confetti from 'canvas-confetti';

const SuccessView = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);

  useEffect(() => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 20,
      spread: 360,
      ticks: 60,
      zIndex: 2000,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 200);
  }, []);

  const handleGoToProfile = () => {
    if (user?.nickname) {
      router.push(`/profile/${encodeURIComponent(user.nickname)}`);
    } else {
      alert('로그인 정보가 없어 마이페이지로 이동할 수 없습니다.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #e0ffe0 0%, #ffffff 100%)',
        textAlign: 'center',
        padding: 20,
      }}
    >
      <h1
        style={{
          color: '#00C896',
          fontSize: '2.4rem',
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        🎉 포인트 충전 성공!
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: 28 }}>
        결제가 성공적으로 완료되었습니다.<br />
        마이페이지에서 충전 내역을 확인하세요!
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#00C896',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          홈으로 이동
        </button>

        <button
          onClick={handleGoToProfile}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}
        >
          마이페이지로 이동
        </button>
      </div>
    </div>
  );
};

export default SuccessView;