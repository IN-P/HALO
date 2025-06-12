// pages/playerHistoryPage.js
import { useEffect, useState } from 'react';
import DrawHistoryList from '../components/DrawHistoryList';

const PlayerHistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/store/draw/player-draw/history', {
          credentials: 'include',
        });
        const data = await res.json();
        setHistory(data);
        console.log('📜 뽑기 이력:', data); // 여기에 찍으면 API 응답 확인 가능
      } catch (err) {
        console.error('이력 불러오기 실패', err);
      }
    };

    fetchHistory();
  }, []);


  return (
    <>
      <h2>📜 나의 뽑기 이력</h2>
      <DrawHistoryList history={history} />
    </>
  );
};

export default PlayerHistoryPage;
