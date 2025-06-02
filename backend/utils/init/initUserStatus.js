// 유저상태 테이블 초기값 넣어주기

const db = require('../../models');

module.exports = async () => {
  const statuses = [
    { id: 1, status: 1 }, // 정상
    { id: 2, status: 2 }, // 탈퇴
    { id: 3, status: 3 }, // 휴먼
    { id: 4, status: 4 }, // 정지
  ];

  console.log('사용 가능한 모델:', Object.keys(db)); // 디버깅용 (유지해도 됨)

  const UserStatusModel = db.UserStatus; // 모델 정의에 명시된 정확한 모델명 'UserStatus' 사용

  if (!UserStatusModel) {
    console.error(' UserStatus 모델을 찾을 수 없습니다.'); // 에러 메시지도 모델명에 맞게 수정
    return;
  }

  for (const s of statuses) {
    try {
      console.log('삽입 시도:', s); // 디버깅용 (유지해도 됨)
      await UserStatusModel.findOrCreate({
        where: { id: s.id },
        defaults: { status: s.status },
      });
      console.log(`[USERSTATUS] ${s.status} 등록 완료`);
    } catch (err) {
      console.error(`[USERSTATUS ERROR] ${s.status}`, err);
    }
  }
};