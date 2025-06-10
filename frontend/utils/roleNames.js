export const UserRoleNames = {
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
};

export const getRoleName = (code) => UserRoleNames[code] || "알 수 없음";
