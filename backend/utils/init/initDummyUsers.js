const bcrypt = require('bcrypt');
const { User } = require('../../models');

const createDummyUsers = async () => {
  const passwordHash = await bcrypt.hash('1234', 12); // 모든 유저 동일 비번

  // 1. 마스터 계정
  await User.findOrCreate({
    where: { email: 'master@g.com' },
    defaults: {
      nickname: '마스터관리자',
      password: passwordHash,
      role: 1,
      ip: '127.0.0.1',
      profile_img: '/img/profile/default.jpg',
      theme_mode: 'light',
      is_private: 0,
      balance: 0,
      email_chk: 1,
      user_status_id: 1,
      membership_id: 1,
      myteam_id: 1,
      social_id: 1,
    },
  });

  // 2. 관리자 2~13
  for (let i = 2; i <= 13; i++) {
    await User.findOrCreate({
      where: { email: `admin${i}@g.com` },
      defaults: {
        nickname: `관리자${i}`,
        password: passwordHash,
        role: i,
        ip: '127.0.0.1',
        profile_img: '/img/profile/default.jpg',
        theme_mode: 'light',
        is_private: 0,
        balance: 0,
        email_chk: 1,
        user_status_id: 1,
        membership_id: 1,
        myteam_id: 1,
        social_id: 1,
      },
    });
  }

  // 3. 일반 유저 1000 ~ 1050
  for (let i = 1000; i <= 1050; i++) {
    await User.findOrCreate({
      where: { email: `${i}@g.com` },
      defaults: {
        nickname: `유저${i}`,
        password: passwordHash,
        role: 0,
        ip: '127.0.0.1',
        profile_img: '/img/profile/default.jpg',
        theme_mode: 'light',
        is_private: 0,
        balance: 0,
        email_chk: 1,
        user_status_id: 1,
        membership_id: 1,
        myteam_id: 1,
        social_id: 1,
      },
    });
  }

  console.log(' 더미 유저 자동 생성 완료');
};

module.exports = createDummyUsers;
