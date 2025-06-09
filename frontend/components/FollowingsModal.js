import React from 'react';
import { Modal } from 'antd';
import FollowList from './FollowList';

const FollowingsModal = ({ open, onClose }) => {
  return (
    <Modal
      title="🚀 팔로잉 목록"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}
    >
      <FollowList type="followings" />
    </Modal>
  );
};

export default FollowingsModal;
