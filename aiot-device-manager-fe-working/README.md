# AIoT Device Manager 프론트엔드

Firebase 기반으로 빠르게 IoT 디바이스 관리 화면을 구축하고, 필요 시 백엔드와 연동할 수 있도록 설계된 교육용 프로젝트입니다.

## 주요 기능
- Firebase 이메일/구글 로그인 및 세션 유지
- Firestore 실시간 동기화로 디바이스 목록·상태 관리
- MQTT(WebSocket) 구독으로 센서 데이터 실시간 수집
- 온도 차트 시각화 및 최근 메시지 표시
- `BE 연동하기` 버튼으로 백엔드 헬스 체크 후 엔드포인트 저장
- Firebase ID 토큰 캐싱(2~10분)으로 API 호출 효율화

## 사전 준비
- Node.js 18 이상
- Firebase 프로젝트(인증, Firestore 활성화)
- MQTT 브로커 URL (예: HiveMQ Public)

## 설치 & 실행
```bash
git clone <repository-url>
cd <repository-folder>/aiot-device-manager-fe-working
npm install
cp .env.example .env
npm run dev
```

## 환경 변수 (`.env`)
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# 선택 사항 – 백엔드와 연동할 경우
VITE_BACKEND_BASE_URL=http://localhost:4000
VITE_TOKEN_CACHE_MINUTES=5
```
- `VITE_TOKEN_CACHE_MINUTES`는 2~10 사이 값으로 자동 보정됩니다.
- 로컬에서만 사용할 경우 백엔드 설정은 비워두면 됩니다.

## Firebase 콘솔 설정 체크리스트
1. Authentication → Sign-in method에서 Email/Password, Google 활성화  
2. Authentication → Settings에서 `localhost` 등 개발 도메인 허용  
3. Firestore Database 생성 및 보안 규칙 확인  
4. Web App 등록 후 `.env`에 관련 키 값 복사

## 백엔드 연동 흐름
1. 백엔드 서버(`/health`, `/api/sensors/data`)가 실행 중인지 확인  
2. 디바이스 목록 화면 우상단 `BE 연동하기` 버튼 클릭  
3. 백엔드 주소 입력 후 Health 체크가 통과하면 Firestore에 저장  
4. 이후 MQTT 메시지를 받을 때마다 `/api/sensors/data`로 자동 전송

## 커스텀 학습 아이디어
- MQTT 메시지 스키마 확장 및 UI 표시 강화  
- 센서 데이터 차트 유형 추가(습도, 조도 등)  
- 백엔드 연동 실패 시 재시도 로직 도입  
- Firebase Cloud Functions 연계로 서버리스 확장 실습

필요한 경우 `DEPLOYMENT.md`와 백엔드 프로젝트 README를 참고하여 전체 아키텍처와 배포 전략까지 살펴보세요.
