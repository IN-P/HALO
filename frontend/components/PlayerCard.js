const PlayerCard = ({ name, image_url, rarity = 'NORMAL' }) => {
  const rarityClass = rarity.toLowerCase();

  return (
    <div className="card-wrapper">
      <div className={`card-inner ${rarityClass}`}>
        {/* 앞면 */}
        <div className="card-front">
          <div className="badge">{rarity}</div>
          <img
            className="player-img"
            src={`http://localhost:3065/img/player/${image_url}`}
            alt={name}
          />
          <div className="name">{name}</div>
        </div>

        {/* 뒷면 */}
        <div className="card-back">
          <div className="back-content">
            <div className="back-name">{name}</div>
            <div className="back-rarity">{rarity}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-wrapper {
          perspective: 1000px;
          width: 140px;
          height: 200px;
        }

        .card-inner {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          position: relative;
          cursor: pointer;
        }

        .card-wrapper:hover .card-inner {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-front {
          background: white;
        }

        .card-back {
          background: #222;
          color: white;
          transform: rotateY(180deg);
        }

        .legend .card-front {
          background: linear-gradient(to bottom right, #ffe066, #fff9c4);
          border: 2px solid #FFD700;
        }

        .rare .card-front {
          background: linear-gradient(to bottom right, #d0eaff, #b3dbff);
          border: 2px solid #1E90FF;
        }

        .normal .card-front {
          background: #f5f5f5;
          border: 2px solid #aaa;
        }

        .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 0.7rem;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .player-img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          margin-top: 20px;
          border: 3px solid #fff;
          background: #f0f0f0;
        }

        .name {
          font-weight: bold;
          font-size: 1rem;
          margin-top: 0.75rem;
          color: #111;
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
        }

        .back-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .back-name {
          font-size: 1.1rem;
          font-weight: bold;
        }

        .back-rarity {
          font-size: 0.85rem;
          padding: 4px 10px;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
