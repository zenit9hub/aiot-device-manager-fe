# 🎨 개인화 설정 가이드

KIoT Device Manager 교육용 프로젝트의 개인화 설정 가이드입니다.
각 수강생은 이 가이드를 참고하여 프로젝트를 자신만의 스타일로 커스터마이징할 수 있습니다.

---

## 📋 목차

1. [기본 설정](#1-기본-설정)
2. [Firebase 설정](#2-firebase-설정)
3. [앱 개인화 설정](#3-앱-개인화-설정)
4. [추천 개인화 항목](#4-추천-개인화-항목)
5. [고급 커스터마이징](#5-고급-커스터마이징)

---

## 1. 기본 설정

### 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone [repository-url]
cd aiot-device-manager-fe-working

# 의존성 설치
npm install
```

---

## 2. Firebase 설정

### `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 Firebase 프로젝트 설정을 입력합니다.

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

> ⚠️ **중요**: `.env` 파일은 `.gitignore`에 포함되어 있으므로 Git에 커밋되지 않습니다.

### Firebase 프로젝트 설정 방법

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 설정 > 일반 > 앱 추가 > 웹 앱 선택
4. 표시된 설정 값을 `.env` 파일에 복사

---

## 3. 앱 개인화 설정

### `src/config/app.config.js` 파일 수정

이 파일에서 대부분의 UI/UX 관련 개인화가 가능합니다.

#### 3.1 기본 정보 변경

```javascript
export const appConfig = {
  // 애플리케이션 이름 (브라우저 탭, 헤더에 표시)
  appName: "나의 IoT 관리자",  // 👈 여기를 수정하세요

  // 애플리케이션 설명
  appDescription: "나만의 스마트홈 관리 시스템",

  // 개발자 정보
  developer: {
    name: "홍길동",           // 👈 여기를 수정하세요
    email: "hong@example.com",
    organization: "KIoT Academy",
  },
  // ...
};
```

**적용 결과:**
- 브라우저 탭 제목이 변경됩니다
- 로그인 화면 헤더가 변경됩니다
- 메인 화면 헤더가 변경됩니다

---

## 4. 추천 개인화 항목

### ✅ 필수 개인화 항목

#### 4.1 애플리케이션 이름 변경 ⭐⭐⭐

**위치**: `src/config/app.config.js`

```javascript
appName: "KIoT Device Manager Zenit",  // 기본값
```

**변경 예시:**
```javascript
appName: "홍길동의 스마트홈",
appName: "My IoT Dashboard",
appName: "AIoT Manager Pro",
```

**적용 범위:**
- 브라우저 탭 제목
- 로그인 화면 타이틀
- 메인 대시보드 헤더

---

#### 4.2 MQTT 토픽 프리픽스 변경 ⭐⭐⭐

**위치**: `src/config/app.config.js`

```javascript
mqtt: {
  topicPrefix: "zenit/kiot",  // 기본값
}
```

**변경 예시:**
```javascript
topicPrefix: "홍길동/home",
topicPrefix: "student01/devices",
topicPrefix: "myname/iot",
```

**중요성:**
- 다른 수강생과 MQTT 토픽이 겹치지 않도록 **반드시 변경**해야 합니다
- 한글, 영문, 숫자 조합 가능 (특수문자는 `/`만 사용 권장)

---

#### 4.3 개발자 정보 입력 ⭐⭐

**위치**: `src/config/app.config.js`

```javascript
developer: {
  name: "Zenit",                    // 👈 이름 변경
  email: "zenit@example.com",       // 👈 이메일 변경
  organization: "KIoT Academy",     // 👈 소속 변경 (선택)
},
```

---

### 🎨 선택적 개인화 항목

#### 4.4 테마 색상 변경 ⭐⭐

**위치**: `src/config/app.config.js`

```javascript
theme: {
  primary: "blue",      // 주요 버튼, 링크 (파란색)
  secondary: "gray",    // 보조 요소 (회색)
  success: "green",     // 성공 메시지 (초록색)
  danger: "red",        // 경고, 삭제 버튼 (빨간색)
  warning: "yellow",    // 경고 메시지 (노란색)
},
```

**변경 가능한 색상 (Tailwind CSS):**
- `slate`, `gray`, `zinc`, `neutral`, `stone`
- `red`, `orange`, `amber`, `yellow`, `lime`, `green`
- `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`
- `violet`, `purple`, `fuchsia`, `pink`, `rose`

**예시:**
```javascript
theme: {
  primary: "purple",    // 보라색 테마
  secondary: "slate",
  success: "emerald",
  danger: "rose",
  warning: "amber",
},
```

---

#### 4.5 디바이스 타입 커스터마이징 ⭐⭐

**위치**: `src/config/app.config.js`

```javascript
device: {
  types: [
    { value: "sensor", label: "센서" },
    { value: "actuator", label: "액추에이터" },
    { value: "gateway", label: "게이트웨이" },
    { value: "camera", label: "카메라" },
    // 👇 필요한 타입 추가
    { value: "light", label: "조명" },
    { value: "lock", label: "스마트락" },
  ],
}
```

**스마트홈 예시:**
```javascript
types: [
  { value: "light", label: "조명" },
  { value: "thermostat", label: "온도조절기" },
  { value: "lock", label: "도어락" },
  { value: "camera", label: "CCTV" },
  { value: "speaker", label: "스피커" },
],
```

---

#### 4.6 언어 설정 변경 ⭐

**위치**: `src/config/app.config.js`

```javascript
locale: "ko",  // "ko" (한국어) 또는 "en" (영어)
```

**영어로 변경:**
```javascript
locale: "en",
```

> 📝 **참고**: 영어 라벨은 `labels.en` 섹션에 이미 정의되어 있습니다.

---

#### 4.7 MQTT 브로커 변경 ⭐⭐

**위치**: `src/config/app.config.js`

이제 MQTT 브로커를 **간편하게 옵션으로 선택**할 수 있습니다!

```javascript
mqtt: {
  brokerOption: "broker-option1",  // 👈 여기만 변경하세요!

  // 사용 가능한 옵션들:
  // broker-option1: HiveMQ Public Broker (기본)
  // broker-option2: HiveMQ Public Broker (SSL)
  // broker-option3: Eclipse Public Broker
  // broker-option4: Mosquitto Public Broker
  // broker-option5: Local Mosquitto Broker (로컬 설치 필요)
}
```

**변경 예시:**
```javascript
// Eclipse 브로커 사용하기
brokerOption: "broker-option3",

// 로컬 Mosquitto 브로커 사용하기 (직접 설치한 경우)
brokerOption: "broker-option5",

// SSL 사용하기 (보안 연결)
brokerOption: "broker-option2",
```

**브로커 상세 정보:**

| 옵션 | 이름 | URL | 설명 |
|------|------|-----|------|
| broker-option1 | HiveMQ Public | `ws://broker.hivemq.com:8000/mqtt` | 무료 공용 브로커 (기본) |
| broker-option2 | HiveMQ Public (SSL) | `wss://broker.hivemq.com:8884/mqtt` | 보안 연결 |
| broker-option3 | Eclipse Public | `ws://mqtt.eclipseprojects.io:80/mqtt` | Eclipse 재단 |
| broker-option4 | Mosquitto Public | `ws://test.mosquitto.org:8080/mqtt` | 테스트용 |
| broker-option5 | Local Mosquitto | `ws://localhost:9001/mqtt` | 로컬 서버 |

**커스텀 브로커 추가 방법:**

기존 옵션이 맞지 않다면 직접 추가할 수 있습니다:

```javascript
mqtt: {
  brokerOption: "broker-option6",  // 새로운 옵션

  brokerOptions: {
    // ... 기존 옵션들 ...
    "broker-option6": {
      name: "나만의 브로커",
      url: "ws://my-broker.com:8000/mqtt",
      description: "커스텀 MQTT 브로커",
    },
  },
}
```

---

#### 4.8 차트 스타일 변경 ⭐

**위치**: `src/config/app.config.js`

```javascript
chart: {
  maxDataPoints: 20,                        // 표시할 최대 데이터 수
  lineColor: "rgb(59, 130, 246)",          // 선 색상 (blue-500)
  backgroundColor: "rgba(59, 130, 246, 0.1)", // 배경 색상
  animation: true,                          // 애니메이션 활성화
},
```

**보라색 테마 예시:**
```javascript
chart: {
  maxDataPoints: 30,
  lineColor: "rgb(168, 85, 247)",           // purple-500
  backgroundColor: "rgba(168, 85, 247, 0.1)",
  animation: true,
},
```

---

#### 4.9 기능 ON/OFF 전환 ⭐

**위치**: `src/config/app.config.js`

```javascript
features: {
  enableGoogleAuth: true,           // Google 로그인
  enableEmailAuth: true,            // 이메일 로그인
  enableMQTT: true,                 // MQTT 실시간 데이터
  enableTemperatureChart: true,     // 온도 차트
},
```

**이메일 로그인만 사용:**
```javascript
features: {
  enableGoogleAuth: false,    // Google 로그인 비활성화
  enableEmailAuth: true,
  enableMQTT: true,
  enableTemperatureChart: true,
},
```

---

## 5. 고급 커스터마이징

### 5.1 UI 텍스트 변경

**위치**: `src/config/app.config.js` > `labels.ko` 섹션

```javascript
labels: {
  ko: {
    auth: {
      title: "로그인",              // 👈 로그인 제목
      loginButton: "로그인",
      signupButton: "회원가입",
      // ...
    },
    device: {
      title: "디바이스 관리",       // 👈 디바이스 섹션 제목
      add: "디바이스 추가",
      // ...
    },
  }
}
```

### 5.2 파비콘 변경

**파일**: `/public/favicon.svg`

1. 새로운 파비콘 이미지 준비 (SVG, PNG, ICO)
2. `/public/favicon.svg` 파일 교체
3. 또는 `index.html`에서 경로 변경:

```html
<link rel="icon" type="image/svg+xml" href="/public/your-favicon.svg">
```

### 5.3 스타일 커스터마이징

**파일**: `index.html` > `<style>` 섹션

Tailwind CSS 클래스를 수정하여 더 세밀한 스타일 변경 가능:

```html
<style>
  .filter-button.active {
    @apply bg-purple-500 text-white;  /* 파란색 → 보라색 */
  }
  /* ... */
</style>
```

---

## 📊 개인화 체크리스트

완료한 항목에 체크하세요!

### 필수 항목
- [ ] Firebase `.env` 파일 생성 및 설정
- [ ] 애플리케이션 이름 변경
- [ ] MQTT 토픽 프리픽스 변경 (중복 방지)
- [ ] 개발자 정보 입력

### 선택 항목
- [ ] 테마 색상 변경
- [ ] 디바이스 타입 커스터마이징
- [ ] 언어 설정 변경
- [ ] MQTT 브로커 변경
- [ ] 차트 스타일 변경
- [ ] 기능 ON/OFF 조정
- [ ] UI 텍스트 변경
- [ ] 파비콘 변경

---

## 🎯 실습 예제

### 예제 1: "스마트홈 관리자" 테마

```javascript
// src/config/app.config.js
export const appConfig = {
  appName: "홍길동의 스마트홈",
  appDescription: "우리집 스마트 디바이스 통합 관리",

  developer: {
    name: "홍길동",
    email: "hong@smarthome.com",
    organization: "My Smart Home",
  },

  theme: {
    primary: "indigo",
    secondary: "gray",
    success: "emerald",
    danger: "rose",
    warning: "amber",
  },

  device: {
    types: [
      { value: "light", label: "스마트 조명" },
      { value: "thermostat", label: "온도조절기" },
      { value: "lock", label: "스마트 도어락" },
      { value: "camera", label: "보안 카메라" },
      { value: "speaker", label: "AI 스피커" },
    ],
  },

  mqtt: {
    brokerOption: "broker-option1",  // HiveMQ 사용
    topicPrefix: "hong/smarthome",
  },
};
```

### 예제 2: "공장 IoT 모니터링" 테마

```javascript
// src/config/app.config.js
export const appConfig = {
  appName: "Factory IoT Monitor",
  appDescription: "제조 공정 실시간 모니터링 시스템",

  developer: {
    name: "김철수",
    email: "kim@factory.com",
    organization: "Smart Factory",
  },

  theme: {
    primary: "slate",
    secondary: "zinc",
    success: "green",
    danger: "red",
    warning: "orange",
  },

  device: {
    types: [
      { value: "plc", label: "PLC" },
      { value: "sensor", label: "공정 센서" },
      { value: "robot", label: "로봇 팔" },
      { value: "conveyor", label: "컨베이어" },
      { value: "monitor", label: "상태 모니터" },
    ],
  },

  mqtt: {
    brokerOption: "broker-option5",  // 로컬 브로커 사용 (공장 내부망)
    topicPrefix: "factory/line01",
  },

  locale: "en",
};
```

---

## 🆘 문제 해결

### Q1. 설정을 변경했는데 반영이 안 돼요
**A:** 브라우저를 완전히 새로고침하세요 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### Q2. MQTT 연결이 안 돼요
**A:**
1. `mqtt.topicPrefix`가 올바른지 확인
2. 브로커 URL이 올바른지 확인
3. 방화벽 설정 확인

### Q3. Firebase 인증이 안 돼요
**A:**
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. Firebase Console에서 인증 방법 활성화 확인
3. 개발 서버 재시작 (`npm run dev`)

### Q4. 색상이 적용되지 않아요
**A:** Tailwind CSS 색상명을 정확히 입력했는지 확인 (예: "blue", "indigo", "purple")

---

## 📚 추가 학습 자료

- [Tailwind CSS 색상 팔레트](https://tailwindcss.com/docs/customizing-colors)
- [Firebase 문서](https://firebase.google.com/docs)
- [MQTT 프로토콜 가이드](http://mqtt.org/)
- [Chart.js 문서](https://www.chartjs.org/)

---

## 💡 팁

1. **버전 관리**: Git을 사용하여 변경사항을 추적하세요
   ```bash
   git add .
   git commit -m "개인화 설정 완료"
   ```

2. **백업**: 원본 설정을 주석으로 남겨두면 나중에 참고하기 좋습니다
   ```javascript
   // appName: "KIoT Device Manager Zenit",  // 원본
   appName: "나의 IoT 관리자",  // 수정본
   ```

3. **점진적 변경**: 한 번에 하나씩 변경하고 테스트하세요

4. **동료와 공유**: 멋진 테마를 만들었다면 팀원들과 공유해보세요!

---

## 📞 지원

문제가 있거나 질문이 있으면 강사에게 문의하세요.

**Happy Coding! 🚀**

