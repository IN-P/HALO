// components/DrawHistoryList.js
const DrawHistoryList = ({ history }) => {
  if (!history || history.length === 0) {
    return <p>아직 뽑기 이력이 없습니다.</p>;
  }

  return (
    <ul className="history-list">
      {history.map((entry) => (
        <li key={entry.id} className="history-item">
          <img
            src={`http://localhost:3065/img/player/${entry.Player.image_url}`}
            alt={entry.Player?.name || '알 수 없음'}
          />
          <div>
            <strong>{entry.Player?.name || '이름 없음'}</strong>
            ({entry.Player?.rarity || '등급 없음'})
            <br />
            <small>{new Date(entry.draw_time).toLocaleString()}</small>
          </div>
        </li>
      ))}
      <style jsx>{`
        .history-list {
          list-style: none;
          padding: 0;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .history-item img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }
      `}</style>
    </ul>
  );
};

export default DrawHistoryList;
