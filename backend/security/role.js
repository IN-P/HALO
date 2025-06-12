// backend/security/role.js

const UserRole = {
  MEMBER: 0, // 일반 회원

  MASTER_ADMIN: 1,
  AD_MANAGER: 2,
  REPORT_MANAGER: 3,
  INQUIRY_MANAGER: 4,
  USER_MANAGER: 5,
  SECURITY_MANAGER: 6,
  CUSTOM_MANAGER: 7,
  ACHIEVE_MANAGER: 8,
  CHAT_MANAGER: 9,
  POST_MANAGER: 10,
  ANALYTICS_MANAGER: 11, // 분석 관리자
};

const UserRoleNames = {
  0: "일반회원",
  1: "마스터관리자",
  2: "광고 관리자",
  3: "신고 관리자",
  4: "문의 관리자",
  5: "유저 관리자",
  6: "보안 관리자",
  7: "커스텀 관리자",
  8: "업적 관리자",
  9: "채팅 관리자",
  10: "포스트 관리자",
  11: "분석 관리자",
};

const getRoleName = (code) => UserRoleNames[code] || "알 수 없음";

module.exports = {
  UserRole,
  UserRoleNames,
  getRoleName,
};
