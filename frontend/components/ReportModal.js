import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { REPORT_POST_REQUEST } from '../reducers/report_YB';

const { TextArea } = Input;

const ReportModal = ({ visible, onClose, postId, targetType }) => {
  const dispatch = useDispatch();

 

  const [reason, setReason] = useState('');
  const { reportLoading } = useSelector((state) => state.report_YB);

  const handleOk = () => {
    if (!reason.trim()) {
      message.warning('신고 사유를 입력해주세요.');
      return;
    }
    dispatch({
      type: REPORT_POST_REQUEST,
      data: {
        reason,
        target_type_id: targetType,       // 예: 게시글 신고는 1
        target_id: postId,       // postId를 명확하게 넘김
      },
    });
    setReason('');
    onClose(); // 모달 닫기
    message.success('신고가 접수되었습니다.');
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      title="신고하기"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={reportLoading}
      okText="신고"
      cancelText="취소"
       zIndex={3000}
    >
      <TextArea
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="신고 사유를 입력하세요"
      />
    </Modal>
  );
};

ReportModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  postId: PropTypes.number.isRequired,
  targetType: PropTypes.string.isRequired,
};

export default ReportModal;
