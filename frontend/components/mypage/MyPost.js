import React from "react";
import { Image } from "antd";

const MyPost = ({ data, isBlocked, isBlockedByTarget }) => {
  if (isBlockedByTarget) {
    return (
      <div style={{ width: '800px', margin: '0 auto', textAlign: 'center', marginTop: '40px', color: '#999' }}>
        <p> </p>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div style={{ width: '800px', margin: '0 auto', textAlign: 'center', marginTop: '40px', color: '#999' }}>
        <p>차단한 사용자의 게시글은 표시되지 않습니다.</p>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // 3열 고정
        gap: "5px",
        width: "800px",
        margin: "0 auto",
        marginTop: "20px",
      }}
    >
      {data?.Posts?.map((post, idx) => (
        <Image
          key={post.id || idx}
          width={250}
          height={300}
          src={post.imageUrl || "https://img.freepik.com/free-vector/cloudy-sky-background-with-birds-flying-flat-style_23-2147794538.jpg?semt=ais_items_boosted&w=740"}
          preview={false}
        />
      ))}
    </div>
  );
};

export default MyPost;
