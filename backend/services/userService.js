const { User, DeleteUser } = require('../models');

exports.deactivateUser = async (userId) => {
  // 1. 유저 존재 확인
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('존재하지 않는 유저입니다.');
  }

  // 이미 탈퇴한 유저면 중복처리 방지
  if (user.user_status_id === 2) {
    throw new Error('이미 탈퇴한 회원입니다.');
  }

  // 2. 상태 변경: 탈퇴 상태(2번)로 업데이트
  await User.update(
    { user_status_id: 2 }, // 상태 2 = 탈퇴
    { where: { id: userId } }
  );

  // 3. 탈퇴 백업용 로그 저장
  await DeleteUser.create({
    users_id: userId,
    // deleted_at은 default로 현재시간
  });

  return true;
};
