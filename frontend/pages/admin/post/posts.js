import React, { useCallback, useState, useEffect } from "react";
import AdminPostTable from "../../../components/AdminPostTable";
import axios from "axios";
import { message } from "antd";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/posts").then((res) => setPosts(res.data));
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await axios.delete(`/api/admin/post/${id}`);
        setPosts((prev) => prev.filter((post) => post.id !== id));
        message.success("삭제 완료!");
      } catch (e) {
        message.error("삭제 실패");
      }
    },
    [setPosts]
  );

  // 수정권고: 실제로는 알림 안 보냄(임시)
  const handleWarn = useCallback(
    async (id) => {
      // 실제 알림 로직은 구현 안 함!
      message.info("수정 권고 알림 기능은 추후 연결 예정입니다.");
    },
    []
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>관리자 포스트 리스트</h2>
      <AdminPostTable posts={posts} onDelete={handleDelete} onWarn={handleWarn} />
    </div>
  );
}
