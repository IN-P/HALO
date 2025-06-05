import React from "react";
import { Image } from "antd";

const MyBookmark = ({data}) => {
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
      {data?.BookmarkedPosts?.map((post, idx) => (
        <Image
          key={post.id || idx}
          width={250}
          height={300}
          src={post.imageUrl || "https://image.utoimage.com/preview/cp872722/2022/12/202212008462_500.jpg"}
          preview={false}
        />
      ))}
    </div>
  );
};

export default MyBookmark;