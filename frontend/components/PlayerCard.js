// 선수 카드 UI(이름, 등급, 이미지)
const PlayerCard = ({ name, rarity, image_url }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <img
        src={`http://localhost:3065${image_url}`} // 정적 경로로 접근
        alt={name}
        style={{ width: '150px', height: 'auto', display: 'block', marginBottom: '10px' }}
      />
      <h3>{name}</h3>
      <p>등급: {rarity}</p>
    </div>
  );
};

export default PlayerCard;