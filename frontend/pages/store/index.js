import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../../components/AppLayout';
import DrawResultModal from '../../components/DrawResultModal';
import DrawHistoryList from '../../components/DrawHistoryList';
import { DRAW_PLAYER_REQUEST, CLEAR_DRAW_RESULT, LOAD_DRAW_HISTORY_REQUEST } from '../../reducers/playerDraw_GM';

const StorePage = () => {
  const dispatch = useDispatch();
  const { drawResult, drawPlayerLoading, drawHistory } = useSelector((state) => state.playerDraw);

  useEffect(() => {
    dispatch({ type: LOAD_DRAW_HISTORY_REQUEST });
  }, [dispatch]);

  const handleDraw = (count = 1) => {
    dispatch({ type: DRAW_PLAYER_REQUEST, data: { count } });
  };

  const handleCloseModal = () => {
    dispatch({ type: CLEAR_DRAW_RESULT });
  };

  return (
    <AppLayout>
      <div style={{ padding: '2rem' }}>
        <h2>🎁 선수 뽑기 상점</h2>
        <div className="draw-buttons">
          <button className="draw-btn" onClick={() => handleDraw(1)} disabled={drawPlayerLoading}>
            {drawPlayerLoading ? '뽑는 중...' : '1회 뽑기 (10P)'}
          </button>
          <button className="draw-btn" onClick={() => handleDraw(10)} disabled={drawPlayerLoading}>
            {drawPlayerLoading ? '뽑는 중...' : '10회 뽑기 (100P)'}
          </button>
        </div>
        {drawPlayerLoading && <p className="loading">🎲 뽑기 중...</p>}

        <style jsx>{`
          .draw-box {
            background: #fffbe6;
            border: 2px solid #ffcd38;
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 6px 20px rgba(255, 204, 0, 0.15);
            margin-bottom: 2rem;
          }

          .draw-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 1rem;
          }

          .draw-btn {
            background-color: white;
            border: 2px solid #ffb400;
            padding: 0.6rem 1.2rem;
            font-weight: bold;
            font-size: 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.1s ease, box-shadow 0.2s ease;
          }

          .draw-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          }

          .draw-btn:active {
            transform: scale(0.95);
            background: #fff8dd;
          }

          .draw-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading {
            margin-top: 1rem;
            font-style: italic;
            color: #888;
          }
        `}</style>

        {drawResult && (
          <DrawResultModal players={drawResult.players} onClose={handleCloseModal} />
        )}

        <hr style={{ margin: '2rem 0' }} />
        <h3>📜 나의 뽑기 이력</h3>
        <DrawHistoryList history={drawHistory} />
      </div>
    </AppLayout>
  );
};

export default StorePage;
