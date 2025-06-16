// middlewares/attackDetector.js
const { createLog } = require('../services/logService');
const { User, Block } = require('../models');
const { Op } = require('sequelize');

// 민감 경로 정의 - 비인가 접근 또는 반복 접근시 공격으로 간주
const suspiciousPaths = ['/admin', '/pay', '/user/withdraw', '/user/restore'];

// 허용되는 Content-Type 리스트
const allowedContentTypes = [
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
];

// 허용된 Referer 도메인 (배포 환경에 따라 환경변수로 설정)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

// === 전역 상태 관리 영역 (최초 1회 초기화) ===
if (!global.rateLimitCleanerInitialized) {
  global.rateLimitMap = new Map();        // 요청 속도 추적
  global.directAccessMap = {};            // IP별 민감경로 접근 횟수 추적
  global.logCooldown = new Map();         // 동일 로그 과다 방지용 쿨다운
  global.loginFailMap = {};               // 로그인 실패 횟수 추적
  global.rateLimitCleanerInitialized = true;

  // rateLimitMap 정리 - 오래된 요청 제거
  setInterval(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    for (const [key, history] of global.rateLimitMap) {
      const cleaned = history.filter((t) => nowSec - t < 10);
      if (cleaned.length > 0) {
        global.rateLimitMap.set(key, cleaned);
      } else {
        global.rateLimitMap.delete(key);
      }
    }
  }, 60 * 1000);

  // directAccessMap 초기화 - 하루 1회 리셋
  setInterval(() => {
    global.directAccessMap = {};
    global.loginFailMap = {};
  }, 24 * 60 * 60 * 1000);
}

// === 로그 생성 함수 (중복 방지) ===
async function logWithCooldown({ userId, action, description }) {
  const key = `${userId || 'null'}-${action}`;
  const last = global.logCooldown.get(key) || 0;
  if (Date.now() - last > 1000) {
    global.logCooldown.set(key, Date.now());
    await createLog({ userId, action, description });
  }
}

