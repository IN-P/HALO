// components/PlayerCard.js
const PlayerCard = ({ name, image_url, rarity }) => {
  return (
    <div className={`card ${rarity.toLowerCase()}`}>
      <img src={`http://localhost:3065/img/player/${image_url}`} alt={name} />
      <p>{name}</p>
      <p className="rarity">{rarity}</p>

      <style jsx>{`
        .card {
          border: 4px solid;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;
        }

        .card:hover {
          transform: scale(1.05);
        }

        .legend {
          border-color: #FFD700;
        }

        .rare {
          border-color: #1E90FF;
        }

        .normal {
          border-color: #aaa;
        }

        img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 50%;
        }

        .rarity {
          font-weight: bold;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;