# AIoT Device Manager 학습 리포지토리

두 개의 예제 프로젝트를 통해 **Firebase 기반 MVP**부터 **커스텀 백엔드 연동**까지 단계별로 경험하며, IoT 서비스가 성장할 때 필요한 기술 의사결정을 연습할 수 있습니다.

## 폴더 구성
- `aiot-device-manager-fe-working/` – Vite + Firebase를 활용한 프론트엔드 실습
- `aiot-device-manager-be-working/` – Express + MySQL + Firebase Admin 기반 백엔드 실습
- `CLOUD_DEPLOYMENT_GUIDE.md` – 과정 전체의 배포 및 확장 전략 정리

## 핵심 학습 포인트
- **빠른 MVP 구성**: Firebase Auth · Firestore · Hosting을 활용해 서버 없이도 실시간 IoT 관리 화면을 만들 수 있습니다.
- **확장형 아키텍처 체험**: Firebase ID 토큰을 커스텀 백엔드에서 검증하고, MySQL로 영구 저장하는 과정을 학습합니다.
- **운영 관점 점검**: Docker Compose, 환경 변수 템플릿, OpenAPI 문서를 통해 실무적인 배포·운영 포인트를 익힙니다.

## 프로젝트 하이라이트
### 프론트엔드 (`aiot-device-manager-fe-working/`)
- Vite + Tailwind + Firebase 구성
- 이메일/Google 로그인, 실시간 Firestore 동기화
- MQTT 메시지 구독 및 차트 시각화
- “BE 연동하기” 버튼으로 백엔드 Health 체크 후 엔드포인트 저장
- Firebase ID 토큰을 2~10분 범위에서 자동 캐싱하여 API 호출 효율화

### 백엔드 (`aiot-device-manager-be-working/`)
- Express + TypeScript + Firebase Admin SDK
- `/api/sensors/data` 단일 엔드포인트로 센서 데이터 수집
- MySQL 스키마 및 Docker Compose 제공
- 사용자/디바이스/Sensor Reading append-only 저장 구조
- OpenAPI 명세와 로깅, 토큰 검증 미들웨어 포함

## 빠른 시작
### 1. 프론트엔드
```bash
cd aiot-device-manager-fe-working
npm install
cp .env.example .env   # Firebase 웹 앱 설정 입력
npm run dev
```
필수 Firebase 콘솔 설정(인증 활성화, 허용 도메인 추가 등)은 하위 폴더 `README.md`를 참고하세요.

### 2. 백엔드
```bash
cd aiot-device-manager-be-working
npm install
cp .env.example .env   # Firebase Admin & MySQL 정보 입력
docker compose up -d   # MySQL 실행
npm run dev
```
`.env`에는 Firebase 서비스 계정 이메일·프라이빗키와 DB 접속 정보를 등록해야 하며, 자세한 설명은 하위 폴더 `README.md`에 있습니다.

## 권장 실습 시나리오
1. **MVP 완성** – 프론트엔드만으로 디바이스 등록·MQTT 모니터링 구현
2. **백엔드 연동** – “BE 연동하기” 버튼으로 로컬 백엔드 `/health` 검증 후 엔드포인트 저장, 센서 데이터 DB 적재 확인
3. **심화 확장** – 추가 API, 데이터 분석, 알림 처리 등을 자유롭게 설계해보며 `CLOUD_DEPLOYMENT_GUIDE.md`를 참고해 배포 시나리오까지 검토

## 참고 자료
- `CLOUD_DEPLOYMENT_GUIDE.md`: 전체 아키텍처, 배포 전략, 심화 학습 트랙
- 각 하위 프로젝트의 `README.md`: 환경 변수, 실행 방법, 구조 설명
- 필요에 따라 두 프로젝트를 독립적으로 실행하거나 동일 Firebase 프로젝트로 묶어 통합 실습을 진행할 수 있습니다.
