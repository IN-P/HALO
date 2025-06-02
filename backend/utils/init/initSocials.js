// 간편로그인 테이블 기본값 넣어주기

const db = require('../../models');

module.exports = async () => {
  const socials = [
    { id: 1, social_id: 'none' },
    { id: 2, social_id: 'google' },
    { id: 3, social_id: 'kakao' },
  ];

  const SocialModel = db.Social; // Social 모델명에 맞게 확인

  if (!SocialModel) {
    console.error(' Social 모델을 찾을 수 없습니다.');
    return;
  }

  for (const s of socials) {
    try {
      await SocialModel.findOrCreate({
        where: { id: s.id },
        defaults: { social_id: s.social_id }, // 컬럼명 확인
      });
      console.log(`[SOCIAL] ${s.social_id} 등록 완료`);
    } catch (err) {
      console.error(`[SOCIAL ERROR] ${s.social_id}`, err);
    }
  }
};