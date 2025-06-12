import React, { useState, useEffect } from "react";
import { Card, Typography, Image, Space, Divider, Button, Modal, Tag, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

export default function AdminPostDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (id) {
      axios.get(`/api/admin/post/${id}`).then((res) => setPost(res.data));
    }
  }, [id]);

  if (!post) return <div>로딩중...</div>;

  // 삭제 확인
  const handleDelete = () => {
    Modal.confirm({
      title: "정말 삭제하시겠습니까?",
      icon: <ExclamationCircleOutlined />,
      content: "삭제 후 복구가 어려울 수 있습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        await axios.delete(`/api/admin/post/${id}`);
        message.success("삭제 완료!");
        router.push("/admin/posts");
      },
    });
  };

  // 수정권고 확인
  const handleWarn = () => {
    Modal.confirm({
      title: `${post.User?.nickname}님에게 수정 권고 알림을 보내시겠습니까?`,
      icon: <ExclamationCircleOutlined />,
      okText: "알림 전송",
      cancelText: "취소",
      onOk: async () => {
        await axios.post(`/api/admin/post/${id}/warn`);
        message.success("알림 전송 완료!");
      },
    });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <Card
        title={<Title level={4}>포스트 상세정보 (ID: {post.id})</Title>}
        extra={
          <Space>
            <Button type="danger" onClick={handleDelete}>
              삭제
            </Button>
            <Button type="primary" onClick={handleWarn}>
              수정권고
            </Button>
          </Space>
        }
        bordered
        style={{ marginBottom: 40 }}
      >
        <Space align="start" size={32}>
          <div>
            {post.Images && post.Images.length > 0 ? (
              <Space>
                {post.Images.map((img, idx) => (
                  <Image
                    key={idx}
                    width={110}
                    src={`http://localhost:3065/uploads/post/${img.src}`}
                    preview={false}
                    style={{ borderRadius: 10, cursor: "pointer" }}
                    onClick={() => {
                      setPreviewImage(`http://localhost:3065/uploads/post/${img.src}`);
                      setPreviewOpen(true);
                    }}
                  />
                ))}
              </Space>
            ) : (
              <Text type="secondary" italic>
                이미지 없음
              </Text>
            )}
          </div>
          <div style={{ minWidth: 220 }}>
            <Text strong>작성자: </Text>
            {post.User?.nickname || <Text type="secondary">알수없음</Text>}
            <br />
            <Text strong>작성일: </Text>
            {new Date(post.createdAt).toLocaleString("ko-KR")}
            <br />
            <Text strong>상태: </Text>
            {post.is_deleted ? <Tag color="red">삭제됨</Tag> : <Tag color="green">정상</Tag>}
            <br />
            <Text strong>타입: </Text>
            {post.regram_id
              ? <Tag color="blue">리그램글</Tag>
              : <Tag color="gold">원본글</Tag>
            }
          </div>
        </Space>
        <Divider />
        <Paragraph style={{ fontSize: 16 }}>
          <Text strong>내용:</Text>
          <br />
          {post.content}
        </Paragraph>
        <Divider />
        <Paragraph>
          <Text strong>댓글:</Text>
          {Array.isArray(post.Comments) && post.Comments.length > 0 ? (
            post.Comments.map((comment) => (
              <div key={comment.id} style={{ marginBottom: 10, padding: 8, background: "#f9f9f9", borderRadius: 5 }}>
                <b>{comment.User?.nickname || "알수없음"}</b> : {comment.content}
              </div>
            ))
          ) : (
            <span style={{ color: "#aaa" }}>댓글 없음</span>
          )}
        </Paragraph>
      </Card>
      {/* 이미지 프리뷰 모달 */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={560}
        bodyStyle={{ textAlign: "center" }}
      >
        <Image src={previewImage} style={{ borderRadius: 10, maxHeight: 440 }} preview={false} />
      </Modal>
    </div>
  );
}
