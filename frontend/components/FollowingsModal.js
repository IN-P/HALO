import React from 'react';
import { Modal } from 'antd';
import FollowList from './FollowList';

const FollowingsModal = ({ open, onClose, onUpdate, data }) => {
  return (
    <Modal
      title="👤 팔로잉 목록"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}
    >
      <FollowList type="followings" data={data} onUpdate={onUpdate} />
    </Modal>
  );
};

export default FollowingsModal;
