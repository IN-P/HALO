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
        <button onClick={onClose}>닫기</button>
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
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          text-align: center;
        }

        .player-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default DrawResultModal;
