// services/logService.js
const { Log } = require('../models');

/**
 * 로그 생성 함수
 * @param {Object} params
 * @param {number} params.userId - 행위자 유저 ID
 * @param {number|null} [params.targetUserId=null] - 대상 유저 ID (관리자 행위일 때)
 * @param {string} params.action - 액션명 (예: 'UPDATE_USER', 'DELETE_SOFT', 'VIEW_USER')
 * @param {string} [params.description] - 상세 설명
 * @returns {Promise<Log>} 생성된 로그 객체
 */
async function createLog({ userId, targetUserId = null, action, description = '' }) {
  return Log.create({
    user_id: userId,
    target_user_id: targetUserId,
    action,
    description,
  });
}

module.exports = { createLog };
