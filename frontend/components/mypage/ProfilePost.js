import React, { useState } from "react";
import { InboxOutlined, HeartOutlined, TagOutlined, ContainerOutlined } from "@ant-design/icons";
import MyPost from "./MyPost";
import MyBookmark from "./MyBookmark";
import MyLiked from "./MyLiked";
import MySave from "./MySave";
import PlayerCard from "./PlayerCard"

const ProfilePost = ({ data, isMyProfile, isBlocked, isBlockedByTarget }) => {//윫 수정
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
                <ContainerOutlined />
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
                        <div
                        role="tab"
                        tabIndex={0}
                        onClick={() => setActiveTab("save")}
                        onKeyDown={(e) => e.key === "Enter" && setActiveTab("save")}
                        style={activeTab === "save" ? activeTabStyle : inactiveTabStyle}
                        aria-selected={activeTab === "save"}
                        >
                        <InboxOutlined />
                        <span>보관함</span>
                        </div>
                        {/* 플레이어 카드 */}
                        <div
                            role="tab"
                            tabIndex={0}
                            onClick={() => setActiveTab("card")}
                            onKeyDown={(e) => e.key === "Enter" && setActiveTab("card")}
                            style={activeTab === "card" ? activeTabStyle : inactiveTabStyle}
                            aria-selected={activeTab === "card"}
                        >
                            <TagOutlined />
                            <span>카드 보관함</span>
                        </div>
                    </>
                )}
            </nav>

            <div style={{ marginTop: 24 }}>
                {activeTab === "posts" &&
                    <MyPost
                        data={data}
                        isBlocked={data?.isBlocked}
                        isBlockedByTarget={data?.isBlockedByTarget}
                    />} {/* 윫 수정 */}
            {activeTab === "bookmark" && isMyProfile && <MyBookmark data={data} />}
            {activeTab === "like" && isMyProfile && <MyLiked data={data} />}
            {activeTab === "save" && isMyProfile && <MySave data={data} />}
            {activeTab === "card" && isMyProfile && <PlayerCard />}  {/* 플레이어 카드 */}
            </div>
        </div>
    );
};

export default ProfilePost;