// === 공격 탐지 미들웨어 본체 ===
module.exports = async (req, res, next) => {
  try {
    const user = req.user || null;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];

    // [1] User-Agent 없음 → 봇 또는 자동화 스크립트 가능성
    if (!ua) {
      await logWithCooldown({
        userId: user?.id || null,
        action: 'SUSPECT_NO_UA',
        description: `User-Agent 없음 - IP: ${ip}, URL: ${req.originalUrl}`,
      });
    }

    // [2] 인증되지 않은 사용자의 민감 경로 직접 접근 → 관리자 페이지 탐색 시도 등
    if (!user && suspiciousPaths.some((p) => req.path.startsWith(p))) {
      await logWithCooldown({
        userId: null,
        action: 'SUSPECT_DIRECT_ACCESS',
        description: `비인가 접근: ${req.originalUrl}`,
      });
    }

    // [3] 정상상태가 아닌 유저 (휴면, 탈퇴, 정지 등)가 요청 → 정책 위반
    if (user && user.user_status_id !== 1) {
      await logWithCooldown({
        userId: user.id,
        action: 'SUSPICIOUS_STATUS_ACCESS',
        description: `정상 유저가 아님 (${user.user_status_id}) 상태에서 요청`,
      });
    }

    // [4] POST/DELETE인데 Body가 비어있음 → 스크립트 기반 공격 시도 가능성
    const bodyOptionalPaths = ['/user/delete-account'];
    if (
      ['POST', 'DELETE'].includes(req.method) &&
      Object.keys(req.body).length === 0 &&
      !bodyOptionalPaths.includes(req.path)
    ) {
      await logWithCooldown({
        userId: user?.id || null,
        action: 'EMPTY_BODY_SUSPECT',
        description: `POST/DELETE 요청인데 body가 비어있음 (${req.originalUrl})`,
      });
    }

    // [5] Referer 체크 - 외부 사이트에서 CSRF 유도 시도 방지
    if (['POST', 'DELETE'].includes(req.method)) {
      const referer = req.headers.referer;
      if (!referer || !referer.startsWith(ALLOWED_ORIGIN)) {
        await logWithCooldown({
          userId: user?.id || null,
          action: 'SUSPECT_REFERER_MISMATCH',
          description: `Referer 없음 또는 출처 불일치 (${referer || 'null'})`,
        });
      }
    }

    // [6] 3초 이내에 5회 이상 요청 → 자동화 도구, 스팸 공격 가능성
    const key = user?.id ? `user:${user.id}` : `ip:${ip}`;
    const nowSec = Math.floor(Date.now() / 1000);
    const history = global.rateLimitMap.get(key) || [];
    history.push(nowSec);
    const recent = history.filter((t) => nowSec - t < 3);
    global.rateLimitMap.set(key, recent);

    if (recent.length >= 5) {
      await logWithCooldown({
        userId: user?.id || null,
        action: 'TOO_MANY_REQUESTS',
        description: `3초 내 ${recent.length}회 요청 (${req.originalUrl})`,
      });
    }

    // [7] 쿠키 위조 감지 - 서명되지 않은 세션 쿠키가 존재할 경우
    if (req.cookies?.session && !req.signedCookies?.session) {
      await logWithCooldown({
        userId: null,
        action: 'COOKIE_TAMPERED',
        description: '세션 쿠키가 있지만 서명되지 않음 → 위조 가능성',
      });
    }

    // [8] 민감 경로 반복 접근 → 관리자 뷰 브루트포싱 가능성
    if (!user && suspiciousPaths.some((p) => req.path.startsWith(p))) {
      global.directAccessMap[ip] = (global.directAccessMap[ip] || 0) + 1;
      if (global.directAccessMap[ip] > 10) {
        await logWithCooldown({
          userId: null,
          action: 'REPEATED_DIRECT_ACCESS',
          description: `IP ${ip}가 민감한 경로를 10회 이상 직접 접근`,
        });
      }
    }

    // [9] Content-Type 조작 → 허용되지 않은 형식으로 데이터 전송 시도
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (
        contentType &&
        !allowedContentTypes.some((type) => contentType.includes(type))
      ) {
        await logWithCooldown({
          userId: user?.id || null,
          action: 'SUSPICIOUS_CONTENT_TYPE',
          description: `비정상 Content-Type: ${contentType} (${req.originalUrl})`,
        });
      }
    }

    // [10] XSS 시도 감지 (<script> 포함 여부)
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyString = JSON.stringify(req.body || {});
      if (/<script[\s>]/i.test(bodyString)) {
        await logWithCooldown({
          userId: user?.id || null,
          action: 'XSS_BODY_DETECTED',
          description: `요청 body에 <script> 포함됨`,
        });
      }
    }

    // [11] SQL Injection 의심 키워드
    const suspiciousKeywords = ["' OR", '" OR', '1=1', '--', 'UNION SELECT'];
    for (const keyword of suspiciousKeywords) {
      if (JSON.stringify(req.body || {}).toUpperCase().includes(keyword)) {
        await logWithCooldown({
          userId: user?.id || null,
          action: 'SQL_INJECTION_SUSPECT',
          description: `Body에 SQL 인젝션 의심 키워드 포함됨 (${keyword})`,
        });
        break;
      }
    }

    // [12] 로그인 실패 감지 (패스포트 이전 미들웨어에서 실행되어야 함)
    if (req.originalUrl === '/user/login' && req.method === 'POST') {
      if (req.body && req.body.email) {
        const email = req.body.email;
        global.loginFailMap[email] = (global.loginFailMap[email] || 0) + 1;
        if (global.loginFailMap[email] > 5) {
          await logWithCooldown({
            userId: null,
            action: 'REPEATED_LOGIN_FAIL',
            description: `${email} 계정으로 로그인 실패 5회 이상 발생`,
          });
        }
      }
    }

    next();
  } catch (err) {
    // [13] 미들웨어 자체 오류 로깅
    await createLog({
      userId: req.user?.id || null,
      action: 'MIDDLEWARE_ERROR',
      description: `공격 탐지 미들웨어 오류: ${err.message}`,
    });
    console.error('[공격 탐지 중 오류]', err);
    next();
  }
};
