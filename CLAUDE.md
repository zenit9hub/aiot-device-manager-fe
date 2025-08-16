# CLAUDE.md

## 🎓 **교육 프로젝트 개요**

이 프로젝트는 **"모던클라우드 기반 서비스 플랫폼 설계, 구축 및 배포"** 교육과정의 실습 자료입니다.

### **교육 목적**
**2일 집중 과정 (이론 7시간 + 실습 7시간)**을 통해 Firebase 기반 빠른 배포 전략부터 AWS 기반 엔터프라이즈 아키텍처까지, **점진적 확장의 실무 경험**을 제공합니다.

### **핵심 학습 철학**
> *"왜 이 기술을 선택해야 하는가?"*에 대한 명확한 답을 **직접 체험**을 통해 습득

**학습 여정**:
```
Firebase Only MVP → 한계 체험 → Enterprise 아키텍처
    (빠른 배포)     → (현실의 벽) → (확장 가능한 해결책)
```

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server on port 5173
- `npm run build` - Build production bundle to `dist/` directory  
- `npm run preview` - Preview production build locally

## Project Architecture

This is a Firebase **AIoT Device Manager** application built with vanilla JavaScript, Vite, Firebase Authentication, and Firestore. The architecture follows a client-side pattern with real-time data synchronization for IoT device management.

### Core Files
- `src/app.js` - Main application logic with Firebase auth and Firestore device operations
- `src/config/firebase.config.js` - Firebase configuration using Vite environment variables
- `index.html` - Entry point with authentication and device management UI components
- `vite.config.js` - Vite bundler configuration
- `styles/style.css` - Custom styles for device management interface

### Authentication & Data Flow
The app implements Firebase v9+ modular SDK with:
- **Authentication**: Email/password and Google OAuth authentication
- **Real-time Data**: Firestore `onSnapshot` listeners for real-time device synchronization
- **User Isolation**: Each user's devices are stored with their `userId` for data isolation
- **State Management**: Global variables track current user, devices, and UI filter state

### Firestore Data Structure
```
devices/ (collection)
  ├── {deviceId}/ (document)
      ├── name: string
      ├── type: string (sensor, actuator, gateway, camera)
      ├── status: string (online, offline, error)
      ├── location: string
      ├── batteryLevel: number (0-100)
      ├── lastSeen: timestamp
      ├── userId: string
      └── createdAt: timestamp
```

### AIoT Device Features
- **CRUD Operations**: Add, update status, delete devices
- **Real-time Sync**: All users see their devices update in real-time across sessions
- **Device Filtering**: View all, online, or offline devices
- **Device Status Management**: Toggle between online/offline/error states
- **Batch Operations**: Clear all offline devices at once
- **Device Monitoring**: Track battery levels, last seen timestamps, locations
- **User-specific Data**: Each user only sees their own devices

### UI State Management
- Authentication section is hidden when user is logged in
- Device management section is shown only for authenticated users
- Real-time listeners are set up/torn down based on auth state
- Filter buttons update active state and re-render device list
- Device statistics (online/offline counts) update automatically

### Device Types and Features
- **Sensors**: Temperature, humidity, motion sensors, etc.
- **Actuators**: Motors, switches, valves, etc.
- **Gateways**: Central communication hubs
- **Cameras**: Video surveillance devices

### Environment Configuration
Firebase config requires both Authentication and Firestore:
- Copy `.env.example` to `.env` and populate with Firebase project credentials
- Ensure Firestore is enabled in Firebase Console
- Set up Authentication providers (Email/Password, Google) in Firebase Console

## Key Implementation Notes

- All Firestore operations use async/await with error handling
- Real-time listeners are properly cleaned up on auth state changes
- Device rendering uses string templates with event handlers and animations
- Global functions are exposed on `window` object for inline event handlers
- Korean UI text for better user experience
- Tailwind CSS with custom styles for device-specific components
- XSS protection with HTML escaping for user input
- Responsive design for mobile and desktop usage
- AWS Amplify deployment configuration included (`amplify.yml`)

## 🚀 **교육 과정별 아키텍처 진화**

### **Phase 1: Firebase-Only MVP (현재 구현됨)**
**학습 목표**: *"서버 없이도 이런 게 가능해!"*

```
Frontend ← Firebase Auth ← Firestore
         ↑
   "빠른 배포의 마법"
```

**체험 내용**:
- ⚡ 하루 만에 완성되는 실시간 IoT 관리 시스템
- 🔥 Firebase의 통합 생태계 (Auth + Firestore + Hosting)
- 🌐 AWS Amplify 원클릭 배포
- 💰 사용량 기반 과금의 경제성

### **Phase 2: 현실의 한계 체험**
**학습 목표**: *"왜 백엔드가 필요한지 깨닫기"*

**한계 상황 시뮬레이션**:
- 📊 복잡한 데이터 분석 요구사항 (Firestore 쿼리 제한)
- 🔒 엔터프라이즈급 감사 로그 및 권한 관리
- 🔗 외부 시스템(ERP, 회계) 연동 필요성
- ⚙️ 서버사이드 비즈니스 로직의 한계
- 📧 이메일 발송, 배치 처리 등의 백그라운드 작업

### **Phase 3: Enterprise 아키텍처 구축**
**학습 목표**: *"확장 가능한 해결책 구현"*

```
Frontend ← Firebase Auth ← NestJS Backend ← PostgreSQL
         ↑                      ↓
      Firestore              External APIs
    (실시간 데이터)           (ERP, Email, etc.)
```

**구현 범위**:
- 🏗️ **NestJS Backend**: TypeScript 기반 엔터프라이즈 API 서버
- 🐘 **PostgreSQL (RDS)**: 사용자 프로필 및 분석 데이터 저장
- 🔄 **하이브리드 데이터 전략**: 
  - Firestore: 실시간 디바이스 상태, MQTT 데이터, 알림
  - RDS: 사용자 프로필, 디바이스 메타데이터, 사용 통계, 감사 로그
- 🔐 **Firebase Token 검증**: Backend API 인증
- 🐳 **Docker 컨테이너화**: 표준화된 배포 전략

### **Phase 4: 향후 확장 계획 (선택적)**
**학습 목표**: *"Kubernetes까지의 로드맵 이해"*

- 🌐 **Kubernetes 배포**: 컨테이너 오케스트레이션
- 📈 **마이크로서비스**: 서비스 분해 및 관리
- 🔄 **CI/CD 파이프라인**: GitHub Actions 자동화
- 📊 **모니터링**: Prometheus + Grafana
- ⚡ **AWS Lambda**: 특정 기능의 서버리스 분리

---

## 🎯 **교육과정에서 체득하는 핵심 역량**

### **기술적 역량**
- ✅ **Firebase 생태계**: Auth, Firestore, Hosting 통합 활용
- ✅ **AWS 클라우드**: Amplify, RDS, EC2 실무 경험
- ✅ **백엔드 아키텍처**: NestJS + TypeORM + PostgreSQL
- ✅ **DevOps 기초**: Docker, 환경 분리, 배포 자동화

### **아키텍처 설계 철학**
- 🤔 **적절한 기술 선택**: 언제 Firebase vs Backend API?
- 🤔 **데이터 분산 전략**: 실시간성 vs 일관성의 트레이드오프
- 🤔 **점진적 확장**: MVP에서 Enterprise급까지의 자연스러운 진화
- 🤔 **비용 최적화**: 기술 선택이 비즈니스에 미치는 영향

**Related Repository**: `aiot-device-manager-be` (Backend API - Phase 3에서 구현)