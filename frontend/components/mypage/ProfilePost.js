import React, { useState } from "react";
import { InboxOutlined, HeartOutlined, TagOutlined } from "@ant-design/icons";
import MyPost from "./MyPost";
import MyBookmark from "./MyBookmark";
import MyLiked from "./MyLiked";

const ProfilePost = ({ data, isMyProfile }) => {
    const [activeTab, setActiveTab] = useState("posts");

    const tabStyle = {
        display: "flex",
        justifyContent: "center",
        gap: "60px",
        marginTop: "24px",
        userSelect: "none",
        flexWrap: "wrap",
        borderBottom: "1px solid #ddd",
    };

    const tabItemBaseStyle = {
        fontSize: "18px",
        fontWeight: "500",
        color: "#555",
        paddingBottom: "8px",
        cursor: "pointer",
        transition: "color 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    };

    const activeTabStyle = {
        ...tabItemBaseStyle,
        color: "#1890ff",
        borderBottom: "3px solid #1890ff",
        fontWeight: "700",
    };

    const inactiveTabStyle = {
        ...tabItemBaseStyle,
    };

    return (
        <div>
        <nav style={tabStyle} aria-label="프로필 탭 메뉴">
            <div
            role="tab"
            tabIndex={0}
            onClick={() => setActiveTab("posts")}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("posts")}
            style={activeTab === "posts" ? activeTabStyle : inactiveTabStyle}
            aria-selected={activeTab === "posts"}
            >
            <InboxOutlined />
            <span>게시물</span>
            </div>

            {isMyProfile && (
            <>
                <div
                role="tab"
                tabIndex={0}
                onClick={() => setActiveTab("bookmark")}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab("bookmark")}
                style={activeTab === "bookmark" ? activeTabStyle : inactiveTabStyle}
                aria-selected={activeTab === "bookmark"}
                >
                <TagOutlined />
                <span>북마크</span>
                </div>
                <div
                role="tab"
                tabIndex={0}
                onClick={() => setActiveTab("like")}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab("like")}
                style={activeTab === "like" ? activeTabStyle : inactiveTabStyle}
                aria-selected={activeTab === "like"}
                >
                <HeartOutlined />
                <span>좋아요</span>
                </div>
            </>
            )}
        </nav>

        <div style={{ marginTop: 24 }}>
            {activeTab === "posts" && <MyPost data={data} />}
            {activeTab === "bookmark" && isMyProfile && <MyBookmark data={data} />}
            {activeTab === "like" && isMyProfile && <MyLiked data={data} />}
        </div>
        </div>
    );
};

export default ProfilePost;
