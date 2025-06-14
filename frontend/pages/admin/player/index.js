// pages/adminPlayerPage.js
import { useState, useEffect } from 'react';
import PlayerForm from '../../../components/PlayerForm';
import PlayerCard from '../../../components/PlayerCard';
import { message } from 'antd';

const AdminPlayerPage = () => {
  const [players, setPlayers] = useState([]);

  // 선수 목록 불러오기
  const fetchPlayers = async () => {
    try {
      const res = await fetch('http://localhost:3065/store/admin/players');
      if (!res.ok) throw new Error('목록 불러오기 실패');
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error('선수 목록 불러오기 오류:', err);
      message.success('선수 목록을 불러오는데 실패했습니다.');
    }
  };

  // 선수 등록 요청
  const handleSubmit = async () => {
    await fetchPlayers();
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>선수 등록</h2>
      <PlayerForm onSubmit={handleSubmit} />

      <h2 style={{ marginTop: '40px' }}>등록된 선수 목록</h2>
      <div className="player-grid">
        {players.length > 0 ? (
          players.map((p) => <PlayerCard key={p.id} {...p} />)
        ) : (
          <p>등록된 선수가 없습니다.</p>
        )}
      </div>

      <style jsx>{`
        .player-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 2rem;
        }
      `}</style>
      </div>
  );
};

export default AdminPlayerPage;
