// components/DrawHistoryList.js
const DrawHistoryList = ({ history }) => {
  if (!history || history.length === 0) {
    return <p>아직 뽑기 이력이 없습니다.</p>;
  }

  return (
    <ul className="history-list">
      {history.map((entry) => {
        const { name, rarity, image_url } = entry.Player || {};
        const rarityClass = rarity?.toLowerCase() || 'normal';
        return (
          <li key={entry.id} className={`history-item ${rarityClass}`}>
            <img
              src={`http://localhost:3065/img/player/${image_url}`}
              alt={name || '알 수 없음'}
            />
            <div className="info">
              <div className="name">
                <strong>{name || '이름 없음'}</strong>
                <span className={`badge ${rarityClass}`}>{rarity}</span>
              </div>
              <small className="time">
                {new Date(entry.draw_time).toLocaleString()}
              </small>
            </div>
          </li>
        );
      })}

      <style jsx>{`
  .history-item {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 0.75rem;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
  }

  .history-item:hover {
    transform: translateY(-2px);
  }

  .history-item img {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    object-fit: cover;
  }

  .info {
    display: flex;
    flex-direction: column;
    margin-left: 1rem; /* ✅ 여백 여기! */
  }

  .name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: bold;
    color: #fff;
  }

  .badge.normal {
    background-color: #777;
  }
  .badge.rare {
    background-color: #1E90FF;
  }
  .badge.legend {
    background-color: #FFD700;
    color: #333;
  }

  .time {
    color: #888;
    font-size: 0.75rem;
    margin-top: 4px;
  }
`}</style>

    </ul>
  );
};

export default DrawHistoryList;
