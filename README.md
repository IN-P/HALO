# HALO
> - 야구 팬들이 다양한 콘텐츠(제품 후기, 경기 응원, 선수 정보 등)를 자유롭게 공유하고 피드백을 주고받을 수 있는 커뮤니티형 SNS 플랫폼
> - 벤치마킹 : 인스타그램, X(트위터), 페이스북  
---


## 프로젝트 소개:
HALO는 실시간 채팅 및 맨션, 포스트 추천 알고리즘, 업적·뱃지 시스템, 광고 포스트 등
사용자 인터랙션 기능과 함께, 관리자 권한 분기, 회원 인증 및 결제 시스템,
자동 공격 탐지 및 로그 기록까지 실전 서비스 수준으로 설계되었습니다.

프론트는 Next.js + Redux 기반, 백엔드는 Node.js + Express + MySQL로 구성되었으며
팀원별 역할 분담을 통해 기능별 모듈을 독립적으로 설계·개발한 협업형 프로젝트입니다.

---
##  관련문서 (아직 빠진 문서들 많고 링크 연결 안된 문서 있음
- [ERD (DB 설계도)](링크추가) - 연결안됨\
- [기능 요구사항 정의서 (Notion 등)](링크추가) - 연결안됨
- [화면 설계안 (피그마)](https://www.figma.com/design/Rq64drhRrFNn4V3IZoSINI/HALO?node-id=0-1&t=DwuTeYBSMSj4Tevs-1)
- [HALO 보안 정리 문서](https://github.com/IN-P/HALO/blob/main/security.md)

---
## 주요기능 :

| 분류 | 기능 설명 |
|------|-----------|
| 👤 **사용자 기능** | - 회원가입 / 로그인 / 소셜 로그인 (카카오, 구글)<br>- 비밀번호 변경, 탈퇴 (소프트딜리트)<br>- 휴면 / 정지 / 복구 처리 (이메일 인증 기반) |
| 🗨️ **실시간 기능** | - 실시간 채팅 및 맨션(@)<br>- 실시간 알림 시스템<br>- 업적 / 뱃지 시스템 |
| 📰 **피드 & 포스트** | - 포스트 작성, 이미지 업로드<br>- 캐러셀(슬라이드) 기능<br>- 피드 추천 알고리즘 적용<br>- 광고 포스트 별도 구분 |
| 🎮 **상호작용 기능** | - 팔로우 / 언팔로우<br>- 유저 차단<br>- 문의 등록, 신고 접수 기능 |
| 🔐 **인증 및 보안** | - 세션 기반 인증 (`passport` + `express-session`)<br>- 계정 상태별 분기 처리 (탈퇴, 휴면, 정지)<br>- 보안 모니터링 미들웨어: 로그인 실패, 빠른 요청 반복, XSS/SQL 인젝션 시도 등 10+ 패턴을 감지해 로그 기록<br>- 보안 로그 기록 및 관리자 전용 로그 조회 시스템 |
| 💳 **결제 시스템** | - 카카오페이 연동 실시간 포인트 충전<br>- 멤버십 등급 적용 및 잔액 관리<br>- 결제 내역 확인, 환불 처리 로직 포함 |
| 🛠️ **관리자 기능** | - 13종의 관리자 역할 기반 권한 분기 (`role` 관리)<br>- 유저 관리 (조회 / 수정 / 소프트·하드 삭제)<br>- 업적, 신고, 보안 로그, 포스트 등 세부 권한별 페이지 운영 |
| 📦 **기타** | - 기상청 날씨 API 연동<br>- 개발용 더미데이터 생성 (`@faker-js/faker`) |

---

##  프로젝트 실행 방법

### 1. 환경 변수 설정 (.env)

> 프로젝트 실행 전, 백엔드 루트 디렉토리에 `.env` 파일을 반드시 생성하고 아래 항목을 설정해야 합니다.  
> DB명은 halo 입니다

```env
#  DATABASE 설정
DB_PASSPORT=your_db_password

#  세션 쿠키 시크릿 키
COOKIE_SECRET=your_cookie_secret

# 🌤 기상청 날씨 API (KMA)
KMA_API_KEY=your_kma_api_key

#  이메일 인증 설정
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_app_password

#  Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3065/auth/google/callback

#  Kakao OAuth & 결제
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CALLBACK_URL=http://localhost:3065/auth/kakao/callback
KAKAO_SECRET_KEY=your_kakao_secret_key
KAKAO_PAY_CID=your_kakaopay_cid

#  OpenAI 연동용 (자동응답/AI 기능 등)
OPENAI_API_KEY=your_openai_api_key

#  프론트엔드 도메인
FRONTEND_DOMAIN=http://localhost:3000

```
> .env 파일은 Git에 업로드되지 않도록 .gitignore에 포함되어 있습니다.
> 위 값은 실제 키로 대체해 주세요. 키는 팀원별로 개별 전달합니다.

### 2. 백엔드 실행
```
cd backend
npm install
npm run dev
```
> 기본적으로 Express 서버는 http://localhost:3065에서 실행됩니다.

### 3. 프론트엔드 실행
```
cd frontend
npm install
npm run dev
```
> Next.js 기반 프론트엔드는 http://localhost:3000에서 실행됩니다.
---

## 기여자

| 이름 | 역할 |
|------|------|
| 박인 (팀장) | **포스트/피드 전체 흐름 설계 및 추천 알고리즘 구현**<br> - 게시글 업로드, 피드 구성, 이미지 슬라이더, 사용자 맞춤형 정렬 로직 담당 |
| 김재원 | **실시간 소통 기능 및 외부 API 연동**<br> - 채팅 및 멘션 시스템, 기상청 날씨 API, 광고 전용 포스트 인터페이스 설계 |
| 조율비 | **유저 상호작용 모듈 및 신고/문의 처리 구조 담당**<br> - 차단 및 팔로우 기능, 신고 접수/문의 등록 시스템 개발, 룰렛 시스템 개발 |
| 김준혁 | **마이페이지 및 활동 기반 시스템 구현**<br> - 프로필/알림/업적/뱃지 UI 및 기록 추적 기능 전체 담당 |
| 안윤기 | **회원 인증, 보안, 결제 시스템 전반 설계 및 로그 추적 기능 담당**<br> - 세션 인증, 간편로그인, 계정 복구, 카카오페이 결제, 소프트/하드 딜리트 처리, 보안 모니터링 미들웨어(로그인 실패, 빠른 요청, XSS/SQL 인젝션 등 의심스러운 요청 감지 및 로그 기록), 관리자 권한 구조 설계 |
| 김경미 | **유저 참여형 콘텐츠 기획 및 인터랙션 기능 구현**<br> - 퀴즈 이벤트, 인기 선수 투표, 유저 참여 기반 콘텐츠 및 게임화 요소(Gamification) 구성 |


---

## 기술 스택 (Tech Stack)

#### 📦 프론트엔드 환경 (Next.js 기반)

| 항목 | 실제 설치 버전 | 용도 |
|------|------------------|------|
| Node.js | **v22.15.0** | 전체 자바스크립트 런타임 |
| NPM | **v10.9.2** | 패키지 설치 및 관리 |
| Next.js | **13.4.13** | SSR 지원 React 프레임워크 |
| React | **18.3.1** | UI 컴포넌트 구성 라이브러리 |
| Redux | **4.0.5** | 글로벌 상태 관리 |
| Redux-Saga | **1.1.3** | 비동기 사이드이펙트 처리 |
| Styled-Components | **5.3.11** | CSS-in-JS 방식 스타일링 |
| Ant Design | **4.24.16** | UI 컴포넌트 프레임워크 |
| Framer-Motion | **12.17.0** | 애니메이션 및 인터랙션 |
| React-Slick | **0.30.3** | 슬라이더/캐러셀 구현 |
| Immer | **9.0.19** | 상태 불변성 유지 보조 |
| Axios | **1.9.0** | HTTP 통신 (API 요청) |
| Shortid | **2.2.15** | 고유 ID 생성 |
| Prop-Types | **15.8.1** | 컴포넌트 타입 검사 |
| @faker-js/faker | **9.8.0** | 더미데이터 생성 (개발용) |

---

#### ⚙️ 백엔드 환경 (Node.js + Express)

| 항목 | 실제 설치 버전 | 용도 |
|------|------------------|------|
| Node.js | **v22.15.0** | 서버 실행 및 API 처리 |
| NPM | **v10.9.2** | 백엔드 의존성 관리 |
| Express | **5.1.0** | 웹 서버 및 REST API 프레임워크 |
| Sequelize | **6.37.7** | ORM: DB 테이블 관리 |
| Sequelize CLI | **6.6.3** | 마이그레이션 및 모델 자동화 |
| MySQL2 | **3.14.1** | MySQL 연결용 드라이버 |
| Passport | **0.7.0** | 인증 처리 프레임워크 |
| Passport-Local | **1.0.0** | 기본 이메일+비밀번호 로그인 |
| Passport-Kakao | **1.0.1** | 카카오 간편 로그인 |
| Passport-Google | **2.0.0** | 구글 간편 로그인 |
| Bcrypt | **6.0.0** | 비밀번호 해시 처리 |
| Express-Session | **1.18.1** | 세션 기반 로그인 관리 |
| Cookie-Parser | **1.4.7** | 쿠키 읽기 및 파싱 |
| Dotenv | **16.5.0** | 환경변수 설정(.env) 로드 |
| Multer | **2.0.0** | 이미지 및 파일 업로드 |
| Morgan | **1.10.0** | 요청 로깅 (로그 미들웨어) |
| Cors | **2.8.5** | CORS 설정 (프론트-백 연결 허용) |
| Nodemailer | **7.0.3** | 이메일 발송 기능 |
| Node-Cron | **4.1.0** | 예약 작업 실행 (예: 자동 삭제) |
| OpenAI | **5.3.0** | AI 자동화 기능 테스트용 |
| Socket.io | **4.8.1** | 실시간 채팅 및 알림 |
| Express-Socket.io-Session | **1.3.5** | 세션 기반 실시간 통신 연동 |
| Moment-Timezone | **0.6.0** | 날짜/시간 포맷 처리 |

####  데이터베이스
| 항목 | 버전 | 용도 |
|------|--------|------|
| MySQL | **8.0.41** | 관계형 DB, 사용자/게시글/결제 등 저장소 |

---
## 협업 도구

- Git / GitHub  
  버전 관리 및 코드 공유, PR 리뷰 및 브랜치 전략 사용

- Sourcetree  
  Git GUI 툴로 브랜치 시각화 및 커밋 내역 관리

- KakaoTalk  
  빠른 피드백 및 일정 조율을 위한 실시간 커뮤니케이션

- Discord  
  음성 회의 및 화면 공유를 통한 원격 회의 진행

- 구글 스프레드시트 (공유 시트)  
  업무 분담, 일정 관리, ERD 및 API 명세 작성 등 협업용 문서 관리

- 오프라인 미팅  
  주요 기획 회의 및 설계 논의는 직접 만나서 진행
