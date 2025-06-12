import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const colorPalette = ['#ffffff', '#dddddd', '#999999', '#000000', '#ffb6c1', '#add8e6', '#90ee90'];

const RouletteWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [sectors, setSectors] = useState([]);
  const wheelRef = useRef();

  // ✅ 보상 목록 불러오기
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await axios.get('/api/roulette/rewards', { withCredentials: true });
        const rewards = res.data;
        const sectorData = rewards.map((value, i) => ({
          value,
          color: colorPalette[i % colorPalette.length],
        }));
        setSectors(sectorData);
      } catch (err) {
        alert('보상 목록을 불러오지 못했습니다.');
        console.error(err);
      }
    };
    fetchRewards();
  }, []);

  const anglePerSector = sectors.length > 0 ? 360 / sectors.length : 0;

  const handleSpin = async () => {
    if (spinning || sectors.length === 0) return;
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

      wheelRef.current.style.transition = 'none';
      wheelRef.current.style.transform = 'rotate(0deg)';

      setTimeout(() => {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.25, 1, 0.5, 1)';
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

  return (
    <div className="roulette-bg">
      <div className="bg-overlay" />

      <div style={{
        position: 'relative',
        zIndex: 1,
        fontFamily: "'Comic Sans MS', 'Cute Font', sans-serif",
        textAlign: 'center',
        paddingTop: '50px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '30px 20px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          maxWidth: '360px',
          margin: '0 auto',
        }}>
          <h2 style={{ fontSize: '28px', color: '#111' }}>🖤 포인트 룰렛 🤍</h2>

          <div style={{
            position: 'relative',
            width: '300px',
            height: '300px',
            margin: '20px auto',
            borderRadius: '50%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          }}>
            {spinning && (
              <div className="spark">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="spark-dot"
                    style={{ transform: `rotate(${i * 30}deg) translate(140px)` }}
                  />
                ))}
              </div>
            )}

            <div ref={wheelRef} style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '10px dashed #000000',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {sectors.map((sector, i) => {
                const angle = i * anglePerSector;
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    width: '50%',
                    height: '50%',
                    top: 0,
                    left: '50%',
                    transformOrigin: '0% 100%',
                    transform: `rotate(${angle}deg)`,
                    backgroundColor: sector.color,
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  }} />
                );
              })}
              {sectors.map((sector, i) => {
                const angle = i * anglePerSector + anglePerSector / 2;
                const isDark = ['#000000', '#999999'].includes(sector.color);
                return (
                  <div key={`text-${i}`} style={{
                    position: 'absolute',
                    top: '45%',
                    left: '43%',
                    transform: `rotate(${angle}deg) translate(0, -75px) rotate(-${angle}deg)`,
                    transformOrigin: 'center center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: isDark ? '#ffffff' : '#000000',
                  }}>
                    {sector.value}점
                  </div>
                );
              })}
            </div>

            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '30px',
            }}>
              ⭐
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning || sectors.length === 0}
            style={{
              marginTop: '20px',
              padding: '14px 30px',
              fontSize: '18px',
              background: '#000',
              border: 'none',
              borderRadius: '30px',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              cursor: spinning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {spinning ? '돌리는 중...' : '룰렛 돌리기 🎀'}
          </button>

          {result && (
            <p style={{
              marginTop: '20px',
              fontSize: '20px',
              color: '#ff6f91',
              fontWeight: 'bold',
              animation: 'pop 0.8s ease-in-out',
            }}>
              🎉 {result} 포인트 당첨!
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .roulette-bg {
          position: relative;
          background-image: url('/images/star-bg.jpg');
          background-repeat: repeat;
          background-size: auto;
          min-height: 100vh;
        }

        .bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(3px);
          background-color: rgba(255, 255, 255, 0.2);
          z-index: 0;
        }

        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes spinSpark {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spark {
          position: absolute;
          top: 0;
          left: 0;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 5;
          animation: spinSpark 1s linear infinite;
        }

        .spark-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: gold;
          border-radius: 50%;
          box-shadow: 0 0 10px 4px gold;
          top: 50%;
          left: 50%;
          transform-origin: center left;
        }
      `}</style>
    </div>
  );
};

export default RouletteWheel;
