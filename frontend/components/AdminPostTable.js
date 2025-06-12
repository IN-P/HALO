import React, { useState } from "react";
import { Table, Button, Image, Modal, Typography, Tooltip, Tag } from "antd";
import { ExclamationCircleOutlined, MessageOutlined } from "@ant-design/icons";
const { Text, Paragraph } = Typography;

function AdminPostTable({ posts, onDelete, onWarn }) {
  const [previewImages, setPreviewImages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (images) => {
    setPreviewImages(images);
    setPreviewOpen(true);
  };

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "정말 삭제하시겠습니까?",
      icon: <ExclamationCircleOutlined />,
      content: "삭제 후 복구가 어려울 수 있습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk() {
        onDelete(id);
      },
    });
  };

  const confirmWarn = (id, nickname) => {
    Modal.confirm({
      title: `${nickname}님에게 수정 권고 알림을 보내시겠습니까?`,
      icon: <ExclamationCircleOutlined />,
      okText: "알림 전송",
      cancelText: "취소",
      onOk() {
        onWarn(id);
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      responsive: ["md"],
    },
    {
      title: "이미지",
      dataIndex: "Images",
      width: 120,
      render: (images) =>
        images && images.length > 0 ? (
          <Image
            width={64}
            src={`http://localhost:3065/uploads/post/${images[0].src}`}
            preview={false}
            style={{ borderRadius: 8, cursor: "pointer", objectFit: "cover", aspectRatio: "4/3" }}
            onClick={() => handlePreview(images.map((img) => `http://localhost:3065/uploads/post/${img.src}`))}
            fallback="/no-img.png"
          />
        ) : (
          <Text type="secondary" italic>
            없음
          </Text>
        ),
    },
    {
      title: "작성자",
      dataIndex: ["User", "nickname"],
      width: 110,
      render: (_, record) =>
        record.User?.nickname ? (
          <Tooltip title={`ID: ${record.User.id}`}>{record.User.nickname}</Tooltip>
        ) : (
          <Text type="secondary">알수없음</Text>
        ),
    },
    {
      title: "내용",
      dataIndex: "content",
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "더보기" }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: (
        <span>
          <MessageOutlined style={{ color: "#999" }} /> <span style={{ marginLeft: 2 }}>댓글수</span>
        </span>
      ),
      dataIndex: "commentCount",
      width: 80,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      width: 140,
      render: (date) =>
        date ? new Date(date).toLocaleString("ko-KR") : "",
      responsive: ["md"],
    },
    {
      title: "액션",
      dataIndex: "id",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => window.location.href = `/admin/post/${record.id}`}
            style={{ background: "#eee" }}
          >
            상세
          </Button>
          <Button
            type="danger"
            size="small"
            onClick={() => confirmDelete(record.id)}
          >
            삭제
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => confirmWarn(record.id, record.User?.nickname)}
          >
            수정권고
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        pagination={{ pageSize: 20, showSizeChanger: false }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
        style={{ margin: "32px 0" }}
      />

      {/* 이미지 프리뷰 모달 */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={520}
        bodyStyle={{ textAlign: "center", padding: 20 }}
      >
        {previewImages.map((src, idx) => (
          <Image
            key={idx}
            src={src}
            style={{ margin: 8, borderRadius: 10, maxHeight: 320 }}
            preview={false}
          />
        ))}
      </Modal>
    </>
  );
}

export default AdminPostTable;
