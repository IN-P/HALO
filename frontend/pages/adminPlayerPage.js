// pages/adminPlayerPage.js
import { useState, useEffect } from 'react';
import PlayerForm from '../components/PlayerForm';
import PlayerCard from '../components/PlayerCard';

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
      alert('선수 목록을 불러오는데 실패했습니다.');
    }
  };

  // 선수 등록 요청
  const handleSubmit = async (player) => {
    try {
      if (!player.name || !player.rarity || !player.image_url) {
        return alert('모든 필드를 입력해주세요.');
      }

      const res = await fetch('http://localhost:3065/store/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '등록 실패');
      }

      alert('선수 등록 완료');
      await fetchPlayers(); // 목록 갱신
    } catch (err) {
      console.error('선수 등록 오류:', err);
      alert('선수 등록 중 오류 발생');
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>선수 등록</h2>
      <PlayerForm onSubmit={handleSubmit} />

      <h2 style={{ marginTop: '40px' }}>등록된 선수 목록</h2>
      <div className="grid">
        {players.length > 0 ? (
          players.map((p) => <PlayerCard key={p.id} {...p} />)
        ) : (
          <p>등록된 선수가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPlayerPage;
