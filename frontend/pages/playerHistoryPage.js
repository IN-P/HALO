// 유저 뽑기 이력 조회
import { useState, useEffect } from 'react';
import DrawHistoryList from '../components/DrawHistoryList';

const PlayerHistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch('/api/player-draw/history/1');  // 테스트용 userId
      const data = await res.json();
      setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <>
      <h2>나의 뽑기 이력</h2>
      <DrawHistoryList history={history} />
    </>
  );
};

export default PlayerHistoryPage;
