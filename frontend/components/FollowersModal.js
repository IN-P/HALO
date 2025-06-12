import React from 'react';
import { Modal } from 'antd';
import FollowList from './FollowList';

const FollowersModal = ({ open, onClose, onUpdate, data }) => {
  return (
    <Modal
      title="👥 팔로워 목록"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}
    >
      <FollowList type="followers" data={data} onUpdate={onUpdate} />
    </Modal>
  );
};

export default FollowersModal;
