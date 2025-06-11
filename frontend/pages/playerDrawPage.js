// 뽑기 실행 + 결과 모달
import { useState } from 'react';
import DrawResultModal from '../components/DrawResultModal';

const PlayerDrawPage = () => {
  const [result, setResult] = useState(null);

  const handleDraw = async () => {
    const res = await fetch('/api/player-draw', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ users_id: 1, used_points: 10 }),  // 테스트용 값
    });
    const data = await res.json();
    setResult(data.player);
  };

  return (
    <>
      <button onClick={handleDraw}>선수 뽑기</button>
      <DrawResultModal player={result} onClose={() => setResult(null)} />
    </>
  );
};

export default PlayerDrawPage;
