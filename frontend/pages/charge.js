import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ChargePage = () => {
  const [amount, setAmount] = useState(10000);
  const { user } = useSelector((state) => state.user_YG);

  const handlePayment = async () => {
    if (!user || !user.id) {
      return alert('로그인이 필요합니다.');
    }

    if (!amount || amount < 1000) {
      return alert('최소 1000원 이상 충전 가능합니다.');
    }

    try {
      const res = await axios.post('http://localhost:3065/pay/ready', {
        userId: user.id,
        amount,
      });

      if (res.data?.next_redirect_pc_url) {
        window.location.href = res.data.next_redirect_pc_url;
      } else {
        alert('결제 URL을 받지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('결제 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e0f7fa 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff',
        padding: 40,
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        width: 360,
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#00C896',
          fontSize: '1.8rem',
          marginBottom: 24
        }}>
          💰 포인트 충전
        </h2>

        <label htmlFor="amount" style={{ fontWeight: 'bold', fontSize: '1rem' }}>충전 금액</label>
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
            padding: '10px 16px',
            width: '100%',
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        />

        <button
          onClick={handlePayment}
          style={{
            backgroundColor: '#FEE500',
            color: '#000',
            padding: '12px 24px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#ffe000'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#FEE500'}
        >
          🟡 카카오페이로 결제하기
        </button>
      </div>
    </div>
  );
};

export default ChargePage;
