// frontend/pages/charge.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import { SmileOutlined, ThunderboltOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';

const ChargePage = () => {
  const [amount, setAmount] = useState(10000);
  const { user } = useSelector((state) => state.user_YG);
  const [hovered, setHovered] = useState(false);

  const launchConfetti = () => {
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      }));
    }, 250);
  };

  const handlePayment = async () => {
    if (!user || !user.id) return alert('로그인이 필요합니다.');
    if (!amount || amount < 1000) return alert('최소 1000원 이상 충전 가능합니다.');

    try {
      const res = await axios.post('http://localhost:3065/pay/ready', {
        userId: user.id,
        amount,
      });

      if (res.data?.next_redirect_pc_url) {
        launchConfetti(); // 🎉 애니메이션 시작
        setTimeout(() => {
          window.location.href = res.data.next_redirect_pc_url;
        }, 1000);
      } else {
        alert('결제 URL을 받지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('결제 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <AppLayout>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 48px)',
        background: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
        padding: 20,
      }}>
        <div style={{
          background: '#ffffff',
          padding: 40,
          borderRadius: 20,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          width: 400,
          textAlign: 'center',
          transition: 'transform 0.3s',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
        }}>
          <h2 style={{
            color: '#00C896',
            fontSize: '2rem',
            marginBottom: 24,
            fontWeight: 'bold',
          }}>
            ⚡ 충전은 즐겁게! <ThunderboltOutlined />
          </h2>

          <p style={{
            marginBottom: 16,
            fontSize: '1rem',
            color: '#666',
          }}>
            원하는 금액만큼 포인트를 충전하세요.<br />
            🧃 오늘도 풍성한 혜택이 기다립니다!
          </p>

          <label htmlFor="amount" style={{
            fontWeight: 'bold',
            fontSize: '1rem',
            color: '#333',
          }}>
            충전 금액 (KRW)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1000}
            step={1000}
            placeholder="예: 10000"
            style={{
              marginTop: 8,
              marginBottom: 24,
              padding: '12px 16px',
              width: '100%',
              borderRadius: 12,
              border: '1px solid #ddd',
              fontSize: '1.1rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
            }}
          />

          <button
            onClick={handlePayment}
            onMouseOver={() => setHovered(true)}
            onMouseOut={() => setHovered(false)}
            style={{
              backgroundColor: '#FEE500',
              color: '#000',
              padding: '14px 24px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🟡 카카오페이로 결제하기 <SmileOutlined />
          </button>

          <p style={{
            fontSize: '0.9rem',
            color: '#999',
            marginTop: 16,
          }}>
            🎁 매주 추첨 이벤트 진행 중! <br />
            충전하고 다양한 혜택을 만나보세요!
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChargePage;