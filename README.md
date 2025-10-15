# 🎓 AIoT Device Manager - 모던 클라우드 플랫폼 설계 실습

> **"모던클라우드 기반 서비스 플랫폼 설계, 구축 및 배포"** 교육과정 실습 프로젝트

## 📚 **교육 과정 개요**
**2일 집중 과정 (이론 7시간 + 실습 7시간)**
Firebase 기반 빠른 배포부터 AWS 기반 엔터프라이즈 아키텍처까지,
실무에서 직면하는 **"언제 어떤 기술을 선택해야 하는가?"**에 대한 명확한 답을 제공합니다.

### 🎯 **학습 목표**
1. **빠른 배포 전략**: Firebase + Amplify를 통한 서버리스 MVP 구축
2. **아키텍처 진화**: 간단한 시작에서 엔터프라이즈급 확장까지
3. **기술 선택 기준**: 각 기술의 장단점과 적용 시점 이해
4. **실무 역량**: 이론으로 학습한 내용을 실제 구현으로 체득

---

## 🚀 **실습 여정: Firebase → AWS Enterprise**

### **Phase 1: 빠른 MVP (Firebase Only)**
*"스타트업에서 IoT 서비스를 빠르게 런칭해야 합니다!"*

```
Frontend ← Firebase Auth ← Firestore
         ↑
   "서버 없이 모든 게 가능!"
```

**체험 내용**:
- 🔥 **Firebase의 마법**: 서버 구축 없이 인증 + 실시간 DB
- ⚡ **빠른 개발**: 하루 만에 완성되는 실시간 IoT 관리 시스템
- 🌐 **AWS Amplify**: 원클릭 배포의 편리함
- 💰 **비용 효율**: 사용량 기반 과금의 장점

### **Phase 2: 현실의 벽 체험**
*"서비스가 성장하면서 문제들이 생기기 시작합니다..."*

**한계 상황들**:
- 📊 복잡한 데이터 분석의 어려움
- 🔒 엔터프라이즈급 감사 로그 요구사항
- 🔗 외부 시스템(ERP, CRM) 연동 필요성
- ⚙️ 서버사이드 비즈니스 로직의 한계

### **Phase 3: Enterprise 아키텍처**
*"이제 진짜 확장 가능한 시스템을 만들어봅시다!"*

```
Frontend ← Firebase Auth ← NestJS Backend ← PostgreSQL
         ↑                      ↓
      Firestore              External APIs
    (실시간 데이터)           (ERP, Email, etc.)
```

**구현 내용**:
- 🏗️ **NestJS Backend**: TypeScript 기반 엔터프라이즈 API 서버
- 🐘 **PostgreSQL**: 관계형 데이터와 복잡한 쿼리 처리
- 🔄 **하이브리드 전략**: Firestore + RDS의 적재적소 활용
- 🐳 **Docker**: 컨테이너화를 통한 배포 표준화

---

## 💡 **핵심 학습 포인트**

### **기술적 역량**
- ✅ **Firebase 생태계**: Auth, Firestore, Hosting의 통합 활용
- ✅ **AWS 클라우드**: Amplify, RDS, EC2 배포 전략
- ✅ **백엔드 아키텍처**: NestJS + TypeORM + PostgreSQL
- ✅ **DevOps 기초**: Docker, 환경 분리, CI/CD 파이프라인

### **아키텍처 설계 철학**
- 🤔 **언제 Firebase만으로 충분한가?**
- 🤔 **언제 백엔드 서버가 필요한가?**
- 🤔 **데이터를 어떻게 분산 저장할 것인가?**
- 🤔 **확장성과 비용을 어떻게 균형맞출 것인가?**

### **실무 적용 능력**
- 📈 **점진적 확장**: MVP → 성장 → Enterprise급 전환
- 🔄 **기술 마이그레이션**: 레거시 시스템의 현대화 전략
- 💼 **비즈니스 가치**: 기술 선택이 비즈니스에 미치는 영향 이해

---

A real-time AIoT (Artificial Intelligence of Things) device management application built with Firebase, Vite, and Tailwind CSS.

## 🌟 Features

### Authentication
- Email/Password Authentication
- Google OAuth Sign-in
- Real-time Auth State Management
- User session persistence

### Device Management
- **Real-time Device Monitoring**: Live status updates across all connected sessions
- **Device CRUD Operations**: Add, update, and delete AIoT devices
- **Status Management**: Toggle between online/offline/error states
- **Device Filtering**: View all devices, or filter by online/offline status
- **Batch Operations**: Clear all offline devices at once
- **Device Statistics**: Real-time counters for online/offline devices

### Device Types Supported
- 🌡️ **Sensors**: Temperature, humidity, motion, light sensors
- ⚙️ **Actuators**: Motors, switches, valves, servo motors
- 🌐 **Gateways**: Communication hubs, protocol converters
- 📹 **Cameras**: Video surveillance, monitoring devices

### UI/UX Features
- Responsive design for mobile and desktop
- Korean language interface
- Real-time animations and transitions
- Empty state management
- Loading states and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd firebase-auth-sample-working
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Firebase Console Setup** ⚠️ **매우 중요!**

   **필수 설정:**

   a. **Enable Authentication**
   - Firebase Console → Authentication → Sign-in method
   - Email/Password 활성화
   - Google 활성화 (support email 설정 필요)

   b. **Authorized Domains 추가**
   - Firebase Console → Authentication → Settings → Authorized domains
   - `localhost` 추가 (개발 환경용)

   c. **Enable Firestore Database**
   - Firebase Console → Firestore Database
   - Create database
   - Start in production mode

   📖 **상세 가이드:** `FIREBASE_SETUP_GUIDE.md` 참조

