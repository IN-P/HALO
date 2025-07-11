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
      try {
        await axios.post(`/api/admin/post/${id}/warn`);
        message.success("경고 완료!");
      } catch (e) {
        message.error("경고 실패");
      }
    },
    [setPosts]
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>관리자 포스트 리스트</h2>
      <AdminPostTable posts={posts} onDelete={handleDelete} onWarn={handleWarn} />
    </div>
  );
}
