import React, { useState, useRef } from 'react';
import axios from 'axios';

const sectors = [
  { value: 10, color: '#FFCDD2' },
  { value: 20, color: '#FFF59D' },
  { value: 50, color: '#C8E6C9' },
  { value: 100, color: '#B3E5FC' },
];
const anglePerSector = 360 / sectors.length;

const RouletteWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const wheelRef = useRef();

  const handleSpin = async () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    try {
      const res = await axios.post('/api/roulette/spin', {}, { withCredentials: true });
      const reward = res.data.point;

      const sectorIndex = sectors.findIndex(s => s.value === reward);
      if (sectorIndex === -1) throw new Error('Invalid reward');

      const rounds = 5;
      const sectorAngle = sectorIndex * anglePerSector + anglePerSector / 2;
      const stopAngle = 360 * rounds - sectorAngle;


      // ✅ transition 초기화 (즉시 적용)
      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';

      // ✅ 다음 프레임에서 회전 시작
      setTimeout(() => {
        wheelRef.current.style.transition = 'transform 4s ease-out';
        wheelRef.current.style.transform = `rotate(${stopAngle}deg)`;
      }, 20);

      setTimeout(() => {
        setResult(reward);
        setSpinning(false);
      }, 4000);
    } catch (err) {
      alert('룰렛 실패: ' + (err.response?.data?.message || '서버 오류'));
      setSpinning(false);
    }
  };

  const wheelContainerStyle = {
    position: 'relative',
    width: '300px',
    height: '300px',
  };

  const wheelStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'relative',
    border: '6px solid #4A90E2',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  };

  const pointerStyle = {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    width: 0,
    height: 0,
    marginLeft: '-10px',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '20px solid red',
  };

  const spinButtonStyle = {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#4A90E2',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: spinning ? 'not-allowed' : 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
      <h2>🎯 포인트 룰렛</h2>

      <div style={wheelContainerStyle}>
        {/* 룰렛 바퀴 */}
        <div style={wheelStyle} ref={wheelRef}>
          {/* 색상 구역 */}
          {/* 섹터: 바퀴 안에서 회전 */}
          {sectors.map((sector, i) => {
            const angle = i * anglePerSector;
            return (
              <div
                key={`sector-${i}`}
                style={{
                  position: 'absolute',
                  width: '50%',
                  height: '50%',
                  top: 0,
                  left: '50%',
                  transformOrigin: '0% 100%',
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: sector.color,
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                }}
              />
            );
          })}

          {/* ✨ 텍스트: 바퀴 위에 고정 (섹터 바깥에 위치) */}
          {sectors.map((sector, i) => {
            const angle = i * anglePerSector + anglePerSector / 2;
            return (
              <div
                key={`text-${i}`}
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '40%',
                  transform: `
          rotate(${angle}deg)
          translate(0, -85px)
          rotate(-${angle}deg)
        `,
                  transformOrigin: 'center center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#333',
                  textAlign: 'center',
                  width: '60px',
                  pointerEvents: 'none',
                }}
              >
                {sector.value}점
              </div>
            );
          })}



        </div>

        {/* 🔺 포인터 */}
        <div style={pointerStyle} />
      </div>

      {/* 🎯 버튼 */}
      <button onClick={handleSpin} disabled={spinning} style={spinButtonStyle}>
        {spinning ? '돌리는 중...' : '룰렛 돌리기'}
      </button>

      {/* 🎉 결과 */}
      {result && <p style={{ marginTop: '20px' }}>🎉 {result} 포인트 당첨!</p>}
    </div>
  );
};

export default RouletteWheel;
