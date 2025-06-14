import PlayerCard from './PlayerCard'; // ✅ 원래대로 복원

const DrawResultModal = ({ players, onClose }) => {
  if (!players || players.length === 0) return null;

  return (
    <div className="modal-backdrop">
  <div className="modal-content animate">
    <h3>🎉 뽑기 결과 ({players.length}명)</h3>
    <div className="player-grid">
      {players.map((p) => (
        <PlayerCard key={p.id} {...p} />
      ))}
    </div>
    <button className="close-btn" onClick={onClose}>닫기</button>
  </div>

  <style jsx>{`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      transform: scale(0.95);
      animation: scaleUp 0.25s ease forwards;
    }

    .player-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .close-btn {
      background-color: #ff5252;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .close-btn:hover {
      background-color: #e84141;
    }

    @keyframes scaleUp {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes fadeIn {
      from { background: rgba(0, 0, 0, 0); }
      to { background: rgba(0, 0, 0, 0.6); }
    }
  `}</style>
</div>

  );
};

export default DrawResultModal;
