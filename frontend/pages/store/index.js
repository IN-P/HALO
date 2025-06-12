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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => handleDraw(1)} disabled={drawPlayerLoading}>
            {drawPlayerLoading ? '뽑는 중...' : '1회 뽑기 (10P)'}
          </button>
          <button onClick={() => handleDraw(10)} disabled={drawPlayerLoading}>
            {drawPlayerLoading ? '뽑는 중...' : '10회 뽑기 (100P)'}
          </button>
        </div>
        {drawPlayerLoading && <p style={{ marginTop: '1rem' }}>🎲 뽑기 중...</p>}

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
