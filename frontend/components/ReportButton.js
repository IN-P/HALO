import React from 'react';
import { FaRegFlag } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ReportButton = ({ onClick }) => {
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 15,
        color: '#ff4d4f',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 0,
      }}
      onClick={onClick}
    >
      <FaRegFlag />
      신고
    </button>
  );
};

ReportButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ReportButton;
