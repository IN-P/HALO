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
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          background: #fff;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 24px;
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
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #eee;
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
          font-weight: 600;
          font-size: 1.1rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
