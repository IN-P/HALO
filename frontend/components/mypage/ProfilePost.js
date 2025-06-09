import React, { useState } from "react";
import { InboxOutlined, NumberOutlined, TagOutlined } from "@ant-design/icons";
import MyPost from "./MyPost";
import MyBookmark from "./MyBookmark";
import TaggedMe from "./TaggedMe";
// import MyTagged from "./MyTagged"; // 태그된 게시물이 있으면 사용

const ProfilePost = ({ data, isMyProfile ,isBlocked}) => {//윫 수정
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
                onClick={() => setActiveTab("tagged")}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab("tagged")}
                style={activeTab === "tagged" ? activeTabStyle : inactiveTabStyle}
                aria-selected={activeTab === "tagged"}
                >
                <NumberOutlined />
                <span>태그됨</span>
                </div>
            </>
            )}
        </nav>

        <div style={{ marginTop: 24 }}>
            {activeTab === "posts" && <MyPost data={data} isBlocked={isBlocked}/>} {/* 윫 수정 */}
            {activeTab === "bookmark" && isMyProfile && <MyBookmark data={data} />}
            {activeTab === "tagged" && isMyProfile && <TaggedMe data={data} />}
        </div>
        </div>
    );
};

export default ProfilePost;
