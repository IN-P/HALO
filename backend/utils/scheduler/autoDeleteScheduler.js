// 소프트딜리트 로직 자동화

const cron = require('node-cron');
const path = require('path');

module.exports = () => {
  cron.schedule('0 3 * * *', () => {
    console.log('[CRON] 매일 3시: 30일 지난 탈퇴 유저 삭제');
    require(path.join(__dirname, '../scripts/autoDeleteUsers.js'));
  });
};
