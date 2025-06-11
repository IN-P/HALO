// 유저 뽑기 이력 목록
const DrawHistoryList = ({ history }) => (
  <ul>
    {history.map((entry) => (
      <li key={entry.id}>
        <img src={entry.Player.image_url} alt={entry.Player.name} />
        <p>{entry.Player.name} - {entry.Player.rarity}</p>
        <small>{new Date(entry.draw_time).toLocaleString()}</small>
      </li>
    ))}
  </ul>
);

export default DrawHistoryList;
