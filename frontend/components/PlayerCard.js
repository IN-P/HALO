// components/PlayerCard.js
const PlayerCard = ({ name, image_url, rarity }) => {
  return (
    <div className={`card ${rarity.toLowerCase()}`}>
      <div className="imageWrapper">
        <img src={`http://localhost:3065/img/player/${image_url}`} alt={name} />
        <span className="badge">{rarity}</span>
      </div>
      <p className="name">{name}</p>

      <style jsx>{`
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem;
          min-height: 200px; /* ✅ 전체 카드 높이 고정 또는 min-height 지정 */
          border-radius: 12px;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.03);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
        }

        .legend {
          border: 2px solid #FFD700;
        }

        .rare {
          border: 2px solid #1E90FF;
        }

        .normal {
          border: 2px solid #aaa;
        }

        .imageWrapper {
          position: relative;
          display: inline-block;
        }

        img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #eee;
          margin-top: 8px;
        }

        .badge {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: #fff;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: bold;
          border-radius: 12px;
          margin-top: 0.5rem;
        }

        .legend .badge {
          background-color: #FFD700;
          color: #000;
        }

        .rare .badge {
          background-color: #1E90FF;
        }

        .normal .badge {
          background-color: #777;
        }

        .name {
          font-weight: bold;
          margin-top: 0.75rem;
        }

        .rarity {
          margin-top: 0.4rem;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
