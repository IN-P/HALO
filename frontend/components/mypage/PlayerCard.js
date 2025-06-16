import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_DRAW_HISTORY_REQUEST } from '../../reducers/playerDraw_GM';
import PlayerCard from '../../components/PlayerCard';

const MyPlayerCardList = () => {
  const dispatch = useDispatch();
  const { drawHistory } = useSelector((state) => state.playerDraw);

  const [filter, setFilter] = useState('ALL'); // 등급 필터
  const [keyword, setKeyword] = useState('');  // 이름 검색
  const [sort, setSort] = useState('NAME');    // 정렬 기준

  useEffect(() => {
    dispatch({ type: LOAD_DRAW_HISTORY_REQUEST });
  }, [dispatch]);

  // 중복 포함 전체 → 이름 기준 그룹화
  const groupedPlayers = Object.values(
    drawHistory.reduce((acc, { Player }) => {
      const key = Player.name;
      if (!acc[key]) acc[key] = { ...Player, count: 1 };
      else acc[key].count += 1;
      return acc;
    }, {})
  );

  const totalCards = drawHistory.length;
  const uniqueCards = groupedPlayers.length;

  // 등급/이름 필터링
  const filteredPlayers = groupedPlayers.filter((p) => {
    const matchRarity = filter === 'ALL' || p.rarity === filter;
    const matchName = p.name.toLowerCase().includes(keyword.toLowerCase());
    return matchRarity && matchName;
  });

  // 정렬
  const rarityRank = { LEGEND: 3, RARE: 2, NORMAL: 1 };
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sort === 'NAME') return a.name.localeCompare(b.name);
    if (sort === 'COUNT') return b.count - a.count;
    if (sort === 'RARITY') return rarityRank[b.rarity] - rarityRank[a.rarity];
    return 0;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h3>내가 뽑은 선수 카드</h3>

      {/* 필터 & 정렬 */}
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>등급:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="ALL">전체</option>
          <option value="NORMAL">NORMAL</option>
          <option value="RARE">RARE</option>
          <option value="LEGEND">LEGEND</option>
        </select>

        <label>이름:</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="선수 이름 검색"
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        <label>정렬:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="NAME">이름순</option>
          <option value="COUNT">많이 가진 순</option>
          <option value="RARITY">등급순</option>
        </select>
      </div>

      {/* 통계 */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#444' }}>
        총 {totalCards}장 보유 (중복 포함) / 고유 카드 {uniqueCards}종
      </div>

      {/* 카드 목록 */}
      {sortedPlayers.length === 0 ? (
        <p>조건에 맞는 선수가 없습니다.</p>
      ) : (
        <div className="card-grid">
          {sortedPlayers.map((player) => (
            <div className="card-wrapper" key={player.name}>
              <PlayerCard
                name={player.name}
                image_url={player.image_url}
                rarity={player.rarity}
              />
              {player.count > 1 && (
                <div className="card-count">x{player.count}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .card-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .card-count {
          margin-top: 6px;
          font-size: 0.85rem;
          color: #555;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default MyPlayerCardList;
