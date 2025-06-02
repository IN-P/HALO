// 휴먼계정 로직 자동화

const cron = require('node-cron');
const path = require('path');

module.exports = () => {
  cron.schedule('0 4 * * *', () => {
    console.log('[CRON] 매일 4시: 휴면 계정 전환');
    require(path.join(__dirname, '../scripts/autoDormantUsers.js'));
  });
};
