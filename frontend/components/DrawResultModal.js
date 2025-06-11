// 뽑기 결과를 보여주는 모달창
const DrawResultModal = ({ player, onClose }) => {
  if (!player) return null;
  return (
    <div className="modal">
      <PlayerCard {...player} />
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default DrawResultModal;
