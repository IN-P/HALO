import React from 'react';
import { FaRegFlag } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ReportButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#fff5f5',
        border: '1px solid #ff4d4f',
        color: '#ff4d4f',
        fontWeight: 500,
        fontSize: 14,
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#ffebeb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fff5f5';
      }}
    >
      <FaRegFlag style={{ fontSize: 14 }} />
      신고
    </button>
  );
};

ReportButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ReportButton;
