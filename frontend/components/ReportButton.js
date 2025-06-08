// components/ReportButton.js
import React, { useState } from 'react';
import { FaRegFlag } from 'react-icons/fa';
import PropTypes from 'prop-types';
import ReportModal from './ReportModal';

const ReportButton = ({ postId }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 18,
          color: '#ff4d4f',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        onClick={() => setVisible(true)}
      >
        <FaRegFlag />
        신고하기
      </button>
      {visible && (
        <ReportModal
          visible={visible}
          postId={postId}
          onClose={() => setVisible(false)}
        />
      )}
    </>
  );
};

ReportButton.propTypes = {
  postId: PropTypes.number.isRequired,
};

export default ReportButton;