5. **Start development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` to see the application.

## 🏗️ Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### AWS Amplify Deployment
This project includes AWS Amplify configuration (`amplify.yml`):
```bash
# Amplify will automatically use the amplify.yml configuration
# when connected to your repository
```

## 📁 Project Structure

```
aiot-device-manager-fe-working/
├── src/
│   ├── app.js                      # Main application logic
│   ├── AppManager.js               # Application manager
│   ├── config/
│   │   ├── firebase.config.js      # Firebase configuration
│   │   └── app.config.js           # ⭐ App personalization config
│   ├── components/                 # Reusable components
│   │   ├── DeviceAddForm.js
│   │   ├── MQTTManager.js
│   │   └── TemperatureChart.js
│   └── views/                      # View components
│       ├── AuthView.js             # Authentication view
│       ├── DeviceListView.js       # Device list view
│       └── DeviceDetailView.js     # Device detail view
├── styles/
│   └── style.css                   # Custom styles
├── public/
│   └── favicon.svg                 # App favicon
├── index.html                      # Entry point
├── vite.config.js                  # Vite configuration
├── amplify.yml                     # AWS Amplify config
├── PERSONALIZATION_GUIDE.md        # ⭐ Personalization guide
└── package.json                    # Dependencies
```

## 🔧 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS (CDN)
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: AWS Amplify
- **Real-time**: Firestore onSnapshot listeners
- **Architecture**: View-based pattern

## 📖 Documentation

- 📘 **[Firebase Setup Guide](FIREBASE_SETUP_GUIDE.md)** - Firebase Console 설정 가이드
- 📕 **[Deployment Guide](DEPLOYMENT.md)** - AWS Amplify 배포 가이드
- 🎨 **[Personalization Guide](PERSONALIZATION_GUIDE.md)** - 개인화 설정 가이드 (교육생용)

## 🎨 Personalization (교육생용)

이 프로젝트는 교육용으로 설계되어 **쉽게 개인화**할 수 있습니다!

### 빠른 개인화 가이드

1. **애플리케이션 이름 변경**
   - 파일: `src/config/app.config.js`
   - 변경: `appName: "나의 IoT 관리자"`

2. **MQTT 토픽 프리픽스 변경** (중요!)
   - 파일: `src/config/app.config.js`
   - 변경: `topicPrefix: "본인이름/kiot"`
   - 다른 수강생과 중복되지 않도록 반드시 변경하세요

3. **개발자 정보 입력**
   - 파일: `src/config/app.config.js`
   - `developer` 섹션 수정

4. **테마 색상 변경** (선택)
   - 파일: `src/config/app.config.js`
   - `theme` 섹션에서 색상 변경 (예: `primary: "purple"`)

📖 **상세 가이드**: [PERSONALIZATION_GUIDE.md](PERSONALIZATION_GUIDE.md) 참조

### 개인화 가능한 항목들

- ✅ 앱 이름 및 설명
- ✅ 개발자 정보
- ✅ 테마 색상 (Tailwind CSS 색상)
- ✅ MQTT 브로커 및 토픽 설정
- ✅ 디바이스 타입 커스터마이징
- ✅ 언어 설정 (한국어/영어)
- ✅ 차트 스타일
- ✅ UI 텍스트 및 라벨
- ✅ 기능 ON/OFF 토글

## 📱 Usage

1. **Authentication**: Sign up or log in using email/password or Google OAuth
2. **Add Devices**: Enter device name, select type, and specify location
3. **Monitor Status**: View real-time device status updates
4. **Manage Devices**: Toggle status between online/offline/error states
5. **Filter View**: Use filter buttons to view specific device states
6. **Batch Actions**: Clear all offline devices with one click

## 🔒 Security Features

- User data isolation (each user sees only their devices)
- XSS protection with HTML escaping
- Firebase security rules for data access control
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🎓 **교육 과정 완료 후 얻게 되는 것**

### **즉시 적용 가능한 실무 스킬**
- ✅ Firebase 기반 빠른 프로토타입 개발 능력
- ✅ AWS 클라우드 서비스 배포 및 운영 경험
- ✅ 엔터프라이즈급 백엔드 API 설계 및 구현
- ✅ Docker를 활용한 컨테이너 기반 배포 전략

### **아키텍처 설계 역량**
- 🏗️ **점진적 확장 전략**: MVP에서 Enterprise급까지의 자연스러운 진화
- 🔄 **하이브리드 접근법**: 각 기술의 장점을 살린 최적의 조합
- 📊 **데이터 전략**: 실시간성 vs 일관성, 비용 vs 성능의 균형점
- 🚀 **배포 전략**: 개발 환경부터 프로덕션까지의 완전한 파이프라인

### **향후 학습 로드맵**
이 과정을 통해 다음 단계 학습을 위한 탄탄한 기반을 마련하게 됩니다:
- 🌐 **Kubernetes 배포**: 컨테이너 오케스트레이션
- 📈 **마이크로서비스**: 서비스 분해 및 관리 전략
- 🔄 **CI/CD 파이프라인**: 자동화된 배포 시스템
- 📊 **모니터링 & 로깅**: 운영 환경에서의 시스템 관찰성

---

## 📞 **교육 문의**

이 프로젝트는 **"모던클라우드 기반 서비스 플랫폼 설계, 구축 및 배포"** 교육과정의 실습 자료입니다.
실무 중심의 체계적인 클라우드 아키텍처 학습을 원하시면 교육 과정에 참여해보세요!

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

